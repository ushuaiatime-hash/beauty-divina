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

// Datos de la dueña
const OWNER = {
  whatsapp: "541155916379",
  alias: "Milagrosdominguez150",
  titular: "Milagros Celeste Dominguez",
  direccion: "Cap Cairo 601, Monte Grande",
};

// Función para obtener fecha en zona horaria Argentina (UTC-3)
function getArgentinaDate(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3 * 3600000));
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Políticas de trabajo (ventana emergente)
function PoliticasModal({ onClose, onAccept }: { onClose: () => void; onAccept: () => void }) {
  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={modalStyles.title}>🌸 POLÍTICAS DE TRABAJO</h3>
        <div style={modalStyles.content}>
          <p><strong>1.</strong> Las sesiones son con turno previo, reservando con una SEÑA de <strong>$5.000</strong>. La seña NO ES REEMBOLSABLE. Sirve para reprogramar avisando mínimo 24hs antes.</p>
          <p><strong>2.</strong> Una vez que elijas el servicio, completás tus datos y TRANSFERÍS la seña al alias indicado. Luego envías el comprobante por WhatsApp.</p>
          <p><strong>3.</strong> Se enviarán recordatorios antes del turno. Si no confirmás asistencia, se puede perder la seña.</p>
          <p><strong>4.</strong> Tiempo de tolerancia: <strong>5 minutos</strong>. Pasado ese tiempo se cobrará un adicional de $5.000.</p>
          <p><strong>5.</strong> No se permiten acompañantes.</p>
          <p><strong>6.</strong> El lavado pre técnico está incluido. Corte de puntas incluido (flequillo no, extra $10.000).</p>
        </div>
        <div style={modalStyles.buttons}>
          <button style={modalStyles.cancelBtn} onClick={onClose}>Leer más tarde</button>
          <button style={modalStyles.acceptBtn} onClick={onAccept}>✅ Acepto las políticas</button>
        </div>
      </div>
    </div>
  );
}

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
  const [showPoliticas, setShowPoliticas] = useState(false);
  const [politicasAceptadas, setPoliticasAceptadas] = useState(false);

  useEffect(() => {
    const today = getArgentinaDate();
    const dates: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = addDays(today, i);
      if (d.getDay() !== 0) dates.push(d);
    }
    setCalendarDates(dates);
    const startDate = today.getDay() === 0 ? addDays(today, 1) : today;
    setSelectedDate(formatDate(startDate));
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
    if (!politicasAceptadas) {
      setShowPoliticas(true);
      return;
    }
    setLoading(true);
    setError("");
    const fullPhone = "54" + clientPhone.replace(/\D/g, "");
    
    // Guardar turno como "pending_seña" (esperando comprobante)
    const { error: dbError } = await supabase.from("appointments").insert([{
      client_name: clientName,
      client_phone: fullPhone,
      service_name: selectedService.name,
      professional_name: selectedProfessional.name,
      date: selectedDate,
      time: selectedTime,
      duration_minutes: selectedService.duration,
      price: selectedService.price,
      status: "pending_seña",
    }]);
    
    if (dbError) { 
      setError("Hubo un error al guardar. Intentá de nuevo."); 
      setLoading(false); 
      return; 
    }
    
    // Mensaje para la dueña
    const [year, month, day] = selectedDate.split("-");
    const msg = encodeURIComponent(
      `🌸 NUEVA RESERVA CON SEÑA PENDIENTE - Beauty Divina\n\n` +
      `👤 Cliente: ${clientName}\n` +
      `📱 WhatsApp: +${fullPhone}\n` +
      `💅 Servicio: ${selectedService.name}\n` +
      `👩‍💼 Profesional: ${selectedProfessional.name}\n` +
      `📆 Fecha: ${day}/${month}/${year}\n` +
      `⏰ Hora: ${selectedTime}\n` +
      `💰 Precio total: $${selectedService.price.toLocaleString("es-AR")}\n` +
      `💸 Seña: $5.000\n\n` +
      `📲 Alias para transferir: ${OWNER.alias}\n` +
      `👤 Titular: ${OWNER.titular}\n\n` +
      `🔔 La clienta debe enviar el comprobante de pago para confirmar el turno.\n` +
      `📍 Dirección: ${OWNER.direccion}`
    );
    window.open(`https://wa.me/${OWNER.whatsapp}?text=${msg}`, "_blank");
    
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div style={styles.page}>
        <style>{globalCSS}</style>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>¡Reserva pendiente!</h2>
          <p style={styles.successText}>Tu turno está <strong>pendiente de confirmación</strong>.</p>
          <p style={styles.successText}>Por favor, transferí la seña de <strong>$5.000</strong> a:</p>
          <div style={styles.aliasCard}>
            <p><strong>Alias:</strong> {OWNER.alias}</p>
            <p><strong>Titular:</strong> {OWNER.titular}</p>
          </div>
          <p style={styles.successText}>Luego enviá el comprobante por WhatsApp para confirmar tu turno.</p>
          <a href={`https://wa.me/${OWNER.whatsapp}?text=Hola! Ya realicé la transferencia de la seña para mi turno de ${selectedService?.name} el ${formatDisplayDate(selectedDate)} a las ${selectedTime}. Mi nombre es ${clientName}.`} target="_blank" style={styles.whatsappBtn}>
            💬 Enviar comprobante por WhatsApp
          </a>
          <button style={styles.primaryBtn} onClick={() => { setStep(1); setSuccess(false); setSelectedService(null); setSelectedProfessional(null); setSelectedTime(""); setClientName(""); setClientPhone(""); setPoliticasAceptadas(false); }}>
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{globalCSS}</style>
      
      {showPoliticas && (
        <PoliticasModal 
          onClose={() => setShowPoliticas(false)} 
          onAccept={() => { setPoliticasAceptadas(true); setShowPoliticas(false); }} 
        />
      )}
      
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
                <div key={s.id} style={{ ...styles.serviceCard, ...(selectedService?.id === s.id ? styles.serviceCardActive : {}) }} className="card-hover" onClick={() => { setSelectedService(s); setStep(2); }}>
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
          </div>
        )}

        {step === 2 && (
          <div style={styles.stepWrap} className="fadeIn">
            <h2 style={styles.stepTitle}>¿Con quién querés atenderte?</h2>
            <p style={styles.stepSub}>Elegí tu profesional de confianza</p>
            <div style={styles.profGrid}>
              {availableProfessionals.map((p) => (
                <div key={p.id} style={{ ...styles.profCard, ...(selectedProfessional?.id === p.id ? styles.profCardActive : {}) }} className="card-hover" onClick={() => { setSelectedProfessional(p); setStep(3); }}>
                  <div style={{ ...styles.profAvatar, background: p.color }}>{p.avatar}</div>
                  <h3 style={styles.profName}>{p.name}</h3>
                  <p style={styles.profRole}>{p.role}</p>
                  {selectedProfessional?.id === p.id && <div style={styles.selectedBadge}>✓ Seleccionada</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={styles.stepWrap} className="fadeIn">
            <h2 style={styles.stepTitle}>¿Cuándo te viene bien?</h2>
            <p style={styles.stepSub}>Seleccioná fecha y horario disponible</p>
            <div style={styles.calendarScroll}>
              {calendarDates.map((d) => {
                const dateStr = formatDate(d);
                const isSelected = selectedDate === dateStr;
                const isToday = formatDate(getArgentinaDate()) === dateStr;
                const dayNum = d.getDate();
                const monthName = MONTH_NAMES[d.getMonth()].slice(0, 3);
                return (
                  <div key={dateStr} style={{ ...styles.calDay, ...(isSelected ? styles.calDayActive : {}), ...(isToday ? styles.calDayToday : {}) }} className="card-hover" onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); }}>
                    <span style={styles.calDayName}>{DAY_NAMES[d.getDay()]}</span>
                    <span style={styles.calDayNum}>{dayNum}</span>
                    <span style={styles.calDayMonth}>{monthName}</span>
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
            {selectedTime && (
              <button style={{ ...styles.primaryBtn }} onClick={() => setStep(4)}>
                Continuar →
              </button>
            )}
          </div>
        )}

        {step === 4 && (
          <div style={styles.stepWrap} className="fadeIn">
            <h2 style={styles.stepTitle}>Tus datos</h2>
            <p style={styles.stepSub}>Último paso para reservar tu turno</p>
            <div style={styles.summaryCard}>
              <h4 style={styles.summaryTitle}>📋 Resumen de tu turno</h4>
              <div style={styles.summaryRow}><span>💅 Servicio</span><strong>{selectedService?.name}</strong></div>
              <div style={styles.summaryRow}><span>👩‍💼 Profesional</span><strong>{selectedProfessional?.name}</strong></div>
              <div style={styles.summaryRow}><span>📆 Fecha</span><strong>{formatDisplayDate(selectedDate)}</strong></div>
              <div style={styles.summaryRow}><span>⏰ Hora</span><strong>{selectedTime}</strong></div>
              <div style={styles.summaryRow}><span>💰 Precio total</span><strong style={{ color: "#e91e63" }}>${selectedService?.price.toLocaleString("es-AR")}</strong></div>
              <div style={styles.summaryRow}><span>💸 Seña requerida</span><strong style={{ color: "#e91e63" }}>$5.000</strong></div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tu nombre completo *</label>
              <input style={styles.input} placeholder="Ej: María García" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tu WhatsApp <span style={{ opacity: 0.6, fontSize: 12 }}>(sin código de país)</span> *</label>
              <div style={styles.phoneWrap}>
                <span style={styles.phonePrefix}>+54</span>
                <input style={{ ...styles.input, borderRadius: "0 12px 12px 0", borderLeft: "none" }} placeholder="Ej: 1134567890" value={clientPhone} onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ""))} maxLength={12} inputMode="tel" />
              </div>
            </div>
            <div style={styles.politicasNotice}>
              <input type="checkbox" checked={politicasAceptadas} onChange={(e) => setPoliticasAceptadas(e.target.checked)} />
              <label style={{ marginLeft: 8, fontSize: 13, color: "#a0738c" }}>
                Acepto las <button type="button" style={styles.politicasLink} onClick={() => setShowPoliticas(true)}>políticas de trabajo</button>
              </label>
            </div>
            {error && <div style={styles.errorMsg}>{error}</div>}
            <button style={{ ...styles.primaryBtn, ...(loading ? styles.btnDisabled : {}) }} disabled={loading} onClick={handleReservar}>
              {loading ? "Reservando..." : "✨ Reservar turno"}
            </button>
            <p style={styles.disclaimer}>Al reservar, se te pedirá una seña de $5.000 para confirmar el turno. 🌸</p>
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
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff0f5; }
  .fadeIn { animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
  .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(255,110,180,0.25); }
  input:focus { outline: none; border-color: #ff6eb4 !important; box-shadow: 0 0 0 3px rgba(255,110,180,0.15); }
  ::-webkit-scrollbar { height: 4px; }
  ::-webkit-scrollbar-track { background: #ffe4ec; }
  ::-webkit-scrollbar-thumb { background: #ff6eb4; border-radius: 4px; }
`;

const modalStyles: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modal: { background: "#fff", borderRadius: 28, maxWidth: 500, width: "100%", maxHeight: "80vh", overflowY: "auto", padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  title: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "#e91e63", marginBottom: 16, textAlign: "center" },
  content: { fontSize: 14, color: "#2d1b2e", lineHeight: 1.6, marginBottom: 24 },
  buttons: { display: "flex", gap: 12 },
  cancelBtn: { flex: 1, background: "#f0f0f0", border: "none", borderRadius: 40, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#666" },
  acceptBtn: { flex: 1, background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "none", borderRadius: 40, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#fff" },
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(160deg, #fff0f5 0%, #fdf2f8 60%, #ffe4ec 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#2d1b2e", display: "flex", flexDirection: "column" },
  header: { textAlign: "center", padding: "40px 20px 20px", background: "linear-gradient(180deg, rgba(255,110,180,0.08) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,110,180,0.1)" },
  logoWrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 },
  logoDot: { width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg, #ff6eb4, #c44dff)", boxShadow: "0 0 12px #ff6eb4" },
  logoText: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #ff6eb4, #e91e63)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  logoSub: { margin: 0, fontSize: 13, color: "rgba(45,27,46,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" },
  progressWrap: { display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: 0, flexWrap: "wrap", rowGap: 8 },
  progressItem: { display: "flex", alignItems: "center", gap: 6 },
  progressCircle: { width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.8)", border: "2px solid rgba(45,27,46,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "rgba(45,27,46,0.4)", transition: "all 0.3s" },
  progressActive: { background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "2px solid #ff6eb4", color: "#fff", boxShadow: "0 0 16px rgba(255,110,180,0.5)" },
  progressLabel: { fontSize: 12, color: "rgba(45,27,46,0.4)", fontWeight: 500, transition: "color 0.3s" },
  progressLine: { width: 24, height: 2, background: "rgba(45,27,46,0.1)", margin: "0 4px", transition: "background 0.3s" },
  progressLineActive: { background: "linear-gradient(90deg, #ff6eb4, #e91e63)" },
  main: { flex: 1, padding: "0 16px 40px", maxWidth: 600, width: "100%", margin: "0 auto" },
  stepWrap: { display: "flex", flexDirection: "column", gap: 0 },
  stepTitle: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#2d1b2e" },
  stepSub: { color: "rgba(45,27,46,0.5)", fontSize: 14, margin: "0 0 24px" },
  serviceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 24 },
  serviceCard: { background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,110,180,0.2)", borderRadius: 20, padding: "22px 20px", position: "relative", overflow: "hidden", transition: "all 0.25s ease", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" },
  serviceCardActive: { border: "1.5px solid #ff6eb4", background: "rgba(255,255,255,1)", boxShadow: "0 0 30px rgba(255,110,180,0.2)" },
  serviceIcon: { fontSize: 32, display: "block", marginBottom: 12 },
  serviceName: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: "#2d1b2e" },
  serviceDesc: { fontSize: 13, color: "rgba(45,27,46,0.6)", margin: "0 0 16px", lineHeight: 1.5 },
  serviceFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  servicePrice: { fontWeight: 700, fontSize: 18, color: "#e91e63", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  serviceDuration: { fontSize: 12, color: "rgba(45,27,46,0.5)", background: "rgba(255,240,247,0.8)", padding: "3px 10px", borderRadius: 20 },
  selectedBadge: { position: "absolute", top: 12, right: 12, background: "linear-gradient(135deg, #ff6eb4, #e91e63)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  profGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 },
  profCard: { background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,110,180,0.2)", borderRadius: 20, padding: "28px 20px", textAlign: "center", position: "relative", transition: "all 0.25s ease", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" },
  profCardActive: { border: "1.5px solid #ff6eb4", background: "rgba(255,255,255,1)", boxShadow: "0 0 30px rgba(255,110,180,0.2)" },
  profAvatar: { width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 auto 14px", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 8px 24px rgba(233,30,99,0.2)" },
  profName: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#2d1b2e" },
  profRole: { fontSize: 13, color: "rgba(45,27,46,0.5)", margin: 0 },
  calendarScroll: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, marginBottom: 24, paddingTop: 4 },
  calDay: { minWidth: 60, height: 78, borderRadius: 16, background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,110,180,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "all 0.2s", cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" },
  calDayActive: { background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "1.5px solid #e91e63", boxShadow: "0 4px 20px rgba(233,30,99,0.3)" },
  calDayToday: { border: "1.5px solid #ff6eb4", boxShadow: "0 0 0 3px rgba(255,110,180,0.1)" },
  calDayName: { fontSize: 11, color: "rgba(45,27,46,0.5)", fontWeight: 500, textTransform: "uppercase" },
  calDayNum: { fontSize: 22, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1, color: "#2d1b2e" },
  calDayMonth: { fontSize: 10, color: "rgba(45,27,46,0.5)" },
  slotTitle: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "#2d1b2e" },
  slotGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  slotBtn: { background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,110,180,0.2)", borderRadius: 12, color: "#2d1b2e", fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "10px 16px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "all 0.2s", minWidth: 72 },
  slotBooked: { background: "rgba(245,235,240,0.6)", border: "1.5px solid rgba(45,27,46,0.1)", color: "rgba(45,27,46,0.3)", cursor: "not-allowed" },
  slotSelected: { background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "1.5px solid #e91e63", boxShadow: "0 4px 16px rgba(233,30,99,0.3)", color: "#fff" },
  slotBusyLabel: { fontSize: 9, color: "rgba(45,27,46,0.3)", letterSpacing: "0.05em" },
  summaryCard: { background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,110,180,0.2)", borderRadius: 20, padding: "20px 22px", marginBottom: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" },
  summaryTitle: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 14px", color: "#2d1b2e" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "rgba(45,27,46,0.6)", padding: "6px 0", borderBottom: "1px solid rgba(45,27,46,0.05)" },
  formGroup: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "rgba(45,27,46,0.6)", marginBottom: 8 },
  input: { width: "100%", background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,110,180,0.2)", borderRadius: 12, color: "#2d1b2e", fontSize: 15, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "13px 16px", transition: "all 0.2s" },
  phoneWrap: { display: "flex", alignItems: "stretch" },
  phonePrefix: { background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,110,180,0.2)", borderRadius: "12px 0 0 12px", color: "#e91e63", fontWeight: 700, padding: "13px 14px", fontSize: 15, display: "flex", alignItems: "center", borderRight: "none" },
  politicasNotice: { display: "flex", alignItems: "center", margin: "16px 0", padding: "12px", background: "rgba(255,240,247,0.8)", borderRadius: 12 },
  politicasLink: { background: "none", border: "none", color: "#e91e63", fontWeight: 600, cursor: "pointer", textDecoration: "underline", fontSize: 13 },
  primaryBtn: { width: "100%", background: "linear-gradient(135deg, #ff6eb4, #e91e63)", border: "none", borderRadius: 16, color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "16px", cursor: "pointer", marginTop: 8, boxShadow: "0 8px 32px rgba(233,30,99,0.3)", transition: "all 0.2s" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed", boxShadow: "none" },
  errorMsg: { background: "rgba(220,50,80,0.1)", border: "1px solid rgba(220,50,80,0.3)", borderRadius: 12, color: "#c62a5e", fontSize: 13, padding: "12px 16px", marginTop: 8 },
  disclaimer: { fontSize: 12, color: "rgba(45,27,46,0.4)", textAlign: "center", marginTop: 12, lineHeight: 1.5 },
  successCard: { maxWidth: 420, margin: "40px auto", padding: "32px 24px", background: "rgba(255,255,255,0.95)", border: "1.5px solid rgba(255,110,180,0.3)", borderRadius: 28, textAlign: "center", boxShadow: "0 20px 80px rgba(233,30,99,0.1)" },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successTitle: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #ff6eb4, #e91e63)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 12px" },
  successText: { fontSize: 14, color: "rgba(45,27,46,0.6)", lineHeight: 1.5, margin: "0 0 10px" },
  aliasCard: { background: "#f0f0f0", padding: 12, borderRadius: 12, margin: "12px 0", textAlign: "center" },
  whatsappBtn: { display: "block", background: "#25D366", color: "#fff", textDecoration: "none", padding: "14px", borderRadius: 40, margin: "16px 0", fontWeight: 700, fontSize: 14, textAlign: "center" },
  footer: { textAlign: "center", padding: "20px", borderTop: "1px solid rgba(255,110,180,0.1)" },
};