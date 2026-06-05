"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const OWNER_PIN = "1234";
const ALL_TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00",
];
const DAY_NAMES_FULL = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const DAY_NAMES_SHORT = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// Función para obtener fecha en zona horaria Argentina (UTC-3)
function getArgentinaDate(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3 * 3600000));
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function getWeekDates() {
  const today = getArgentinaDate();
  const day = today.getDay();
  const monday = addDays(today, day === 0 ? -6 : 1 - day);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

type Appointment = {
  id: string; client_name: string; client_phone: string;
  service_name: string; professional_name: string;
  date: string; time: string; duration_minutes: number; price: number; status: string;
};
type Service = { name: string; price: number; active: boolean; };
type BlockedSlot = { date: string; time: string };

export default function PanelPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<"turnos"|"servicios"|"horarios"|"facturacion">("turnos");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all"|"pending"|"today">("all");
  const [selectedDate, setSelectedDate] = useState(formatDate(getArgentinaDate()));
  const [weekDates] = useState(getWeekDates());
  const [services, setServices] = useState<Service[]>([
    { name: "Manicuria Semipermanente", price: 8000, active: true },
    { name: "Pedicuría Completa", price: 9500, active: true },
    { name: "Limpieza Facial Profunda", price: 12000, active: true },
    { name: "Depilación Piernas", price: 7500, active: true },
  ]);
  const [enabledSlots, setEnabledSlots] = useState<string[]>(ALL_TIME_SLOTS);
  const [blockedSlotsByDay, setBlockedSlotsByDay] = useState<BlockedSlot[]>([]);
  const [selectedDayForBlocking, setSelectedDayForBlocking] = useState<string>("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [moveModal, setMoveModal] = useState<{ open: boolean; apt: Appointment | null }>({ open: false, apt: null });
  const [moveDate, setMoveDate] = useState("");
  const [moveTime, setMoveTime] = useState("");
  const [movingId, setMovingId] = useState(false);
  const [statsToday, setStatsToday] = useState(0);
  const [statsPending, setStatsPending] = useState(0);
  const [statsRevenue, setStatsRevenue] = useState(0);
  const [topServices, setTopServices] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<"day"|"week"|"month">("month");
  const [billingData, setBillingData] = useState<{ date: string; total: number; appointments: Appointment[] }[]>([]);

  const loadAppointments = useCallback(async () => {
    const { data } = await supabase.from("appointments").select("*").order("date").order("time");
    if (data) {
      const all = data as Appointment[];
      setAppointments(all.filter(a => a.status !== "completed" && a.status !== "cancelled"));
      setCompletedAppointments(all.filter(a => a.status === "completed" || a.status === "cancelled"));
      const today = formatDate(getArgentinaDate());
      setStatsToday(all.filter(a => a.date === today && a.status !== "cancelled").length);
      setStatsPending(all.filter(a => a.status === "pending").length);
      const thisMonth = formatDate(getArgentinaDate()).slice(0, 7);
      setStatsRevenue(all.filter(a => a.date.startsWith(thisMonth) && a.status === "confirmed").reduce((sum: number, a: Appointment) => sum + (a.price || 0), 0));
      const svcMap: Record<string, { count: number; revenue: number }> = {};
      all.forEach((a: Appointment) => {
        if (a.status === "completed" || a.status === "confirmed") {
          if (!svcMap[a.service_name]) svcMap[a.service_name] = { count: 0, revenue: 0 };
          svcMap[a.service_name].count++;
          svcMap[a.service_name].revenue += a.price || 0;
        }
      });
      setTopServices(Object.entries(svcMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 4));
    }
  }, []);

  useEffect(() => { if (authenticated) loadAppointments(); }, [authenticated, loadAppointments]);

  useEffect(() => {
    if (!authenticated) return;
    const generateBillingData = () => {
      const allCompleted = [...appointments, ...completedAppointments].filter(a => a.status === "completed");
      if (billingPeriod === "day") {
        const today = formatDate(getArgentinaDate());
        const dayData = allCompleted.filter(a => a.date === today);
        setBillingData([{ date: "Hoy", total: dayData.reduce((s, a) => s + (a.price || 0), 0), appointments: dayData }]);
      } else if (billingPeriod === "week") {
        const weekData: Record<string, { total: number; appointments: Appointment[] }> = {};
        weekDates.forEach(d => {
          const ds = formatDate(d);
          const dayApps = allCompleted.filter(a => a.date === ds);
          weekData[ds] = { total: dayApps.reduce((s, a) => s + (a.price || 0), 0), appointments: dayApps };
        });
        setBillingData(Object.entries(weekData).map(([date, data]) => ({ date: formatDisplayDate(date), ...data })));
      } else {
        const monthData: Record<string, { total: number; appointments: Appointment[] }> = {};
        allCompleted.forEach(a => {
          const monthKey = a.date.slice(0, 7);
          if (!monthData[monthKey]) monthData[monthKey] = { total: 0, appointments: [] };
          monthData[monthKey].total += a.price || 0;
          monthData[monthKey].appointments.push(a);
        });
        setBillingData(Object.entries(monthData).map(([date, data]) => ({ date, ...data })).sort((a, b) => b.date.localeCompare(a.date)));
      }
    };
    generateBillingData();
  }, [authenticated, appointments, completedAppointments, billingPeriod, weekDates]);

  function handlePinSubmit() {
    if (pin === OWNER_PIN) { setAuthenticated(true); setPinError(false); }
    else { setPinError(true); setPin(""); }
  }

  const getFilteredAppointments = () => {
    const dayAppointments = appointments.filter(a => a.date === selectedDate);
    if (filter === "pending") return dayAppointments.filter(a => a.status === "pending");
    if (filter === "today") return dayAppointments.filter(a => a.status === "confirmed");
    return dayAppointments;
  };

  const filteredAppointments = getFilteredAppointments();

  async function confirmAppointment(apt: Appointment) {
    await supabase.from("appointments").update({ status: "confirmed" }).eq("id", apt.id);
    loadAppointments();
    const [y, m, d] = apt.date.split("-");
    const msg = encodeURIComponent(
      `✅ ¡Turno Confirmado! - Beauty Divina\n\nHola ${apt.client_name} 👋\nTu turno ha sido *confirmado*:\n\n` +
      `💅 ${apt.service_name}\n👩‍💼 ${apt.professional_name}\n📆 ${d}/${m}/${y} a las ${apt.time}\n📍 Cairo 83, Monte Grande\n\n¡Te esperamos! ✨💕`
    );
    window.open(`https://wa.me/${apt.client_phone}?text=${msg}`, "_blank");
  }

  async function completeAppointment(apt: Appointment) {
    await supabase.from("appointments").update({ status: "completed" }).eq("id", apt.id);
    loadAppointments();
  }

  async function moveAppointment() {
    if (!moveModal.apt || !moveDate || !moveTime) return;
    setMovingId(true);
    await supabase.from("appointments").update({ date: moveDate, time: moveTime, status: "confirmed" }).eq("id", moveModal.apt.id);
    const apt = moveModal.apt;
    const [y, m, d] = moveDate.split("-");
    const msg = encodeURIComponent(
      `📅 Turno Reprogramado - Beauty Divina\n\nHola ${apt.client_name} 👋\nTu turno fue *reprogramado*:\n\n` +
      `💅 ${apt.service_name}\n👩‍💼 ${apt.professional_name}\n📆 Nueva fecha: ${d}/${m}/${y} a las ${moveTime}\n📍 Cairo 83, Monte Grande\n\nSi tenés dudas, escribinos 💕`
    );
    window.open(`https://wa.me/${apt.client_phone}?text=${msg}`, "_blank");
    setMoveModal({ open: false, apt: null });
    setMovingId(false);
    loadAppointments();
  }

  const isSlotBlockedForDay = (date: string, time: string) => {
    return blockedSlotsByDay.some(bs => bs.date === date && bs.time === time);
  };

  const toggleSlotForDay = (date: string, time: string) => {
    if (isSlotBlockedForDay(date, time)) {
      setBlockedSlotsByDay(prev => prev.filter(bs => !(bs.date === date && bs.time === time)));
    } else {
      setBlockedSlotsByDay(prev => [...prev, { date, time }]);
    }
  };

  function toggleGlobalSlot(slot: string) {
    setEnabledSlots((prev) => prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort());
  }

  function addService() {
    if (!newServiceName || !newServicePrice) return;
    setServices((prev) => [...prev, { name: newServiceName, price: parseInt(newServicePrice), active: true }]);
    setNewServiceName(""); setNewServicePrice("");
  }

  const maxRev = topServices[0]?.revenue || 1;

  if (!authenticated) {
    return (
      <div style={pinStyles.page}>
        <style>{globalCSS}</style>
        <div style={pinStyles.card} className="fadeIn">
          <div style={pinStyles.logoRow}>
            <span style={pinStyles.logoDot}>✦</span>
            <span style={pinStyles.logoTxt}>Beauty Divina</span>
          </div>
          <p style={pinStyles.logoSub}>Panel de la dueña</p>
          <div style={pinStyles.lockEmoji}>🔐</div>
          <p style={pinStyles.pinHint}>Ingresá tu PIN de acceso</p>
          <input
            type="password" inputMode="numeric" maxLength={4}
            style={{ ...pinStyles.pinInput, ...(pinError ? pinStyles.pinInputErr : {}) }}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            placeholder="••••" autoFocus
          />
          {pinError && <p style={pinStyles.pinErrTxt}>PIN incorrecto. Intentá de nuevo.</p>}
          <button style={pinStyles.btn} onClick={handlePinSubmit}>Ingresar →</button>
          <p style={pinStyles.footer}>Beauty Divina · Cairo 83, Monte Grande</p>
        </div>
      </div>
    );
  }

  return (
    <div style={dashboardStyles.page}>
      <style>{globalCSS}</style>

      <header style={dashboardStyles.header}>
        <div style={dashboardStyles.headerInner}>
          <div style={dashboardStyles.logoRow}>
            <span style={dashboardStyles.logoDot}>✦</span>
            <span style={dashboardStyles.logoTxt}>Beauty Divina</span>
          </div>
          <button style={dashboardStyles.logoutBtn} onClick={() => setAuthenticated(false)}>Salir</button>
        </div>
        <p style={dashboardStyles.headerSub}>Panel de gestión · Cairo 83, Monte Grande</p>
      </header>

      <div style={dashboardStyles.statsRow}>
        {[
          { icon: "📅", val: statsToday, label: "Turnos hoy", color: "#e91e63" },
          { icon: "⏳", val: statsPending, label: "Pendientes", color: "#f59e0b" },
          { icon: "💰", val: `$${statsRevenue.toLocaleString("es-AR")}`, label: "Facturado este mes", color: "#10b981", small: true },
        ].map((st, i) => (
          <div key={i} style={{ ...dashboardStyles.statCard, borderTop: `3px solid ${st.color}` }}>
            <span style={dashboardStyles.statIcon}>{st.icon}</span>
            <span style={{ ...dashboardStyles.statVal, ...(st.small ? { fontSize: 18 } : {}) }}>{st.val}</span>
            <span style={dashboardStyles.statLabel}>{st.label}</span>
          </div>
        ))}
      </div>

      <div style={dashboardStyles.tabsRow}>
        {(["turnos", "servicios", "horarios", "facturacion"] as const).map((tab) => (
          <button key={tab} style={{ ...dashboardStyles.tab, ...(activeTab === tab ? dashboardStyles.tabActive : {}) }} onClick={() => setActiveTab(tab)}>
            {tab === "turnos" ? "📆 Turnos" : tab === "servicios" ? "💅 Servicios" : tab === "horarios" ? "⏰ Horarios" : "💰 Facturación"}
          </button>
        ))}
      </div>

      <main style={dashboardStyles.main}>

        {activeTab === "turnos" && (
          <div className="fadeIn">
            <div style={dashboardStyles.filterRow}>
              <button onClick={() => setFilter("all")} style={{ ...dashboardStyles.filterBtn, ...(filter === "all" ? dashboardStyles.filterActive : {}) }}>📋 Todos</button>
              <button onClick={() => setFilter("pending")} style={{ ...dashboardStyles.filterBtn, ...(filter === "pending" ? dashboardStyles.filterActive : {}) }}>⏳ Pendientes</button>
              <button onClick={() => setFilter("today")} style={{ ...dashboardStyles.filterBtn, ...(filter === "today" ? dashboardStyles.filterActive : {}) }}>✅ Confirmados hoy</button>
            </div>

            <div style={dashboardStyles.weekScroll}>
              {weekDates.map((d) => {
                const ds = formatDate(d);
                const count = appointments.filter((a) => a.date === ds).length;
                const isSel = selectedDate === ds;
                const isToday = formatDate(getArgentinaDate()) === ds;
                return (
                  <div
                    key={ds}
                    style={{ ...dashboardStyles.weekDay, ...(isSel ? dashboardStyles.weekDayActive : {}), ...(isToday && !isSel ? dashboardStyles.weekDayToday : {}) }}
                    className="card-lift"
                    onClick={() => setSelectedDate(ds)}
                  >
                    <span style={{ ...dashboardStyles.wdName, ...(isSel ? { color: "#fff" } : {}) }}>{DAY_NAMES_SHORT[d.getDay()]}</span>
                    <span style={{ ...dashboardStyles.wdNum, ...(isSel ? { color: "#fff" } : {}) }}>{d.getDate()}</span>
                    {count > 0 && <span style={{ ...dashboardStyles.wdBadge, ...(isSel ? { background: "rgba(255,255,255,0.3)", color: "#fff" } : {}) }}>{count}</span>}
                  </div>
                );
              })}
            </div>

            <h3 style={dashboardStyles.secTitle}>
              {DAY_NAMES_FULL[new Date(selectedDate + "T12:00:00").getDay()]} {new Date(selectedDate + "T12:00:00").getDate()} de {MONTH_NAMES[new Date(selectedDate + "T12:00:00").getMonth()]}
            </h3>

            {filteredAppointments.length === 0 ? (
              <div style={dashboardStyles.emptyCard}>
                <span style={{ fontSize: 38 }}>🌸</span>
                <p style={dashboardStyles.emptyTxt}>Sin turnos para este día</p>
              </div>
            ) : (
              <div style={dashboardStyles.aptList}>
                {filteredAppointments.map((apt) => (
                  <div key={apt.id} style={{ ...dashboardStyles.aptCard, ...(apt.status === "confirmed" ? dashboardStyles.aptConfirmed : apt.status === "cancelled" ? dashboardStyles.aptCancelled : {}) }}>
                    <div style={dashboardStyles.aptTimeCol}>
                      <span style={dashboardStyles.aptTime}>{apt.time}</span>
                      <span style={{ ...dashboardStyles.aptStatus, ...(apt.status === "confirmed" ? dashboardStyles.statusOk : apt.status === "cancelled" ? dashboardStyles.statusNo : dashboardStyles.statusWait) }}>
                        {apt.status === "confirmed" ? "✓" : apt.status === "cancelled" ? "✗" : "⏳"}
                      </span>
                    </div>
                    <div style={dashboardStyles.aptInfo}>
                      <p style={dashboardStyles.aptName}>{apt.client_name}</p>
                      <p style={dashboardStyles.aptSvc}>{apt.service_name}</p>
                      <p style={dashboardStyles.aptProf}>👩‍💼 {apt.professional_name}</p>
                      <p style={dashboardStyles.aptPrice}>${apt.price?.toLocaleString("es-AR")}</p>
                      <p style={{ fontSize: 11, color: "#a0738c", marginTop: 4 }}>📅 {formatDisplayDate(apt.date)}</p>
                    </div>
                    {apt.status !== "cancelled" && (
                      <div style={dashboardStyles.aptBtns}>
                        {apt.status === "pending" && (
                          <button style={dashboardStyles.btnConfirmApt} onClick={() => confirmAppointment(apt)}>✓ Confirmar</button>
                        )}
                        {apt.status === "confirmed" && (
                          <button style={dashboardStyles.btnComplete} onClick={() => completeAppointment(apt)}>✓ Completar</button>
                        )}
                        <button style={dashboardStyles.btnMove} onClick={() => { setMoveModal({ open: true, apt }); setMoveDate(apt.date); setMoveTime(apt.time); }}>📅 Mover</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {completedAppointments.length > 0 && (
              <>
                <h3 style={{ ...dashboardStyles.secTitle, marginTop: 30 }}>📋 Historial de turnos completados</h3>
                <div style={dashboardStyles.aptList}>
                  {completedAppointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} style={{ ...dashboardStyles.aptCard, opacity: 0.7 }}>
                      <div style={dashboardStyles.aptTimeCol}>
                        <span style={dashboardStyles.aptTime}>{apt.time}</span>
                        <span style={{ ...dashboardStyles.aptStatus, background: "rgba(100,100,100,0.1)", color: "#888" }}>✓</span>
                      </div>
                      <div style={dashboardStyles.aptInfo}>
                        <p style={dashboardStyles.aptName}>{apt.client_name}</p>
                        <p style={dashboardStyles.aptSvc}>{apt.service_name}</p>
                        <p style={dashboardStyles.aptProf}>👩‍💼 {apt.professional_name}</p>
                        <p style={dashboardStyles.aptPrice}>${apt.price?.toLocaleString("es-AR")}</p>
                        <p style={{ fontSize: 11, color: "#a0738c", marginTop: 4 }}>📅 {formatDisplayDate(apt.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {topServices.length > 0 && (
              <>
                <h3 style={{ ...dashboardStyles.secTitle, marginTop: 30 }}>🏆 Top Servicios del Mes</h3>
                <div style={dashboardStyles.topList}>
                  {topServices.map((sv, i) => (
                    <div key={sv.name} style={dashboardStyles.topItem}>
                      <span style={dashboardStyles.topRank}>#{i + 1}</span>
                      <div style={dashboardStyles.topInfo}>
                        <div style={dashboardStyles.topName}>{sv.name}</div>
                        <div style={dashboardStyles.topBarWrap}><div style={{ ...dashboardStyles.topBar, width: `${(sv.revenue / maxRev) * 100}%` }} /></div>
                        <div style={dashboardStyles.topMeta}>
                          <span style={dashboardStyles.topCount}>{sv.count} turno{sv.count !== 1 ? "s" : ""}</span>
                          <span style={dashboardStyles.topRev}>${sv.revenue.toLocaleString("es-AR")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "servicios" && (
          <div className="fadeIn">
            <h3 style={dashboardStyles.secTitle}>Servicios del salón</h3>
            <div style={dashboardStyles.svcList}>
              {services.map((sv, i) => (
                <div key={i} style={{ ...dashboardStyles.svcCard, ...(!sv.active ? dashboardStyles.svcOff : {}) }}>
                  <div>
                    <p style={dashboardStyles.svcName}>{sv.name}</p>
                    <p style={dashboardStyles.svcPrice}>${sv.price.toLocaleString("es-AR")}</p>
                  </div>
                  <button
                    style={{ ...dashboardStyles.toggleBtn, ...(sv.active ? dashboardStyles.toggleOn : dashboardStyles.toggleOff) }}
                    onClick={() => setServices((prev) => prev.map((x, idx) => idx === i ? { ...x, active: !x.active } : x))}
                  >
                    {sv.active ? "● Activo" : "○ Oculto"}
                  </button>
                </div>
              ))}
            </div>

            <h3 style={{ ...dashboardStyles.secTitle, marginTop: 28 }}>Agregar servicio</h3>
            <div style={dashboardStyles.addForm}>
              <input style={dashboardStyles.input} placeholder="Nombre del servicio" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
              <input style={dashboardStyles.input} placeholder="Precio (ej: 10000)" inputMode="numeric" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value.replace(/\D/g, ""))} />
              <button style={dashboardStyles.btnAdd} onClick={addService}>+ Agregar servicio</button>
            </div>
          </div>
        )}

        {activeTab === "horarios" && (
          <div className="fadeIn">
            <h3 style={dashboardStyles.secTitle}>Horarios globales</h3>
            <p style={dashboardStyles.secSub}>Los horarios desactivados no estarán disponibles para ningún día.</p>
            <div style={dashboardStyles.slotsGrid}>
              {ALL_TIME_SLOTS.map((slot) => {
                const on = enabledSlots.includes(slot);
                return (
                  <div key={slot} style={{ ...dashboardStyles.slotCard, ...(on ? dashboardStyles.slotOn : dashboardStyles.slotOffCard) }} className="card-lift" onClick={() => toggleGlobalSlot(slot)}>
                    <span style={dashboardStyles.slotTime}>{slot}</span>
                    <span style={{ fontSize: 16 }}>{on ? "🟢" : "⭕"}</span>
                  </div>
                );
              })}
            </div>
            <div style={dashboardStyles.slotFooter}>
              <span style={dashboardStyles.slotCount}>{enabledSlots.length}/{ALL_TIME_SLOTS.length} activos</span>
              <button style={dashboardStyles.resetBtn} onClick={() => setEnabledSlots(ALL_TIME_SLOTS)}>Activar todos</button>
            </div>

            <h3 style={{ ...dashboardStyles.secTitle, marginTop: 28 }}>Bloqueos por día específico</h3>
            <p style={dashboardStyles.secSub}>Seleccioná un día para bloquear horarios específicos.</p>
            <div style={dashboardStyles.weekScroll}>
              {weekDates.map((d) => {
                const ds = formatDate(d);
                const isSel = selectedDayForBlocking === ds;
                return (
                  <div
                    key={ds}
                    style={{ ...dashboardStyles.weekDay, ...(isSel ? dashboardStyles.weekDayActive : {}) }}
                    className="card-lift"
                    onClick={() => setSelectedDayForBlocking(ds)}
                  >
                    <span style={{ ...dashboardStyles.wdName, ...(isSel ? { color: "#fff" } : {}) }}>{DAY_NAMES_SHORT[d.getDay()]}</span>
                    <span style={{ ...dashboardStyles.wdNum, ...(isSel ? { color: "#fff" } : {}) }}>{d.getDate()}</span>
                  </div>
                );
              })}
            </div>
            {selectedDayForBlocking && (
              <div style={dashboardStyles.slotsGrid}>
                {ALL_TIME_SLOTS.map((slot) => {
                  const blocked = isSlotBlockedForDay(selectedDayForBlocking, slot);
                  const globalEnabled = enabledSlots.includes(slot);
                  return (
                    <div
                      key={slot}
                      style={{ ...dashboardStyles.slotCard, ...(blocked ? dashboardStyles.slotBlockedCard : (globalEnabled ? dashboardStyles.slotOn : dashboardStyles.slotOffCard)) }}
                      className="card-lift"
                      onClick={() => toggleSlotForDay(selectedDayForBlocking, slot)}
                    >
                      <span style={dashboardStyles.slotTime}>{slot}</span>
                      <span style={{ fontSize: 16 }}>{blocked ? "🔴" : (globalEnabled ? "🟢" : "⭕")}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={dashboardStyles.slotFooter}>
              <span style={dashboardStyles.slotCount}>{blockedSlotsByDay.filter(bs => bs.date === selectedDayForBlocking).length} bloqueados para este día</span>
            </div>
          </div>
        )}

        {activeTab === "facturacion" && (
          <div className="fadeIn">
            <div style={dashboardStyles.billingPeriodRow}>
              <button onClick={() => setBillingPeriod("day")} style={{ ...dashboardStyles.billingPeriodBtn, ...(billingPeriod === "day" ? dashboardStyles.billingPeriodActive : {}) }}>📅 Por día</button>
              <button onClick={() => setBillingPeriod("week")} style={{ ...dashboardStyles.billingPeriodBtn, ...(billingPeriod === "week" ? dashboardStyles.billingPeriodActive : {}) }}>📆 Por semana</button>
              <button onClick={() => setBillingPeriod("month")} style={{ ...dashboardStyles.billingPeriodBtn, ...(billingPeriod === "month" ? dashboardStyles.billingPeriodActive : {}) }}>📊 Por mes</button>
            </div>
            {billingData.map((data, idx) => (
              <div key={idx} style={dashboardStyles.billingCard}>
                <div style={dashboardStyles.billingHeader}>
                  <span style={dashboardStyles.billingDate}>{data.date}</span>
                  <span style={dashboardStyles.billingTotal}>💰 ${data.total.toLocaleString("es-AR")}</span>
                </div>
                {data.appointments.length > 0 && (
                  <div style={dashboardStyles.billingDetails}>
                    {data.appointments.map((apt, i) => (
                      <div key={i} style={dashboardStyles.billingItem}>
                        <span style={dashboardStyles.billingItemName}>{apt.client_name} - {apt.service_name}</span>
                        <span style={dashboardStyles.billingItemPrice}>${apt.price?.toLocaleString("es-AR")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {billingData.length === 0 && (
              <div style={dashboardStyles.emptyCard}>
                <span style={{ fontSize: 38 }}>📭</span>
                <p style={dashboardStyles.emptyTxt}>No hay turnos completados en este período</p>
              </div>
            )}
          </div>
        )}
      </main>

      {moveModal.open && moveModal.apt && (
        <div style={dashboardStyles.overlay} onClick={() => setMoveModal({ open: false, apt: null })}>
          <div style={dashboardStyles.modal} onClick={(e) => e.stopPropagation()} className="fadeIn">
            <h3 style={dashboardStyles.modalTitle}>📅 Reprogramar turno</h3>
            <p style={dashboardStyles.modalSub}>{moveModal.apt.client_name} · {moveModal.apt.service_name}</p>
            <label style={dashboardStyles.label}>Nueva fecha</label>
            <input type="date" style={dashboardStyles.input} value={moveDate} onChange={(e) => setMoveDate(e.target.value)} min={formatDate(getArgentinaDate())} />
            <label style={{ ...dashboardStyles.label, marginTop: 14 }}>Nuevo horario</label>
            <div style={dashboardStyles.modalSlots}>
              {ALL_TIME_SLOTS.map((t) => (
                <button key={t} style={{ ...dashboardStyles.modalSlotBtn, ...(moveTime === t ? dashboardStyles.modalSlotActive : {}) }} onClick={() => setMoveTime(t)}>{t}</button>
              ))}
            </div>
            <div style={dashboardStyles.modalActions}>
              <button style={dashboardStyles.btnModalCancel} onClick={() => setMoveModal({ open: false, apt: null })}>Cancelar</button>
              <button style={dashboardStyles.btnModalConfirm} onClick={moveAppointment} disabled={movingId}>{movingId ? "Guardando..." : "✓ Confirmar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff0f5; }
  .fadeIn { animation: fadeIn 0.35s cubic-bezier(.4,0,.2,1) both; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .card-lift { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
  .card-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(233,30,99,0.13); }
  input:focus { outline: none; border-color: #ff6eb4 !important; box-shadow: 0 0 0 4px rgba(255,110,180,0.12) !important; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.3) sepia(1) hue-rotate(290deg); opacity: 0.6; }
  button:active { transform: scale(0.97) !important; }
  ::-webkit-scrollbar { height: 4px; width: 4px; }
  ::-webkit-scrollbar-thumb { background: #ffb3d1; border-radius: 4px; }
`;

const pinStyles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(160deg, #fff0f5 0%, #fdf2f8 60%, #ffe4ec 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 20 },
  card: { background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1.5px solid rgba(255,180,210,0.4)", borderRadius: 28, padding: "48px 36px", textAlign: "center", width: "100%", maxWidth: 360, boxShadow: "0 24px 64px rgba(233,30,99,0.12)" },
  logoRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 },
  logoDot: { fontSize: 18, color: "#ff4d8c" },
  logoTxt: { fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg, #ff4d8c, #e91e63)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  logoSub: { color: "#c77dab", fontSize: 13, fontWeight: 500, marginBottom: 28, letterSpacing: "0.05em" },
  lockEmoji: { fontSize: 52, marginBottom: 16 },
  pinHint: { color: "#a0738c", fontSize: 14, fontWeight: 600, marginBottom: 14 },
  pinInput: { width: "100%", background: "#fff0f7", border: "1.5px solid rgba(255,180,210,0.5)", borderRadius: 16, color: "#2d1b2e", fontSize: 26, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, padding: "14px", textAlign: "center", letterSpacing: "0.4em", marginBottom: 8, transition: "all 0.2s" },
  pinInputErr: { borderColor: "rgba(220,50,80,0.4) !important", background: "rgba(255,230,235,0.8)" },
  pinErrTxt: { color: "#c62a5e", fontSize: 13, marginBottom: 10, fontWeight: 500 },
  btn: { width: "100%", background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "none", borderRadius: 16, color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "15px", cursor: "pointer", marginTop: 8, boxShadow: "0 8px 28px rgba(233,30,99,0.35)" },
  footer: { fontSize: 11, color: "#d4aec1", marginTop: 22 },
};

const dashboardStyles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(160deg, #fff0f5 0%, #fdf2f8 60%, #ffe4ec 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#2d1b2e" },
  header: { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,180,210,0.2)", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 700, margin: "0 auto", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logoRow: { display: "flex", alignItems: "center", gap: 8 },
  logoDot: { fontSize: 16, color: "#ff4d8c" },
  logoTxt: { fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg, #ff4d8c, #e91e63)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  headerSub: { fontSize: 11, color: "#c77dab", fontWeight: 500, textAlign: "center", padding: "0 0 10px" },
  logoutBtn: { background: "rgba(255,240,247,0.9)", border: "1px solid rgba(255,180,210,0.4)", borderRadius: 12, color: "#e91e63", fontSize: 13, fontWeight: 600, padding: "8px 16px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  statsRow: { display: "flex", gap: 12, padding: "20px 16px 0", overflowX: "auto", maxWidth: 700, margin: "0 auto", width: "100%" },
  statCard: { flex: "1 0 120px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1.5px solid rgba(255,180,210,0.25)", borderRadius: 20, padding: "16px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 4px 20px rgba(233,30,99,0.07)", minWidth: 120 },
  statIcon: { fontSize: 22 },
  statVal: { fontSize: 26, fontWeight: 800, color: "#2d1b2e", lineHeight: 1 },
  statLabel: { fontSize: 11, color: "#a0738c", fontWeight: 500 },
  tabsRow: { display: "flex", gap: 8, padding: "16px 16px 0", maxWidth: 700, margin: "0 auto", width: "100%", flexWrap: "wrap" },
  tab: { flex: 1, background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(255,180,210,0.3)", borderRadius: 14, color: "#c77dab", fontSize: 13, fontWeight: 600, padding: "11px 8px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s" },
  tabActive: { background: "linear-gradient(135deg, rgba(255,110,180,0.15), rgba(233,30,99,0.1))", border: "1.5px solid rgba(233,30,99,0.35)", color: "#e91e63" },
  main: { padding: "20px 16px 60px", maxWidth: 700, margin: "0 auto" },
  filterRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  filterBtn: { background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(255,180,210,0.3)", borderRadius: 30, padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#c77dab", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  filterActive: { background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "1.5px solid #e91e63", color: "#fff" },
  weekScroll: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 20 },
  weekDay: { minWidth: 56, height: 82, borderRadius: 16, background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,180,210,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", flexShrink: 0, position: "relative", transition: "all 0.2s", boxShadow: "0 2px 10px rgba(233,30,99,0.05)" },
  weekDayActive: { background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "1.5px solid #e91e63", boxShadow: "0 6px 20px rgba(233,30,99,0.3)" },
  weekDayToday: { border: "1.5px solid #ff6eb4", boxShadow: "0 0 0 3px rgba(255,110,180,0.1)" },
  wdName: { fontSize: 10, color: "#c77dab", fontWeight: 600, textTransform: "uppercase" },
  wdNum: { fontSize: 21, fontWeight: 800, color: "#2d1b2e", lineHeight: 1 },
  wdBadge: { position: "absolute", top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9, background: "#e91e63", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" },
  secTitle: { fontSize: 17, fontWeight: 700, color: "#2d1b2e", marginBottom: 14 },
  secSub: { fontSize: 13, color: "#a0738c", marginBottom: 18 },
  emptyCard: { textAlign: "center", padding: "36px 20px", background: "rgba(255,255,255,0.7)", borderRadius: 20, border: "1.5px dashed rgba(255,180,210,0.4)" },
  emptyTxt: { marginTop: 8, color: "#c77dab", fontSize: 14, fontWeight: 500 },
  aptList: { display: "flex", flexDirection: "column", gap: 12 },
  aptCard: { background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1.5px solid rgba(255,180,210,0.25)", borderRadius: 20, padding: "16px", display: "flex", gap: 12, alignItems: "flex-start", boxShadow: "0 4px 16px rgba(233,30,99,0.06)", transition: "all 0.2s" },
  aptConfirmed: { borderColor: "rgba(16,185,129,0.3)", background: "rgba(240,255,250,0.9)" },
  aptCancelled: { opacity: 0.45 },
  aptTimeCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 48 },
  aptTime: { fontSize: 17, fontWeight: 800, color: "#e91e63" },
  aptStatus: { fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 },
  statusOk: { background: "rgba(16,185,129,0.12)", color: "#059669" },
  statusWait: { background: "rgba(245,158,11,0.12)", color: "#d97706" },
  statusNo: { background: "rgba(220,50,80,0.1)", color: "#c62a5e" },
  aptInfo: { flex: 1 },
  aptName: { fontSize: 15, fontWeight: 700, color: "#2d1b2e", marginBottom: 2 },
  aptSvc: { fontSize: 13, color: "#a0738c", marginBottom: 2 },
  aptProf: { fontSize: 12, color: "#c77dab", marginBottom: 4 },
  aptPrice: { fontSize: 15, fontWeight: 800, color: "#e91e63" },
  aptBtns: { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 },
  btnConfirmApt: { background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: 12, color: "#fff", fontSize: 12, fontWeight: 700, padding: "9px 14px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" },
  btnComplete: { background: "linear-gradient(135deg, #6b7280, #4b5563)", border: "none", borderRadius: 12, color: "#fff", fontSize: 12, fontWeight: 700, padding: "9px 14px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" },
  btnMove: { background: "rgba(255,240,247,0.9)", border: "1px solid rgba(255,110,180,0.35)", borderRadius: 12, color: "#e91e63", fontSize: 12, fontWeight: 600, padding: "9px 14px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" },
  topList: { display: "flex", flexDirection: "column", gap: 10 },
  topItem: { display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.85)", borderRadius: 16, padding: "14px", border: "1.5px solid rgba(255,180,210,0.2)", boxShadow: "0 2px 10px rgba(233,30,99,0.05)" },
  topRank: { fontSize: 17, fontWeight: 800, color: "#ffb3d1", minWidth: 28 },
  topInfo: { flex: 1 },
  topName: { fontSize: 14, fontWeight: 600, color: "#2d1b2e", marginBottom: 6 },
  topBarWrap: { height: 6, background: "#ffe4ec", borderRadius: 3, marginBottom: 6, overflow: "hidden" },
  topBar: { height: "100%", background: "linear-gradient(90deg, #ff6eb4, #e91e63)", borderRadius: 3, transition: "width 0.6s ease" },
  topMeta: { display: "flex", justifyContent: "space-between" },
  topCount: { fontSize: 12, color: "#c77dab" },
  topRev: { fontSize: 14, fontWeight: 800, color: "#e91e63" },
  svcList: { display: "flex", flexDirection: "column", gap: 10 },
  svcCard: { background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,180,210,0.25)", borderRadius: 18, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, boxShadow: "0 2px 10px rgba(233,30,99,0.05)", transition: "opacity 0.2s" },
  svcOff: { opacity: 0.45 },
  svcName: { fontSize: 14, fontWeight: 600, color: "#2d1b2e", marginBottom: 3 },
  svcPrice: { fontSize: 16, fontWeight: 800, color: "#e91e63" },
  toggleBtn: { border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, padding: "7px 14px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap", flexShrink: 0 },
  toggleOn: { background: "rgba(16,185,129,0.12)", color: "#059669" },
  toggleOff: { background: "rgba(200,170,185,0.15)", color: "#a0738c" },
  addForm: { display: "flex", flexDirection: "column", gap: 10 },
  btnAdd: { background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "14px", cursor: "pointer", boxShadow: "0 6px 20px rgba(233,30,99,0.3)" },
  slotsGrid: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  slotCard: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderRadius: 14, padding: "10px 14px", border: "1.5px solid rgba(255,180,210,0.3)", minWidth: 120, flex: "1 0 120px", transition: "all 0.2s", cursor: "pointer" },
  slotOn: { background: "rgba(255,240,247,0.9)", borderColor: "rgba(255,110,180,0.4)" },
  slotOffCard: { background: "rgba(245,235,240,0.5)", opacity: 0.6 },
  slotBlockedCard: { background: "rgba(255,220,220,0.8)", borderColor: "rgba(220,50,80,0.4)", opacity: 0.8 },
  slotTime: { fontSize: 15, fontWeight: 700, color: "#2d1b2e" },
  slotFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" },
  slotCount: { fontSize: 13, color: "#a0738c", fontWeight: 500 },
  resetBtn: { background: "rgba(255,240,247,0.9)", border: "1px solid rgba(255,110,180,0.35)", borderRadius: 12, color: "#e91e63", fontSize: 13, fontWeight: 600, padding: "8px 16px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  input: { width: "100%", background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,180,210,0.45)", borderRadius: 16, color: "#2d1b2e", fontSize: 15, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "13px 16px", transition: "all 0.2s", fontWeight: 500 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#a0738c", marginBottom: 8 },
  overlay: { position: "fixed", inset: 0, background: "rgba(45,27,46,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, padding: 16 },
  modal: { background: "rgba(255,252,254,0.98)", border: "1.5px solid rgba(255,180,210,0.4)", borderRadius: "24px 24px 16px 16px", padding: "26px 22px 32px", width: "100%", maxWidth: 500, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(233,30,99,0.12)" },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#2d1b2e", marginBottom: 4 },
  modalSub: { fontSize: 13, color: "#a0738c", marginBottom: 20 },
  modalSlots: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 20 },
  modalSlotBtn: { background: "rgba(255,240,247,0.8)", border: "1.5px solid rgba(255,180,210,0.4)", borderRadius: 12, color: "#2d1b2e", fontSize: 13, fontWeight: 600, padding: "8px 12px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s" },
  modalSlotActive: { background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "1.5px solid #e91e63", color: "#fff", boxShadow: "0 4px 14px rgba(233,30,99,0.3)" },
  modalActions: { display: "flex", gap: 10 },
  btnModalCancel: { flex: 1, background: "rgba(245,235,240,0.9)", border: "1.5px solid rgba(200,170,185,0.4)", borderRadius: 14, color: "#a0738c", fontSize: 14, fontWeight: 600, padding: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btnModalConfirm: { flex: 1, background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "none", borderRadius: 14, color: "#fff", fontSize: 14, fontWeight: 800, padding: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  billingPeriodRow: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  billingPeriodBtn: { background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(255,180,210,0.3)", borderRadius: 30, padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#c77dab", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  billingPeriodActive: { background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "1.5px solid #e91e63", color: "#fff" },
  billingCard: { background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,180,210,0.25)", borderRadius: 20, padding: "16px", marginBottom: 12, boxShadow: "0 2px 10px rgba(233,30,99,0.05)" },
  billingHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  billingDate: { fontSize: 16, fontWeight: 700, color: "#2d1b2e" },
  billingTotal: { fontSize: 18, fontWeight: 800, color: "#e91e63" },
  billingDetails: { borderTop: "1px solid rgba(255,180,210,0.3)", paddingTop: 12 },
  billingItem: { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 },
  billingItemName: { color: "#a0738c" },
  billingItemPrice: { fontWeight: 600, color: "#2d1b2e" },
};