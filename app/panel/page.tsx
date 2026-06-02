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

function formatDate(date: Date) { return date.toISOString().split("T")[0]; }
function addDays(date: Date, days: number) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function getWeekDates() {
  const today = new Date();
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

export default function PanelPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<"turnos"|"servicios"|"horarios">("turnos");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [weekDates] = useState(getWeekDates());
  const [services, setServices] = useState<Service[]>([
    { name: "Manicuria Semipermanente", price: 8000, active: true },
    { name: "Pedicuría Completa", price: 9500, active: true },
    { name: "Limpieza Facial Profunda", price: 12000, active: true },
    { name: "Depilación Piernas", price: 7500, active: true },
  ]);
  const [enabledSlots, setEnabledSlots] = useState<string[]>(ALL_TIME_SLOTS);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [moveModal, setMoveModal] = useState<{ open: boolean; apt: Appointment | null }>({ open: false, apt: null });
  const [moveDate, setMoveDate] = useState("");
  const [moveTime, setMoveTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [statsToday, setStatsToday] = useState(0);
  const [statsPending, setStatsPending] = useState(0);
  const [statsRevenue, setStatsRevenue] = useState(0);
  const [topServices, setTopServices] = useState<{ name: string; count: number; revenue: number }[]>([]);

  const loadAppointments = useCallback(async () => {
    const { data } = await supabase.from("appointments").select("*").order("date").order("time");
    if (data) {
      setAppointments(data as Appointment[]);
      const today = formatDate(new Date());
      setStatsToday(data.filter((a: Appointment) => a.date === today).length);
      setStatsPending(data.filter((a: Appointment) => a.status === "pending").length);
      const thisMonth = new Date().toISOString().slice(0, 7);
      setStatsRevenue(data.filter((a: Appointment) => a.date.startsWith(thisMonth) && a.status === "confirmed").reduce((s: number, a: Appointment) => s + (a.price || 0), 0));
      const svcMap: Record<string, { count: number; revenue: number }> = {};
      data.forEach((a: Appointment) => {
        if (!svcMap[a.service_name]) svcMap[a.service_name] = { count: 0, revenue: 0 };
        svcMap[a.service_name].count++;
        svcMap[a.service_name].revenue += a.price || 0;
      });
      setTopServices(Object.entries(svcMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 4));
    }
  }, []);

  useEffect(() => { if (authenticated) loadAppointments(); }, [authenticated, loadAppointments]);

  function handlePinSubmit() {
    if (pin === OWNER_PIN) { setAuthenticated(true); setPinError(false); }
    else { setPinError(true); setPin(""); }
  }

  const dayAppointments = appointments.filter((a) => a.date === selectedDate);

  async function confirmAppointment(apt: Appointment) {
    await supabase.from("appointments").update({ status: "confirmed" }).eq("id", apt.id);
    loadAppointments();
    const [y, m, d] = apt.date.split("-");
    const msg = encodeURIComponent(`✅ ¡Turno Confirmado! - Beauty Divina\n\nHola ${apt.client_name} 👋\nTu turno ha sido *confirmado*:\n\n💅 ${apt.service_name}\n👩‍💼 ${apt.professional_name}\n📆 ${d}/${m}/${y} a las ${apt.time}\n\n¡Te esperamos! ✨💕`);
    window.open(`https://wa.me/${apt.client_phone}?text=${msg}`, "_blank");
  }

  async function moveAppointment() {
    if (!moveModal.apt || !moveDate || !moveTime) return;
    setLoading(true);
    await supabase.from("appointments").update({ date: moveDate, time: moveTime, status: "confirmed" }).eq("id", moveModal.apt.id);
    const apt = moveModal.apt;
    const [y, m, d] = moveDate.split("-");
    const msg = encodeURIComponent(`📅 Turno Reprogramado - Beauty Divina\n\nHola ${apt.client_name} 👋\nTu turno fue *reprogramado*:\n\n💅 ${apt.service_name}\n👩‍💼 ${apt.professional_name}\n📆 Nueva fecha: ${d}/${m}/${y} a las ${moveTime}\n\nSi tenés dudas, escribinos 💕`);
    window.open(`https://wa.me/${apt.client_phone}?text=${msg}`, "_blank");
    setMoveModal({ open: false, apt: null });
    setLoading(false);
    loadAppointments();
  }

  function toggleSlot(slot: string) {
    setEnabledSlots((prev) => prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort());
  }

  function addService() {
    if (!newServiceName || !newServicePrice) return;
    setServices((prev) => [...prev, { name: newServiceName, price: parseInt(newServicePrice), active: true }]);
    setNewServiceName(""); setNewServicePrice("");
  }

  const maxTopRevenue = topServices[0]?.revenue || 1;

  if (!authenticated) {
    return (
      <div style={pinStyles.page}>
        <style>{globalCSS}</style>
        <div style={pinStyles.card} className="fadeIn">
          <div style={pinStyles.logo}>
            <div style={pinStyles.logoDot} />
            <span style={pinStyles.logoText}>Beauty Divina</span>
          </div>
          <p style={pinStyles.sub}>Panel de Gestión</p>
          <div style={pinStyles.lockIcon}>🔐</div>
          <p style={pinStyles.pinLabel}>Ingresá tu PIN</p>
          <input type="password" inputMode="numeric" maxLength={4} style={{ ...pinStyles.pinInput, ...(pinError ? { borderColor: "rgba(255,60,60,0.6)" } : {}) }} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinError(false); }} onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()} placeholder="••••" autoFocus />
          {pinError && <p style={pinStyles.errorText}>PIN incorrecto. Intentá de nuevo.</p>}
          <button style={pinStyles.btn} onClick={handlePinSubmit}>Ingresar →</button>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 20 }}>Beauty Divina © {new Date().getFullYear()}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{globalCSS}</style>
      <header style={styles.header}>
        <div>
          <div style={styles.logoWrap}><div style={styles.logoDot} /><span style={styles.logoText}>Beauty Divina</span></div>
          <p style={styles.logoSub}>Panel de Gestión</p>
        </div>
        <button style={styles.logoutBtn} onClick={() => setAuthenticated(false)}>Salir</button>
      </header>

      <div style={styles.statsRow}>
        <div style={styles.statCard}><span style={styles.statIcon}>📅</span><span style={styles.statNum}>{statsToday}</span><span style={styles.statLabel}>Turnos hoy</span></div>
        <div style={{ ...styles.statCard, borderColor: "rgba(255,200,0,0.3)" }}><span style={styles.statIcon}>⏳</span><span style={styles.statNum}>{statsPending}</span><span style={styles.statLabel}>Pendientes</span></div>
        <div style={{ ...styles.statCard, borderColor: "rgba(0,220,130,0.3)" }}><span style={styles.statIcon}>💰</span><span style={{ ...styles.statNum, fontSize: 18 }}>${statsRevenue.toLocaleString("es-AR")}</span><span style={styles.statLabel}>Facturado este mes</span></div>
      </div>

      <div style={styles.tabRow}>
        {(["turnos","servicios","horarios"] as const).map((tab) => (
          <button key={tab} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }} onClick={() => setActiveTab(tab)}>
            {tab === "turnos" ? "📆 Turnos" : tab === "servicios" ? "💅 Servicios" : "⏰ Horarios"}
          </button>
        ))}
      </div>

      <main style={styles.main}>
        {activeTab === "turnos" && (
          <div className="fadeIn">
            <div style={styles.weekScroll}>
              {weekDates.map((d) => {
                const dateStr = formatDate(d);
                const count = appointments.filter((a) => a.date === dateStr).length;
                const isSelected = selectedDate === dateStr;
                const isToday = formatDate(new Date()) === dateStr;
                return (
                  <div key={dateStr} style={{ ...styles.weekDay, ...(isSelected ? styles.weekDayActive : {}), ...(isToday && !isSelected ? styles.weekDayToday : {}) }} className="card-hover" onClick={() => setSelectedDate(dateStr)}>
                    <span style={styles.weekDayName}>{DAY_NAMES_SHORT[d.getDay()]}</span>
                    <span style={styles.weekDayNum}>{d.getDate()}</span>
                    {count > 0 && <span style={styles.weekDayBadge}>{count}</span>}
                  </div>
                );
              })}
            </div>
            <h3 style={styles.sectionTitle}>
              Turnos del {DAY_NAMES_FULL[new Date(selectedDate + "T12:00:00").getDay()]} {new Date(selectedDate + "T12:00:00").getDate()} de {MONTH_NAMES[new Date(selectedDate + "T12:00:00").getMonth()]}
            </h3>
            {dayAppointments.length === 0 ? (
              <div style={styles.emptyState}><span style={{ fontSize: 36 }}>🌸</span><p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.35)", fontSize: 14 }}>No hay turnos para este día</p></div>
            ) : (
              <div style={styles.aptList}>
                {dayAppointments.map((apt) => (
                  <div key={apt.id} style={{ ...styles.aptCard, ...(apt.status === "confirmed" ? styles.aptConfirmed : apt.status === "cancelled" ? styles.aptCancelled : {}) }}>
                    <div style={styles.aptTime}>{apt.time}</div>
                    <div style={styles.aptInfo}>
                      <div style={styles.aptName}>{apt.client_name}</div>
                      <div style={styles.aptService}>{apt.service_name}</div>
                      <div style={styles.aptProf}>👩‍💼 {apt.professional_name}</div>
                      <div style={styles.aptMeta}>
                        <span style={{ ...styles.statusBadge, ...(apt.status === "confirmed" ? styles.statusConfirmed : apt.status === "cancelled" ? styles.statusCancelled : styles.statusPending) }}>
                          {apt.status === "confirmed" ? "✓ Confirmado" : apt.status === "cancelled" ? "✗ Cancelado" : "⏳ Pendiente"}
                        </span>
                        <span style={styles.aptPrice}>${apt.price?.toLocaleString("es-AR")}</span>
                      </div>
                    </div>
                    {apt.status !== "cancelled" && (
                      <div style={styles.aptActions}>
                        <button style={styles.confirmBtn} onClick={() => confirmAppointment(apt)}>✓ Confirmar</button>
                        <button style={styles.moveBtn} onClick={() => { setMoveModal({ open: true, apt }); setMoveDate(apt.date); setMoveTime(apt.time); }}>📅 Mover</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {topServices.length > 0 && (
              <>
                <h3 style={{ ...styles.sectionTitle, marginTop: 32 }}>🏆 Top Servicios Facturados</h3>
                <div style={styles.topList}>
                  {topServices.map((s, i) => (
                    <div key={s.name} style={styles.topItem}>
                      <div style={styles.topRank}>#{i + 1}</div>
                      <div style={styles.topInfo}>
                        <div style={styles.topName}>{s.name}</div>
                        <div style={styles.topBar}><div style={{ ...styles.topBarFill, width: `${(s.revenue / maxTopRevenue) * 100}%` }} /></div>
                        <div style={styles.topStats}>
                          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{s.count} turno{s.count !== 1 ? "s" : ""}</span>
                          <span style={{ color: "#ff6eb4", fontWeight: 700, fontSize: 14 }}>${s.revenue.toLocaleString("es-AR")}</span>
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
            <h3 style={styles.sectionTitle}>Servicios disponibles</h3>
            <div style={styles.svcList}>
              {services.map((s, i) => (
                <div key={i} style={{ ...styles.svcCard, ...(!s.active ? styles.svcInactive : {}) }}>
                  <div style={styles.svcInfo}>
                    <span style={styles.svcName}>{s.name}</span>
                    <span style={styles.svcPrice}>${s.price.toLocaleString("es-AR")}</span>
                  </div>
                  <button style={{ ...styles.toggleBtn, ...(s.active ? styles.toggleActive : styles.toggleOff) }} onClick={() => setServices((prev) => prev.map((sv, idx) => idx === i ? { ...sv, active: !sv.active } : sv))}>
                    {s.active ? "● Activo" : "○ Oculto"}
                  </button>
                </div>
              ))}
            </div>
            <h3 style={{ ...styles.sectionTitle, marginTop: 28 }}>Agregar nuevo servicio</h3>
            <div style={styles.addSvcForm}>
              <input style={styles.input} placeholder="Nombre del servicio" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
              <input style={styles.input} placeholder="Precio (ej: 10000)" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" />
              <button style={styles.addBtn} onClick={addService}>+ Agregar servicio</button>
            </div>
          </div>
        )}

        {activeTab === "horarios" && (
          <div className="fadeIn">
            <h3 style={styles.sectionTitle}>Horarios disponibles para reserva</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 0 20px" }}>Activá o desactivá cada horario. Los clientes solo verán los activos.</p>
            <div style={styles.slotsGrid}>
              {ALL_TIME_SLOTS.map((slot) => {
                const isOn = enabledSlots.includes(slot);
                return (
                  <div key={slot} style={{ ...styles.slotToggle, ...(isOn ? styles.slotToggleOn : styles.slotToggleOff) }} className="card-hover" onClick={() => toggleSlot(slot)}>
                    <span style={styles.slotTime}>{slot}</span>
                    <span style={{ fontSize: 18 }}>{isOn ? "🟢" : "⭕"}</span>
                  </div>
                );
              })}
            </div>
            <div style={styles.slotsSummary}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{enabledSlots.length} de {ALL_TIME_SLOTS.length} horarios activos</span>
              <button style={styles.resetBtn} onClick={() => setEnabledSlots(ALL_TIME_SLOTS)}>Activar todos</button>
            </div>
          </div>
        )}
      </main>

      {moveModal.open && moveModal.apt && (
        <div style={styles.modalOverlay} onClick={() => setMoveModal({ open: false, apt: null })}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()} className="fadeIn">
            <h3 style={styles.modalTitle}>📅 Mover Turno</h3>
            <p style={styles.modalSub}>Turno de <strong>{moveModal.apt.client_name}</strong> — {moveModal.apt.service_name}</p>
            <label style={styles.label}>Nueva fecha</label>
            <input type="date" style={styles.input} value={moveDate} onChange={(e) => setMoveDate(e.target.value)} min={formatDate(new Date())} />
            <label style={{ ...styles.label, marginTop: 12 }}>Nuevo horario</label>
            <div style={styles.modalSlots}>
              {ALL_TIME_SLOTS.map((t) => (
                <button key={t} style={{ ...styles.modalSlotBtn, ...(moveTime === t ? styles.modalSlotSelected : {}) }} onClick={() => setMoveTime(t)}>{t}</button>
              ))}
            </div>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setMoveModal({ open: false, apt: null })}>Cancelar</button>
              <button style={styles.confirmBtn} onClick={moveAppointment} disabled={loading}>{loading ? "Moviendo..." : "✓ Confirmar cambio"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #0d0a0e; }
  .fadeIn { animation: fadeIn 0.35s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .card-hover { transition: transform 0.2s ease; cursor: pointer; }
  .card-hover:hover { transform: translateY(-2px); }
  input:focus { outline: none; border-color: #ff6eb4 !important; box-shadow: 0 0 0 3px rgba(255,110,180,0.15); }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; }
  ::-webkit-scrollbar { height: 4px; width: 4px; }
  ::-webkit-scrollbar-track { background: #1a1520; }
  ::-webkit-scrollbar-thumb { background: #ff6eb4; border-radius: 4px; }
`;

const pinStyles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0d0a0e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", padding: 20 },
  card: { background: "linear-gradient(145deg, #1a1520, #110d17)", border: "1px solid rgba(255,110,180,0.2)", borderRadius: 28, padding: "48px 36px", textAlign: "center", width: "100%", maxWidth: 360, boxShadow: "0 30px 100px rgba(255,110,180,0.15)" },
  logo: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 },
  logoDot: { width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg, #ff6eb4, #c44dff)", boxShadow: "0 0 12px #ff6eb4" },
  logoText: { fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg, #ff6eb4, #fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sub: { color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "0 0 28px", letterSpacing: "0.1em", textTransform: "uppercase" },
  lockIcon: { fontSize: 48, marginBottom: 20 },
  pinLabel: { color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "0 0 12px", fontWeight: 500 },
  pinInput: { width: "100%", background: "#1a1520", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, color: "#fff", fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 800, padding: "14px", textAlign: "center", lett