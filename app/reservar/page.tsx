"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SERVICES = [
  { id: 1, name: "Manicuria Semipermanente", price: 8000, duration: 60, icon: "💅", desc: "Esmaltado de larga duración, hasta 3 semanas" },
  { id: 2, name: "Pedicuría Completa", price: 9500, duration: 75, icon: "🦶", desc: "Cuidado completo de pies con esmaltado" },
  { id: 3, name: "Limpieza Facial Profunda", price: 12000, duration: 90, icon: "✨", desc: "Limpieza, hidratación y extracción profesional" },
  { id: 4, name: "Depilación Piernas", price: 7500, duration: 45, icon: "🌸", desc: "Cera caliente o fría, piernas completas" },
];

const PROFESSIONALS = [
  { id: 1, name: "Milagros Dominguez", role: "Uñas & Pedicura", avatar: "M", services: [1, 2], gradient: "linear-gradient(135deg, #ff6eb4, #ff4d8c)" },
  { id: 2, name: "Micaela Gomez", role: "Cosmetología", avatar: "Mi", services: [3, 4], gradient: "linear-gradient(135deg, #f472b6, #e91e63)" },
];

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00",
];

function formatDate(date: Date) { return date.toISOString().split("T")[0]; }
function addDays(date: Date, days: number) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }

