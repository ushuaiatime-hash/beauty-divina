"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--acc:#ff6eb4;--bg:#0d0a0e;--sf:#180f18;--br:rgba(255,110,180,.1);--tx:#f5f0f4;--mu:rgba(245,240,244,.45)}
  body{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--tx)}
  .ff{font-family:'Syne',sans-serif}
  .sf{background:var(--sf);border:1px solid var(--br)}
  .ab{background:var(--acc);color:var(--bg);font-weight:800;cursor:pointer;border:none}
  .tag{display:inline-flex;padding:2px 10px;border-radius:999px;font-size:.67rem;border:1px solid}
`;

const BIZ = { 
  name: "Beauty Divina Turnos", 
  desc: "Salón de belleza & estética premium 💅", 
  phone: "541164475239", 
  addr: "Cairo 83, Monte Grande", 
  ownerPhone: "541164475239"
};

const PROFS_INIT = [
  { id: "p1", name: "Milagros Dominguez", spec: "Uñas & Pedicura", ini: "MD" },
  { id: "p2", name: "Micaela Gomez", spec: "Cosmetología", ini: "MG" },
];

const SVCS = [
  { id: "s1", name: "Manicuria Semipermanente", desc: "Esmaltado semi + diseño", dur: 60, price: 3500, cat: "Uñas", active: true },
  { id: "s2", name: "Pedicuría Completa", desc: "Tratamiento completo", dur: 75, price: 4200, cat: "Uñas", active: true },
  { id: "s3", name: "Limpieza Facial Profunda", desc: "Limpieza + hidratación", dur: 90, price: 6500, cat: "Facial", active: true },
  { id: "s4", name: "Depilación Piernas", desc: "Cera fría premium", dur: 50, price: 3000, cat: "Depilación", active: true },
];

const today = () => new Date().toISOString().split("T")[0];
const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0]; };
const fmtP = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
const fmtD = (d: string) => { const f = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(d + "T00:00:00")); return f.charAt(0).toUpperCase() + f.slice(1); };

const waLink = (ph: string, msg: string) => {
  let clean = ph.replace(/\D/g, "");
  if (clean.length === 10 || clean.length === 11) clean = "54" + clean;
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
};

async function sendNotification(clientName: string, clientPhone: string, service: string, date: string, time: string) {
  const message = `📅 NUEVO TURNO\n\nCliente: ${clientName}\nWhatsApp: ${clientPhone}\nServicio: ${service}\nFecha: ${fmtD(date)}\nHora: ${time}hs\n📍 ${BIZ.addr}`;
  window.open(waLink(BIZ.ownerPhone, message), "_blank");
}

function Booking() {
  const [step, setStep] = useState(1);
  const [selSvc, setSvc] = useState<any>(null);
  const [selProf, setProf] = useState<any>(null);
  const [selDate, setDate] = useState("");
  const [selTime, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sub, setSub] = useState(false);
  const activeSvcs = SVCS.filter(s => s.active);

  async function submit() {
    if (!selSvc || !selProf || !selDate || !selTime || !name || !phone) return;
    setSub(true);

    const cancelToken = Math.random().toString(36).slice(2, 15);
    const { error } = await supabase.from("appointments").insert({
      client_name: name,
      client_phone: phone,
      service_name: selSvc.name,
      professional_name: selProf.name,
      date: selDate,
      time: selTime,
      duration_minutes: selSvc.dur,
      price: selSvc.price,
      status: "pending",
      cancel_token: cancelToken
    });

    if (error) {
      alert("Error al guardar");
    } else {
      await sendNotification(name, phone, selSvc.name, selDate, selTime);
      setStep(4);
    }
    setSub(false);
  }

  if (step === 1) return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <header style={{ padding: "44px 20px", borderBottom: "1px solid var(--br)" }}>
        <h1 className="ff" style={{ fontSize: 26, fontWeight: 800 }}>{BIZ.name}</h1>
        <p style={{ fontSize: 12, color: "var(--mu)" }}>{BIZ.desc}</p>
        <p style={{ fontSize: 11, color: "var(--mu)" }}>📍 {BIZ.addr}</p>
      </header>
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <h2 className="ff" style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>¿Qué servicio?</h2>
        {activeSvcs.map(s => (
          <div key={s.id} onClick={() => { setSvc(s); setStep(2); }} className="sf" style={{ borderRadius: 16, padding: 14, marginBottom: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><p className="ff" style={{ fontWeight: 700 }}>{s.name}</p><p style={{ fontSize: 12, color: "var(--mu)" }}>{s.desc}</p><div style={{ display: "flex", gap: 8, marginTop: 8 }}><span className="tag">{s.cat}</span><span>{s.dur}min</span></div></div>
              <p className="ff" style={{ fontWeight: 800, fontSize: 18, color: "var(--acc)" }}>{fmtP(s.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <header style={{ padding: "44px 20px", borderBottom: "1px solid var(--br)" }}>
        <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "var(--mu)", cursor: "pointer" }}>← Volver</button>
        <h1 className="ff" style={{ fontSize: 22, fontWeight: 800 }}>{BIZ.name}</h1>
      </header>
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <h2 className="ff" style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>¿Con quién?</h2>
        {PROFS_INIT.map(p => (
          <div key={p.id} onClick={() => { setProf(p); setStep(3); }} className="sf" style={{ borderRadius: 16, padding: 14, marginBottom: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(200,245,66,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{p.ini}</div>
              <div><p className="ff" style={{ fontWeight: 700 }}>{p.name}</p><p style={{ fontSize: 12, color: "var(--mu)" }}>{p.spec}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 3) return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <header style={{ padding: "44px 20px", borderBottom: "1px solid var(--br)" }}>
        <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "var(--mu)", cursor: "pointer" }}>← Volver</button>
        <h1 className="ff" style={{ fontSize: 22, fontWeight: 800 }}>{BIZ.name}</h1>
      </header>
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <h2 className="ff" style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Fecha y horario</h2>
        <input type="date" min={today()} max={addDays(60)} value={selDate} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: 12, background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 16, marginBottom: 16 }} />
        {selDate && <div><p>{fmtD(selDate)}</p><button onClick={() => setTime("10:00")}>10:00</button><button onClick={() => setTime("11:00")}>11:00</button></div>}
        {selTime && <button onClick={() => setStep(4)} className="ab" style={{ width: "100%", marginTop: 16, padding: 15, borderRadius: 16 }}>Continuar →</button>}
      </div>
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", textAlign: "center", paddingTop: 80 }}>
      <style>{CSS}</style>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--acc)", color: "black", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>✓</div>
      <h2 className="ff" style={{ fontSize: 24, fontWeight: 800 }}>¡Reserva enviada!</h2>
      <button onClick={() => window.location.reload()} style={{ marginTop: 24, background: "var(--acc)", color: "black", padding: "12px 24px", borderRadius: 40, border: "none", fontWeight: "bold", cursor: "pointer" }}>Nueva reserva</button>
    </div>
  );
}

export default function ReservarPage() {
  return <Booking />;
}