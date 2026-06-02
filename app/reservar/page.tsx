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
  { id: 1, name: "Milagros Dominguez", role: "Uñas & Pedicura", avatar: "M", services: [1, 2], color: "#ff6eb4" },
  { id: 2, name: "Micaela Gomez", role: "Cosmetología", avatar: "Mi", services: [3, 4], color: "#c44dff" },
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
      .from("appointments")
      .select("time")
      .eq("date", selectedDate)
      .eq("professional_name", selectedProfessional?.name)
      .neq("status", "cancelled");
    if (data) setBookedSlots(data.map((d: any) => d.time));
  }

  const availableProfessionals = selectedService
    ? PROFESSIONALS.filter((p) => p.services.includes(selectedService.id))
    : PROFESSIONALS;

  async function handleReservar() {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      setError("Por favor completá todos los campos.");
      return;
    }
    setLoading(true);
    setError("");
    const fullPhone = "54" + clientPhone.replace(/\D/g, "");
    const { error: dbError } = await supabase.from("appointments").insert([{
      client_name: clientName,
      client_phone: fullPhone,
      service_name: selectedService.name,
      professional_name: selectedProfessional.name,
      date: selectedDate,
      time: selectedTime,
      duration_minutes: selectedService.duration,
      price: selectedService.price,
      status: "pending",
    }]);
    if (dbError) { setError("Hubo un error al guardar. Intentá de nuevo."); setLoading(false); return; }
    const [year, month, day] = selectedDate.split("-");
    const msg = encodeURIComponent(
      `📅 NUEVA RESERVA - Beauty Divina\n\n` +
      `👤 Cliente: ${clientName}\n` +
      `📱 WhatsApp: +${fullPhone}\n` +
      `💅 Servicio: ${selectedService.name}\n` +
      `👩‍💼 Profesional: ${selectedProfessional.name}\n` +
      `📆 Fecha: ${day}/${month}/${year}\n` +
      `⏰ Hora: ${selectedTime}\n` +
      `💰 Precio: $${selectedService.price.toLocaleString("es-AR")}\n\n` +
      `✨ Reserva realizada desde Beauty Divina Turnos`
    );
    window.open(`https://wa.me/541124055260?text=${msg}`, "_blank");
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div style={styles.page}>
        <style>{globalCSS}</style>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>¡Turno Reservado!</h2>
          <p style={styles.successText}>Tu turno fue confirmado para el <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong> con <strong>{selectedProfessional?.name}</strong>.</p>
          <p style={{ ...styles.successText, fontSize: 14, opacity: 0.7 }}>Se envió notificación por WhatsApp. ¡Te esperamos! 💅</p>
          <button style={styles.primaryBtn} onClick={() => { setStep(1); setSuccess(false); setSelectedService(null); setSelectedProfessional(null); setSelectedTime(""); setClientName(""); setClientPhone(""); }}>
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{globalCSS}</style>
      <header style={styles.header}>
        <div style={styles.logoWrap}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>Beauty Divina</span>
        </div>
        <p style={styles.logoSub}>Sistema de Turnos Online</p>
      </header>

      <div style={styles.progressWrap}>
        {[1,2,3,4].map((s) => (
          <div key={s} style={styles.progressItem}>
            <div style={{ ...styles.progressCircle, ...(step >= s ? styles.progressActive : {}) }}>
              {step > s ? "✓" : s}
            </div>
            <span style={{ ...styles.progressLabel, ...(step >= s ? { color: "#ff6eb4" } : {}) }}>
              {s === 1 ? "Servicio" : s === 2 ? "Profesional" : s === 3 ? "Fecha" : "Datos"}
            </span>
            {s < 4 && <div style={{ ...styles.progressLine, ...(step > s ? styles.progressLineActive : {}) }} />}
          </div>
        ))}
      </div>

      <main style={styles.main}>
        {step === 1 && (
          <div style={styles.stepWrap} className="fadeIn">
            <h2 style={styles.stepTitle}>¿Qué servicio querés?</h2>
            <p style={styles.stepSub}>Elegí el tratamiento que más te guste</p>
            <div style={styles.serviceGrid}>
              {SERVICES.map((s) => (
                <div key={s.id} style={{ ...styles.serviceCard, ...(selectedService?.id === s.id ? styles.serviceCardActive : {}) }} className="card-hover" onClick={() => setSelectedService(s)}>
                  <span style={styles.serviceIcon}>{s.icon}</span>
                  <h3 style={styles.serviceName}>{s.name}</h3>
                  <p style={styles.serviceDesc}>{s.desc}</p>
                  <div style={styles.serviceFooter}>
                    <span style={styles.servicePrice}>${s.price.toLocaleString("es-AR")}</span>
                    <span style={styles.serviceDuration}>{s.duration} min</span>
                  </div>
                  {selectedService?.id === s.id && <div style={styles.selectedBadge}>✓ Seleccionado</div>}
                </div>
              ))}
            </div>
            <button style={{ ...styles.primaryBtn, ...(selectedService ? {} : styles.btnDisabled) }} disabled={!selectedService} onClick={() => setStep(2)}>
              Continuar →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={styles.stepWrap} className="fadeIn">
            <button style={styles.backBtn} onClick={() => setStep(1)}>← Volver</button>
            <h2 style={styles.stepTitle}>¿Con quién querés atenderte?</h2>
            <p style={styles.stepSub}>Elegí tu profesional de confianza</p>
            <div style={styles.profGrid}>
              {availableProfessionals.map((p) => (
                <div key={p.id} style={{ ...styles.profCard, ...(selectedProfessional?.id === p.id ? styles.profCardActive : {}) }} className="card-hover" onClick={() => setSelectedProfessional(p)}>
                  <div style={{ ...styles.profAvatar, background: p.color }}>{p.avatar}</div>
                  <h3 style={styles.profName}>{p.name}</h3>
                  <p style={styles.profRole}>{p.role}</p>
                  {selectedProfessional?.id === p.id && <div style={styles.selectedBadge}>✓ Seleccionada</div>}
                </div>
              ))}
            </div>
            <button style={{ ...styles.primaryBtn, ...(selectedProfessional ? {} : styles.btnDisabled) }} disabled={!selectedProfessional} onClick={() => setStep(3)}>
              Continuar →
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={styles.stepWrap} className="fadeIn">
            <button style={styles.backBtn} onClick={() => setStep(2)}>← Volver</button>
            <h2 style={styles.stepTitle}>¿Cuándo te viene bien?</h2>
            <p style={styles.stepSub}>Seleccioná fecha y horario disponible</p>
            <div style={styles.calendarScroll}>
              {calendarDates.map((d) => {
                const dateStr = formatDate(d);
                const isSelected = selectedDate === dateStr;
                const isToday = formatDate(new Date()) === dateStr;
                return (
                  <div key={dateStr} style={{ ...styles.calDay, ...(isSelected ? styles.calDayActive : {}), ...(isToday ? styles.calDayToday : {}) }} className="card-hover" onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); }}>
                    <span style={styles.calDayName}>{DAY_NAMES[d.getDay()]}</span>
                    <span style={styles.calDayNum}>{d.getDate()}</span>
                    <span style={styles.calDayMonth}>{MONTH_NAMES[d.getMonth()].slice(0,3)}</span>
                  </div>
                );
              })}
            </div>
            <h3 style={styles.slotTitle}>Horarios disponibles</h3>
            <div style={styles.slotGrid}>
              {TIME_SLOTS.map((t) => {
                const isBooked = bookedSlots.includes(t);
                const isSelected = selectedTime === t;
                return (
                  <button key={t} disabled={isBooked} style={{ ...styles.slotBtn, ...(isBooked ? styles.slotBooked : {}), ...(isSelected ? styles.slotSelected : {}) }} onClick={() => !isBooked && setSelectedTime(t)}>
                    {t}
                    {isBooked && <span style={styles.slotBusyLabel}>Ocupado</span>}
                  </button>
                );
              })}
            </div>
            <button style={{ ...styles.primaryBtn, ...(selectedTime ? {} : styles.btnDisabled) }} disabled={!selectedTime} onClick={() => setStep(4)}>
              Continuar →
            </button>
          </div>
        )}

        {step === 4 && (
          <div style={styles.stepWrap} className="fadeIn">
            <button style={styles.backBtn} onClick={() => setStep(3)}>← Volver</button>
            <h2 style={styles.stepTitle}>Tus datos</h2>
            <p style={styles.stepSub}>Último paso para confirmar tu turno</p>
            <div style={styles.summaryCard}>
              <h4 style={styles.summaryTitle}>📋 Resumen de tu turno</h4>
              <div style={styles.summaryRow}><span>💅 Servicio</span><strong>{selectedService?.name}</strong></div>
              <div style={styles.summaryRow}><span>👩‍💼 Profesional</span><strong>{selectedProfessional?.name}</strong></div>
              <div style={styles.summaryRow}><span>📆 Fecha</span><strong>{selectedDate}</strong></div>
              <div style={styles.summaryRow}><span>⏰ Hora</span><strong>{selectedTime}</strong></div>
              <div style={styles.summaryRow}><span>💰 Precio</span><strong style={{ color: "#ff6eb4" }}>${selectedService?.price.toLocaleString("es-AR")}</strong></div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tu nombre completo</label>
              <input style={styles.input} placeholder="Ej: María García" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tu WhatsApp <span style={{ opacity: 0.6, fontSize: 12 }}>(sin código de país)</span></label>
              <div style={styles.phoneWrap}>
                <span style={styles.phonePrefix}>+54</span>
                <input style={{ ...styles.input, borderRadius: "0 12px 12px 0", borderLeft: "none" }} placeholder="Ej: 1134567890" value={clientPhone} onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ""))} maxLength={12} inputMode="tel" />
              </div>
            </div>
            {error && <div style={styles.errorMsg}>{error}</div>}
            <button style={{ ...styles.primaryBtn, ...(loading ? styles.btnDisabled : {}) }} disabled={loading} onClick={handleReservar}>
              {loading ? "Reservando..." : "✨ Confirmar Turno"}
            </button>
            <p style={styles.disclaimer}>Al confirmar, se enviará una notificación a la estética. 🌸</p>
          </div>
        )}
      </main>
      <footer style={styles.footer}>
        <p style={{ margin: 0, opacity: 0.4, fontSize: 12 }}>Beauty Divina © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #0d0a0e; }
  .fadeIn { animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
  .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(255,110,180,0.25); }
  input:focus { outline: none; border-color: #ff6eb4 !important; box-shadow: 0 0 0 3px rgba(255,110,180,0.15); }
  ::-webkit-scrollbar { height: 4px; }
  ::-webkit-scrollbar-track { background: #1a1520; }
  ::-webkit-scrollbar-thumb { background: #ff6eb4; border-radius: 4px; }
`;

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0d0a0e", fontFamily: "'Space Grotesk', sans-serif", color: "#fff", display: "flex", flexDirection: "column" },
  header: { textAlign: "center", padding: "40px 20px 20px", background: "linear-gradient(180deg, rgba(255,110,180,0.08) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,110,180,0.1)" },
  logoWrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 },
  logoDot: { width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg, #ff6eb4, #c44dff)", boxShadow: "0 0 12px #ff6eb4" },
  logoText: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #ff6eb4, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  logoSub: { margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase" },
  progressWrap: { display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: 0, flexWrap: "wrap", rowGap: 8 },
  progressItem: { display: "flex", alignItems: "center", gap: 6 },
  progressCircle: { width: 32, height: 32, borderRadius: "50%", background: "#1a1520", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)", transition: "all 0.3s" },
  progressActive: { background: "linear-gradient(135deg, #ff6eb4, #c44dff)", border: "2px solid #ff6eb4", color: "#fff", boxShadow: "0 0 16px rgba(255,110,180,0.5)" },
  progressLabel: { fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500, transition: "color 0.3s" },
  progressLine: { width: 24, height: 2, background: "rgba(255,255,255,0.1)", margin: "0 4px", transition: "background 0.3s" },
  progressLineActive: { background: "linear-gradient(90deg, #ff6eb4, #c44dff)" },
  main: { flex: 1, padding: "0 16px 40px", maxWidth: 600, width: "100%", margin: "0 auto" },
  stepWrap: { display: "flex", flexDirection: "column", gap: 0 },
  stepTitle: { fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px", background: "linear-gradient(135deg, #fff 60%, #ff6eb4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  stepSub: { color: "rgba(255,255,255,0.45)", fontSize: 14, margin: "0 0 24px" },
  serviceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 24 },
  serviceCard: { background: "linear-gradient(145deg, #1a1520, #120e18)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "22px 20px", position: "relative", overflow: "hidden", transition: "all 0.25s ease" },
  serviceCardActive: { border: "1px solid #ff6eb4", background: "linear-gradient(145deg, #1f1428, #160e20)", boxShadow: "0 0 30px rgba(255,110,180,0.2)" },
  serviceIcon: { fontSize: 32, display: "block", marginBottom: 12 },
  serviceName: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: "#fff" },
  serviceDesc: { fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", lineHeight: 1.5 },
  serviceFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  servicePrice: { fontWeight: 700, fontSize: 18, color: "#ff6eb4", fontFamily: "'Syne', sans-serif" },
  serviceDuration: { fontSize: 12, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 20 },
  selectedBadge: { position: "absolute", top: 12, right: 12, background: "linear-gradient(135deg, #ff6eb4, #c44dff)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  profGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 },
  profCard: { background: "linear-gradient(145deg, #1a1520, #120e18)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "28px 20px", textAlign: "center", position: "relative", transition: "all 0.25s ease" },
  profCardActive: { border: "1px solid #ff6eb4", boxShadow: "0 0 30px rgba(255,110,180,0.2)" },
  profAvatar: { width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 auto 14px", fontFamily: "'Syne', sans-serif", boxShadow: "0 8px 24px rgba(255,110,180,0.35)" },
  profName: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#fff" },
  profRole: { fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 },
  calendarScroll: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, marginBottom: 24, paddingTop: 4 },
  calDay: { minWidth: 60, height: 78, borderRadius: 16, background: "#1a1520", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "all 0.2s", cursor: "pointer", flexShrink: 0 },
  calDayActive: { background: "linear-gradient(135deg, #ff6eb4, #c44dff)", border: "1px solid #ff6eb4", boxShadow: "0 4px 20px rgba(255,110,180,0.4)" },
  calDayToday: { border: "1px solid rgba(255,110,180,0.4)" },
  calDayName: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, textTransform: "uppercase" },
  calDayNum: { fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1 },
  calDayMonth: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
  slotTitle: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "rgba(255,255,255,0.8)" },
  slotGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  slotBtn: { background: "#1a1520", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", padding: "10px 16px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "all 0.2s", minWidth: 72 },
  slotBooked: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)", cursor: "not-allowed" },
  slotSelected: { background: "linear-gradient(135deg, #ff6eb4, #c44dff)", border: "1px solid #ff6eb4", boxShadow: "0 4px 16px rgba(255,110,180,0.4)" },
  slotBusyLabel: { fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" },
  summaryCard: { background: "linear-gradient(145deg, #1a1520, #120e18)", border: "1px solid rgba(255,110,180,0.2)", borderRadius: 20, padding: "20px 22px", marginBottom: 24 },
  summaryTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 14px", color: "rgba(255,255,255,0.8)" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "rgba(255,255,255,0.6)", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  formGroup: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", marginBottom: 8 },
  input: { width: "100%", background: "#1a1520", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "'Space Grotesk', sans-serif", padding: "13px 16px", transition: "all 0.2s" },
  phoneWrap: { display: "flex", alignItems: "stretch" },
  phonePrefix: { background: "#1a1520", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px 0 0 12px", color: "#ff6eb4", fontWeight: 700, padding: "13px 14px", fontSize: 15, display: "flex", alignItems: "center", borderRight: "none" },
  primaryBtn: { width: "100%", background: "linear-gradient(135deg, #ff6eb4, #c44dff)", border: "none", borderRadius: 16, color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", padding: "16px", cursor: "pointer", marginTop: 8, boxShadow: "0 8px 32px rgba(255,110,180,0.35)", transition: "all 0.2s" },
  btnDisabled: { opacity: 0.35, cursor: "not-allowed", boxShadow: "none" },
  backBtn: { background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", padding: "0 0 16px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, textAlign: "left" },
  errorMsg: { background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)", borderRadius: 12, color: "#ff6060", fontSize: 13, padding: "12px 16px", marginTop: 8 },
  disclaimer: { fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 12, lineHeight: 1.5 },
  successCard: { maxWidth: 420, margin: "80px auto", padding: "48px 32px", background: "linear-gradient(145deg, #1a1520, #120e18)", border: "1px solid rgba(255,110,180,0.3)", borderRadius: 28, textAlign: "center", boxShadow: "0 20px 80px rgba(255,110,180,0.2)" },
  successIcon: { fontSize: 56, marginBottom: 20 },
  successTitle: { fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, background: "linear-gradient(135deg, #ff6eb4, #fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 16px" },
  successText: { fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: "0 0 12px" },
  footer: { textAlign: "center", padding: "20px", borderTop: "1px solid rgba(255,255,255,0.05)" },
};