const DAY_NAMES = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function ReservarPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<typeof PROFESSIONALS[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);
  const [pressedCard, setPressedCard] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = addDays(today, i);
      if (d.getDay() !== 0) dates.push(d);
    }
    setCalendarDates(dates);
    setSelectedDate(formatDate(today.getDay() === 0 ? addDays(today, 1) : today));
  }, []);

  useEffect(() => {
    if (selectedDate && selectedProfessional) fetchBookedSlots();
  }, [selectedDate, selectedProfessional]);

  async function fetchBookedSlots() {
    const { data } = await supabase
      .from("appointments").select("time")
      .eq("date", selectedDate)
      .eq("professional_name", selectedProfessional?.name)
      .neq("status", "cancelled");
    if (data) setBookedSlots(data.map((d: any) => d.time));
  }

  const availableProfessionals = selectedService
    ? PROFESSIONALS.filter((p) => p.services.includes(selectedService.id))
    : PROFESSIONALS;

  function handleSelectService(s: typeof SERVICES[0]) {
    setPressedCard(`svc-${s.id}`);
    setTimeout(() => { setPressedCard(null); setSelectedService(s); setSelectedProfessional(null); setStep(2); }, 200);
  }

  function handleSelectProfessional(p: typeof PROFESSIONALS[0]) {
    setPressedCard(`prof-${p.id}`);
    setTimeout(() => { setPressedCard(null); setSelectedProfessional(p); setStep(3); }, 200);
  }

  function handleSelectDate(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedTime("");
  }

  function handleSelectTime(t: string) {
    setPressedCard(`time-${t}`);
    setTimeout(() => { setPressedCard(null); setSelectedTime(t); setStep(4); }, 200);
  }

  async function handleReservar() {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      setError("Por favor completá todos los campos.");
      return;
    }
    setLoading(true);
    setError("");
    const fullPhone = "54" + clientPhone.replace(/\D/g, "");
    const { error: dbError } = await supabase.from("appointments").insert([{
      client_name: clientName, client_phone: fullPhone,
      service_name: selectedService.name, professional_name: selectedProfessional.name,
      date: selectedDate, time: selectedTime,
      duration_minutes: selectedService.duration, price: selectedService.price, status: "pending",
    }]);
    if (dbError) { setError("Hubo un error al guardar. Intentá de nuevo."); setLoading(false); return; }
    const [year, month, day] = selectedDate.split("-");
    const msg = encodeURIComponent(
      `📅 NUEVA RESERVA - Beauty Divina\n\n` +
      `👤 Cliente: ${clientName}\n📱 WhatsApp: +${fullPhone}\n` +
      `💅 Servicio: ${selectedService.name}\n👩‍💼 Profesional: ${selectedProfessional.name}\n` +
      `📆 Fecha: ${day}/${month}/${year}\n⏰ Hora: ${selectedTime}\n` +
      `📍 Cairo 83, Monte Grande\n💰 Precio: $${selectedService.price.toLocaleString("es-AR")}\n\n` +
      `✨ Reserva realizada desde Beauty Divina Turnos`
    );
    window.open(`https://wa.me/541124055260?text=${msg}`, "_blank");
    setSuccess(true);
    setLoading(false);
  }

  const stepLabels = ["Servicio", "Profesional", "Fecha", "Datos"];

  if (success) {
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.successWrap} className="fadeIn">
          <div style={s.successEmoji}>🎉</div>
          <h2 style={s.successTitle}>¡Turno Confirmado!</h2>
          <p style={s.successSub}>Tu turno fue registrado exitosamente.</p>
          <div style={s.successInfo}>
            <div style={s.successRow}><span>💅</span><span>{selectedService?.name}</span></div>
            <div style={s.successRow}><span>👩‍💼</span><span>{selectedProfessional?.name}</span></div>
            <div style={s.successRow}><span>📆</span><span>{selectedDate}</span></div>
            <div style={s.successRow}><span>⏰</span><span>{selectedTime}</span></div>
            <div style={s.successRow}><span>📍</span><span>Cairo 83, Monte Grande</span></div>
          </div>
          <p style={s.successNote}>Se envió un mensaje de WhatsApp al salón. ¡Te esperamos! 💕</p>
          <button style={s.btnPrimary} onClick={() => { setStep(1); setSuccess(false); setSelectedService(null); setSelectedProfessional(null); setSelectedTime(""); setClientName(""); setClientPhone(""); }}>
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <span style={s.logoDot}>✦</span>
            <span style={s.logoText}>Beauty Divina</span>
          </div>
          <p style={s.logoAddr}>📍 Cairo 83, Monte Grande</p>
        </div>
      </div>

      {/* Steps */}
      <div style={s.stepsBar}>
        {stepLabels.map((label, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={num} style={s.stepItem}>
              <div style={{ ...s.stepDot, ...(isActive ? s.stepDotActive : isDone ? s.stepDotDone : {}) }}>
                {isDone ? "✓" : num}
              </div>
              <span style={{ ...s.stepLabel, ...(isActive ? { color: "#e91e63", fontWeight: 600 } : isDone ? { color: "#ff6eb4" } : {}) }}>{label}</span>
              {i < 3 && <div style={{ ...s.stepLine, ...(isDone ? s.stepLineDone : {}) }} />}
            </div>
          );
        })}
      </div>

      <main style={s.main}>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="fadeIn">
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>¿Qué servicio querés? 💆‍♀️</h2>
              <p style={s.sectionSub}>Tocá para seleccionar</p>
            </div>
            <div style={s.grid2}>
              {SERVICES.map((svc) => {
                const pressed = pressedCard === `svc-${svc.id}`;
                return (
                  <div
                    key={svc.id}
                    style={{ ...s.card, ...(pressed ? s.cardPressed : {}) }}
                    className="card-lift"
                    onClick={() => handleSelectService(svc)}
                  >
                    <div style={s.cardIcon}>{svc.icon}</div>
                    <h3 style={s.cardTitle}>{svc.name}</h3>
                    <p style={s.cardDesc}>{svc.desc}</p>
                    <div style={s.cardFooter}>
                      <span style={s.cardPrice}>${svc.price.toLocaleString("es-AR")}</span>
                      <span style={s.cardBadge}>{svc.duration} min</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="fadeIn">
            <button style={s.backBtn} onClick={() => setStep(1)}>← Volver</button>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>¿Con quién vas? 👩‍💼</h2>
              <p style={s.sectionSub}>Tocá para seleccionar</p>
            </div>
            <div style={s.grid2}>
              {availableProfessionals.map((p) => {
                const pressed = pressedCard === `prof-${p.id}`;
                return (
                  <div
                    key={p.id}
                    style={{ ...s.card, ...s.cardProf, ...(pressed ? s.cardPressed : {}) }}
                    className="card-lift"
                    onClick={() => handleSelectProfessional(p)}
                  >
                    <div style={{ ...s.profAvatar, background: p.gradient }}>{p.avatar}</div>
                    <h3 style={s.cardTitle}>{p.name}</h3>
                    <p style={{ ...s.cardDesc, marginBottom: 0 }}>{p.role}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="fadeIn">
            <button style={s.backBtn} onClick={() => setStep(2)}>← Volver</button>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>¿Cuándo? 📆</h2>
              <p style={s.sectionSub}>Elegí fecha y tocá un horario libre</p>
            </div>

            {/* Calendar */}
            <div style={s.calScroll}>
              {calendarDates.map((d) => {
                const ds = formatDate(d);
                const sel = selectedDate === ds;
                const isToday = formatDate(new Date()) === ds;
                return (
                  <div
                    key={ds}
                    style={{ ...s.calDay, ...(sel ? s.calDayActive : {}), ...(isToday && !sel ? s.calDayToday : {}) }}
                    className="card-lift"
                    onClick={() => handleSelectDate(ds)}
                  >
                    <span style={{ ...s.calDayName, ...(sel ? { color: "#fff" } : {}) }}>{DAY_NAMES[d.getDay()]}</span>
                    <span style={{ ...s.calDayNum, ...(sel ? { color: "#fff" } : {}) }}>{d.getDate()}</span>
                    <span style={{ ...s.calMonthName, ...(sel ? { color: "rgba(255,255,255,0.8)" } : {}) }}>{MONTH_NAMES[d.getMonth()].slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>

            <h3 style={s.slotHeading}>Horarios disponibles</h3>
            <div style={s.slotsWrap}>
              {TIME_SLOTS.map((t) => {
                const booked = bookedSlots.includes(t);
                const pressed = pressedCard === `time-${t}`;
                return (
                  <button
                    key={t}
                    disabled={booked}
                    style={{ ...s.slotBtn, ...(booked ? s.slotBusy : s.slotFree), ...(pressed ? s.cardPressed : {}) }}
                    onClick={() => !booked && handleSelectTime(t)}
                  >
                    {t}
                    {booked && <span style={s.slotBusyTxt}>Ocupado</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="fadeIn">
            <button style={s.backBtn} onClick={() => setStep(3)}>← Volver</button>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Tus datos 🌸</h2>
              <p style={s.sectionSub}>Último paso para confirmar</p>
            </div>

            {/* Summary */}
            <div style={s.summaryCard}>
              <p style={s.summaryTitle}>📋 Resumen de tu turno</p>
              {[
                ["💅", selectedService?.name],
                ["👩‍💼", selectedProfessional?.name],
                ["📆", selectedDate],
                ["⏰", selectedTime],
                ["📍", "Cairo 83, Monte Grande"],
                ["💰", `$${selectedService?.price.toLocaleString("es-AR")}`],
              ].map(([icon, val], i) => (
                <div key={i} style={s.summaryRow}>
                  <span style={s.summaryIcon}>{icon}</span>
                  <span style={{ ...s.summaryVal, ...(i === 5 ? { color: "#e91e63", fontWeight: 700 } : {}) }}>{val}</span>
                </div>
              ))}
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Tu nombre completo</label>
              <input style={s.input} placeholder="Ej: María García" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Tu WhatsApp <span style={s.labelNote}>(sin código de país)</span></label>
              <div style={s.phoneRow}>
                <span style={s.phonePrefix}>+54</span>
                <input
                  style={{ ...s.input, borderRadius: "0 16px 16px 0", borderLeft: "none", flex: 1 }}
                  placeholder="Ej: 1134567890"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={12} inputMode="tel"
                />
              </div>
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            <button style={{ ...s.btnPrimary, ...(loading ? s.btnLoading : {}) }} disabled={loading} onClick={handleReservar}>
              {loading ? "Reservando..." : "✨ Confirmar Turno"}
            </button>
            <p style={s.disclaimer}>Al confirmar se notificará al salón por WhatsApp 💕</p>
          </div>
        )}
      </main>

      <div style={s.footer}>Beauty Divina · Cairo 83, Monte Grande · {new Date().getFullYear()}</div>
    </div>
  );
}

/* ─── CSS ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff0f5; }
  .fadeIn { animation: fadeIn 0.38s cubic-bezier(.4,0,.2,1) both; }
  @keyframes fadeIn { from { opacity:0; transform: translateY(18px); } to { opacity:1; transform: translateY(0); } }
  .card-lift { transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .card-lift:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(233,30,99,0.15); }
  input:focus { outline: none; border-color: #ff6eb4 !important; box-shadow: 0 0 0 4px rgba(255,110,180,0.12) !important; }
  button:active { transform: scale(0.97); }
  ::-webkit-scrollbar { height: 4px; }
  ::-webkit-scrollbar-thumb { background: #ffb3d1; border-radius: 4px; }
`;

/* ─── Styles ─── */
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(160deg, #fff0f5 0%, #fdf2f8 50%, #ffe4ec 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1a1a2e", display: "flex", flexDirection: "column" },
  header: { background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,110,180,0.15)", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 640, margin: "0 auto", padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  logo: { display: "flex", alignItems: "center", gap: 8 },
  logoDot: { fontSize: 18, color: "#ff4d8c" },
  logoText: { fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg, #ff4d8c, #e91e63)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  logoAddr: { fontSize: 12, color: "#c77dab", fontWeight: 500 },

  stepsBar: { display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 20px 0", gap: 0, flexWrap: "wrap", rowGap: 8 },
  stepItem: { display: "flex", alignItems: "center", gap: 5 },
  stepDot: { width: 30, height: 30, borderRadius: "50%", background: "#fff", border: "2px solid #ffc0d9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#c9a0b4", transition: "all 0.3s" },
  stepDotActive: { background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "2px solid #e91e63", color: "#fff", boxShadow: "0 4px 14px rgba(233,30,99,0.35)" },
  stepDotDone: { background: "linear-gradient(135deg, #ffb3d1, #ff6eb4)", border: "2px solid #ff6eb4", color: "#fff" },
  stepLabel: { fontSize: 11, color: "#c9a0b4", fontWeight: 500, transition: "all 0.3s" },
  stepLine: { width: 20, height: 2, background: "#ffc0d9", margin: "0 3px", transition: "background 0.3s" },
  stepLineDone: { background: "linear-gradient(90deg, #ff6eb4, #e91e63)" },

  main: { flex: 1, padding: "24px 16px 48px", maxWidth: 640, width: "100%", margin: "0 auto" },
  sectionHead: { marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 800, color: "#2d1b2e", marginBottom: 4 },
  sectionSub: { fontSize: 13, color: "#c77dab", fontWeight: 500 },

  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 },
  card: {
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1.5px solid rgba(255,180,210,0.35)",
    borderRadius: 24,
    padding: "22px 20px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 24px rgba(233,30,99,0.07)",
    position: "relative",
    overflow: "hidden",
  },
  cardProf: { textAlign: "center", padding: "28px 20px" },
  cardPressed: { transform: "scale(0.97)", boxShadow: "0 2px 8px rgba(233,30,99,0.1)" },
  cardIcon: { fontSize: 34, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#2d1b2e", marginBottom: 6 },
  cardDesc: { fontSize: 13, color: "#a0738c", lineHeight: 1.5, marginBottom: 14 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardPrice: { fontSize: 18, fontWeight: 800, color: "#e91e63" },
  cardBadge: { fontSize: 11, fontWeight: 600, color: "#c77dab", background: "#fff0f7", padding: "3px 10px", borderRadius: 20, border: "1px solid #ffc0d9" },

  profAvatar: { width: 70, height: 70, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(233,30,99,0.3)" },

  calScroll: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 14, marginBottom: 24 },
  calDay: { minWidth: 62, height: 82, borderRadius: 18, background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(255,180,210,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", flexShrink: 0, transition: "all 0.2s", boxShadow: "0 2px 12px rgba(233,30,99,0.06)" },
  calDayActive: { background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "1.5px solid #e91e63", boxShadow: "0 6px 20px rgba(233,30,99,0.35)" },
  calDayToday: { border: "1.5px solid #ff6eb4", boxShadow: "0 0 0 3px rgba(255,110,180,0.12)" },
  calDayName: { fontSize: 11, color: "#c77dab", fontWeight: 600, textTransform: "uppercase" },
  calDayNum: { fontSize: 22, fontWeight: 800, color: "#2d1b2e", lineHeight: 1 },
  calMonthName: { fontSize: 10, color: "#c77dab", fontWeight: 500 },

  slotHeading: { fontSize: 15, fontWeight: 700, color: "#2d1b2e", marginBottom: 12 },
  slotsWrap: { display: "flex", flexWrap: "wrap", gap: 9 },
  slotBtn: { borderRadius: 14, fontSize: 13, fontWeight: 700, padding: "10px 16px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 70, border: "none", transition: "all 0.18s", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  slotFree: { background: "rgba(255,255,255,0.9)", color: "#2d1b2e", border: "1.5px solid rgba(255,180,210,0.5)", boxShadow: "0 2px 10px rgba(233,30,99,0.06)" },
  slotBusy: { background: "rgba(240,230,235,0.5)", color: "#c9a0b4", cursor: "not-allowed", border: "1.5px solid rgba(220,200,210,0.4)" },
  slotBusyTxt: { fontSize: 9, letterSpacing: "0.03em", color: "#d4aec1" },

  summaryCard: { background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1.5px solid rgba(255,180,210,0.35)", borderRadius: 22, padding: "20px", marginBottom: 20, boxShadow: "0 4px 20px rgba(233,30,99,0.07)" },
  summaryTitle: { fontSize: 14, fontWeight: 700, color: "#a0738c", marginBottom: 14, letterSpacing: "0.02em" },
  summaryRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,180,210,0.2)" },
  summaryIcon: { fontSize: 16, width: 24, textAlign: "center" },
  summaryVal: { fontSize: 14, fontWeight: 600, color: "#2d1b2e", flex: 1 },

  formGroup: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#a0738c", marginBottom: 8 },
  labelNote: { fontWeight: 400, fontSize: 11, opacity: 0.7 },
  input: { width: "100%", background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,180,210,0.45)", borderRadius: 16, color: "#2d1b2e", fontSize: 15, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "13px 16px", transition: "all 0.2s", fontWeight: 500 },
  phoneRow: { display: "flex", alignItems: "stretch" },
  phonePrefix: { background: "rgba(255,240,247,0.9)", border: "1.5px solid rgba(255,180,210,0.45)", borderRadius: "16px 0 0 16px", color: "#e91e63", fontWeight: 700, fontSize: 15, padding: "13px 14px", display: "flex", alignItems: "center", borderRight: "none" },

  btnPrimary: { width: "100%", background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "none", borderRadius: 18, color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "16px", cursor: "pointer", marginTop: 8, boxShadow: "0 8px 30px rgba(233,30,99,0.35)", letterSpacing: "0.02em", transition: "all 0.2s" },
  btnLoading: { opacity: 0.65, cursor: "not-allowed" },

  backBtn: { background: "transparent", border: "none", color: "#c77dab", fontSize: 14, cursor: "pointer", padding: "0 0 18px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
  errorBox: { background: "rgba(255,220,230,0.6)", border: "1px solid rgba(233,30,99,0.25)", borderRadius: 14, color: "#c62a5e", fontSize: 13, padding: "12px 16px", marginBottom: 12 },
  disclaimer: { fontSize: 12, color: "#c9a0b4", textAlign: "center", marginTop: 12, lineHeight: 1.5 },

  successWrap: { maxWidth: 420, margin: "60px auto", padding: "40px 28px", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1.5px solid rgba(255,180,210,0.4)", borderRadius: 28, textAlign: "center", boxShadow: "0 20px 60px rgba(233,30,99,0.12)" },
  successEmoji: { fontSize: 56, marginBottom: 16 },
  successTitle: { fontSize: 26, fontWeight: 800, color: "#2d1b2e", marginBottom: 6 },
  successSub: { fontSize: 14, color: "#a0738c", marginBottom: 20 },
  successInfo: { background: "rgba(255,240,247,0.7)", borderRadius: 16, padding: "16px", marginBottom: 16, textAlign: "left" },
  successRow: { display: "flex", gap: 10, padding: "6px 0", fontSize: 14, color: "#2d1b2e", fontWeight: 500, borderBottom: "1px solid rgba(255,180,210,0.2)" },
  successNote: { fontSize: 13, color: "#c77dab", marginBottom: 20, lineHeight: 1.5 },

  footer: { textAlign: "center", padding: "16px", fontSize: 12, color: "#d4aec1", borderTop: "1px solid rgba(255,180,210,0.2)" },
};