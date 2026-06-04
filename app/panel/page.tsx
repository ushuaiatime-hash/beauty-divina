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

function formatDate(d: Date) { return d.toISOString().split("T")[0]; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
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
  const [movingId, setMovingId] = useState(false);
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
      setStatsRevenue(data.filter((a: Appointment) => a.date.startsWith(thisMonth) && a.status === "confirmed").reduce((sum: number, a: Appointment) => sum + (a.price || 0), 0));
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
    const msg = encodeURIComponent(
      `✅ ¡Turno Confirmado! - Beauty Divina\n\nHola ${apt.client_name} 👋\nTu turno ha sido *confirmado*:\n\n` +
      `💅 ${apt.service_name}\n👩‍💼 ${apt.professional_name}\n📆 ${d}/${m}/${y} a las ${apt.time}\n📍 Cairo 83, Monte Grande\n\n¡Te esperamos! ✨💕`
    );
    window.open(`https://wa.me/${apt.client_phone}?text=${msg}`, "_blank");
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

  function toggleSlot(slot: string) {
    setEnabledSlots((prev) => prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort());
  }

  function addService() {
    if (!newServiceName || !newServicePrice) return;
    setServices((prev) => [...prev, { name: newServiceName, price: parseInt(newServicePrice), active: true }]);
    setNewServiceName(""); setNewServicePrice("");
  }

  const maxRev = topServices[0]?.revenue || 1;

  /* ─── PIN Screen ─── */
  if (!authenticated) {
    return (
      <div style={p.page}>
        <style>{css}</style>
        <div style={p.card} className="fadeIn">
          <div style={p.logoRow}>
            <span style={p.logoDot}>✦</span>
            <span style={p.logoTxt}>Beauty Divina</span>
          </div>
          <p style={p.logoSub}>Panel de la dueña</p>
          <div style={p.lockEmoji}>🔐</div>
          <p style={p.pinHint}>Ingresá tu PIN de acceso</p>
          <input
            type="password" inputMode="numeric" maxLength={4}
            style={{ ...p.pinInput, ...(pinError ? p.pinInputErr : {}) }}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            placeholder="••••" autoFocus
          />
          {pinError && <p style={p.pinErrTxt}>PIN incorrecto. Intentá de nuevo.</p>}
          <button style={p.btn} onClick={handlePinSubmit}>Ingresar →</button>
          <p style={p.footer}>Beauty Divina · Cairo 83, Monte Grande</p>
        </div>
      </div>
    );
  }

  /* ─── Dashboard ─── */
  return (
    <div style={s.page}>
      <style>{css}</style>

      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoRow}>
            <span style={s.logoDot}>✦</span>
            <span style={s.logoTxt}>Beauty Divina</span>
          </div>
          <button style={s.logoutBtn} onClick={() => setAuthenticated(false)}>Salir</button>
        </div>
        <p style={s.headerSub}>Panel de gestión · Cairo 83, Monte Grande</p>
      </header>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { icon: "📅", val: statsToday, label: "Turnos hoy", color: "#e91e63" },
          { icon: "⏳", val: statsPending, label: "Pendientes", color: "#f59e0b" },
          { icon: "💰", val: `$${statsRevenue.toLocaleString("es-AR")}`, label: "Facturado este mes", color: "#10b981", small: true },
        ].map((st, i) => (
          <div key={i} style={{ ...s.statCard, borderTop: `3px solid ${st.color}` }}>
            <span style={s.statIcon}>{st.icon}</span>
            <span style={{ ...s.statVal, ...(st.small ? { fontSize: 18 } : {}) }}>{st.val}</span>
            <span style={s.statLabel}>{st.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={s.tabsRow}>
        {(["turnos", "servicios", "horarios"] as const).map((tab) => (
          <button key={tab} style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }} onClick={() => setActiveTab(tab)}>
            {tab === "turnos" ? "📆 Turnos" : tab === "servicios" ? "💅 Servicios" : "⏰ Horarios"}
          </button>
        ))}
      </div>

      <main style={s.main}>

        {/* ── TURNOS ── */}
        {activeTab === "turnos" && (
          <div className="fadeIn">
            <div style={s.weekScroll}>
              {weekDates.map((d) => {
                const ds = formatDate(d);
                const count = appointments.filter((a) => a.date === ds).length;
                const isSel = selectedDate === ds;
                const isToday = formatDate(new Date()) === ds;
                return (
                  <div
                    key={ds}
                    style={{ ...s.weekDay, ...(isSel ? s.weekDayActive : {}), ...(isToday && !isSel ? s.weekDayToday : {}) }}
                    className="card-lift"
                    onClick={() => setSelectedDate(ds)}
                  >
                    <span style={{ ...s.wdName, ...(isSel ? { color: "#fff" } : {}) }}>{DAY_NAMES_SHORT[d.getDay()]}</span>
                    <span style={{ ...s.wdNum, ...(isSel ? { color: "#fff" } : {}) }}>{d.getDate()}</span>
                    {count > 0 && <span style={{ ...s.wdBadge, ...(isSel ? { background: "rgba(255,255,255,0.3)", color: "#fff" } : {}) }}>{count}</span>}
                  </div>
                );
              })}
            </div>

            <h3 style={s.secTitle}>
              {DAY_NAMES_FULL[new Date(selectedDate + "T12:00:00").getDay()]} {new Date(selectedDate + "T12:00:00").getDate()} de {MONTH_NAMES[new Date(selectedDate + "T12:00:00").getMonth()]}
            </h3>

            {dayAppointments.length === 0 ? (
              <div style={s.emptyCard}>
                <span style={{ fontSize: 38 }}>🌸</span>
                <p style={s.emptyTxt}>Sin turnos para este día</p>
              </div>
            ) : (
              <div style={s.aptList}>
                {dayAppointments.map((apt) => (
                  <div key={apt.id} style={{ ...s.aptCard, ...(apt.status === "confirmed" ? s.aptConfirmed : apt.status === "cancelled" ? s.aptCancelled : {}) }}>
                    <div style={s.aptTimeCol}>
                      <span style={s.aptTime}>{apt.time}</span>
                      <span style={{ ...s.aptStatus, ...(apt.status === "confirmed" ? s.statusOk : apt.status === "cancelled" ? s.statusNo : s.statusWait) }}>
                        {apt.status === "confirmed" ? "✓" : apt.status === "cancelled" ? "✗" : "⏳"}
                      </span>
                    </div>
                    <div style={s.aptInfo}>
                      <p style={s.aptName}>{apt.client_name}</p>
                      <p style={s.aptSvc}>{apt.service_name}</p>
                      <p style={s.aptProf}>👩‍💼 {apt.professional_name}</p>
                      <p style={s.aptPrice}>${apt.price?.toLocaleString("es-AR")}</p>
                    </div>
                    {apt.status !== "cancelled" && (
                      <div style={s.aptBtns}>
                        <button style={s.btnConfirm} onClick={() => confirmAppointment(apt)}>✓ Confirmar</button>
                        <button style={s.btnMove} onClick={() => { setMoveModal({ open: true, apt }); setMoveDate(apt.date); setMoveTime(apt.time); }}>📅 Mover</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {topServices.length > 0 && (
              <>
                <h3 style={{ ...s.secTitle, marginTop: 30 }}>🏆 Top Servicios del Mes</h3>
                <div style={s.topList}>
                  {topServices.map((sv, i) => (
                    <div key={sv.name} style={s.topItem}>
                      <span style={s.topRank}>#{i + 1}</span>
                      <div style={s.topInfo}>
                        <div style={s.topName}>{sv.name}</div>
                        <div style={s.topBarWrap}><div style={{ ...s.topBar, width: `${(sv.revenue / maxRev) * 100}%` }} /></div>
                        <div style={s.topMeta}>
                          <span style={s.topCount}>{sv.count} turno{sv.count !== 1 ? "s" : ""}</span>
                          <span style={s.topRev}>${sv.revenue.toLocaleString("es-AR")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SERVICIOS ── */}
        {activeTab === "servicios" && (
          <div className="fadeIn">
            <h3 style={s.secTitle}>Servicios del salón</h3>
            <div style={s.svcList}>
              {services.map((sv, i) => (
                <div key={i} style={{ ...s.svcCard, ...(!sv.active ? s.svcOff : {}) }}>
                  <div>
                    <p style={s.svcName}>{sv.name}</p>
                    <p style={s.svcPrice}>${sv.price.toLocaleString("es-AR")}</p>
                  </div>
                  <button
                    style={{ ...s.toggleBtn, ...(sv.active ? s.toggleOn : s.toggleOff) }}
                    onClick={() => setServices((prev) => prev.map((x, idx) => idx === i ? { ...x, active: !x.active } : x))}
                  >
                    {sv.active ? "● Activo" : "○ Oculto"}
                  </button>
                </div>
              ))}
            </div>

            <h3 style={{ ...s.secTitle, marginTop: 28 }}>Agregar servicio</h3>
            <div style={s.addForm}>
              <input style={s.input} placeholder="Nombre del servicio" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
              <input style={s.input} placeholder="Precio (ej: 10000)" inputMode="numeric" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value.replace(/\D/g, ""))} />
              <button style={s.btnAdd} onClick={addService}>+ Agregar servicio</button>
            </div>
          </div>
        )}

        {/* ── HORARIOS ── */}
        {activeTab === "horarios" && (
          <div className="fadeIn">
            <h3 style={s.secTitle}>Horarios disponibles</h3>
            <p style={s.secSub}>Las clientas solo verán los horarios activos al reservar.</p>
            <div style={s.slotsGrid}>
              {ALL_TIME_SLOTS.map((slot) => {
                const on = enabledSlots.includes(slot);
                return (
                  <div key={slot} style={{ ...s.slotCard, ...(on ? s.slotOn : s.slotOffCard) }} className="card-lift" onClick={() => toggleSlot(slot)}>
                    <span style={s.slotTime}>{slot}</span>
                    <span style={{ fontSize: 16 }}>{on ? "🟢" : "⭕"}</span>
                  </div>
                );
              })}
            </div>
            <div style={s.slotFooter}>
              <span style={s.slotCount}>{enabledSlots.length}/{ALL_TIME_SLOTS.length} activos</span>
              <button style={s.resetBtn} onClick={() => setEnabledSlots(ALL_TIME_SLOTS)}>Activar todos</button>
            </div>
          </div>
        )}
      </main>

      {/* Move Modal */}
      {moveModal.open && moveModal.apt && (
        <div style={s.overlay} onClick={() => setMoveModal({ open: false, apt: null })}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()} className="fadeIn">
            <h3 style={s.modalTitle}>📅 Reprogramar turno</h3>
            <p style={s.modalSub}>{moveModal.apt.client_name} · {moveModal.apt.service_name}</p>
            <label style={s.label}>Nueva fecha</label>
            <input type="date" style={s.input} value={moveDate} onChange={(e) => setMoveDate(e.target.value)} min={formatDate(new Date())} />
            <label style={{ ...s.label, marginTop: 14 }}>Nuevo horario</label>
            <div style={s.modalSlots}>
              {ALL_TIME_SLOTS.map((t) => (
                <button key={t} style={{ ...s.modalSlotBtn, ...(moveTime === t ? s.modalSlotActive : {}) }} onClick={() => setMoveTime(t)}>{t}</button>
              ))}
            </div>
            <div style={s.modalActions}>
              <button style={s.btnCancel} onClick={() => setMoveModal({ open: false, apt: null })}>Cancelar</button>
              <button style={s.btnConfirm} onClick={moveAppointment} disabled={movingId}>{movingId ? "Guardando..." : "✓ Confirmar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CSS ─── */
const css = `
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

/* ─── PIN styles ─── */
const p: Record<string, React.CSSProperties> = {
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

/* ─── Dashboard styles ─── */
const s: Record<string, React.CSSProperties> = {
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

  tabsRow: { display: "flex", gap: 8, padding: "16px 16px 0", maxWidth: 700, margin: "0 auto", width: "100%" },
  tab: { flex: 1, background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(255,180,210,0.3)", borderRadius: 14, color: "#c77dab", fontSize: 13, fontWeight: 600, padding: "11px 8px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s" },
  tabActive: { background: "linear-gradient(135deg, rgba(255,110,180,0.15), rgba(233,30,99,0.1))", border: "1.5px solid rgba(233,30,99,0.35)", color: "#e91e63" },

  main: { padding: "20px 16px 60px", maxWidth: 700, margin: "0 auto" },

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
  btnConfirm: { background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: 12, color: "#fff", fontSize: 12, fontWeight: 700, padding: "9px 14px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" },
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
  slotCard: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderRadius: 14, padding: "10px 14px", border: "1.5px solid rgba(255,180,210,0.3)", minWidth: 120, flex: "1 0 120px", transition: "all 0.2s" },
  slotOn: { background: "rgba(255,240,247,0.9)", borderColor: "rgba(255,110,180,0.4)" },
  slotOffCard: { background: "rgba(245,235,240,0.5)", opacity: 0.6 },
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
  btnCancel: { flex: 1, background: "rgba(245,235,240,0.9)", border: "1.5px solid rgba(200,170,185,0.4)", borderRadius: 14, color: "#a0738c", fontSize: 14, fontWeight: 600, padding: "13px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" },
};