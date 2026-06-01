"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReservarPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [professional, setProfessional] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const services = [
    { id: "s1", name: "Manicuria Semipermanente", price: 3500, dur: 60 },
    { id: "s2", name: "Pedicuría Completa", price: 4200, dur: 75 },
    { id: "s3", name: "Limpieza Facial Profunda", price: 6500, dur: 90 },
    { id: "s4", name: "Depilación Piernas", price: 3000, dur: 50 },
  ];

  const professionals = [
    { id: "p1", name: "Milagros Dominguez" },
    { id: "p2", name: "Micaela Gomez" },
  ];

  const times = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  async function submit() {
    if (!name || !phone || !service || !professional || !date || !time) return;
    setLoading(true);
    const { error } = await supabase.from("appointments").insert({
      client_name: name,
      client_phone: phone,
      service_name: service,
      professional_name: professional,
      date: date,
      time: time,
      status: "pending"
    });
    if (error) {
      alert("Error al guardar");
    } else {
      setStep(4);
    }
    setLoading(false);
  }

  if (step === 1) return (
    <div style={{ background: "#0d0a0e", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1 style={{ color: "#ff6eb4" }}>Beauty Divina Turnos</h1>
      <p>📍 Cairo 83, Monte Grande</p>
      <button onClick={() => setStep(2)} style={{ background: "#ff6eb4", border: "none", padding: 12, borderRadius: 12, marginTop: 20, cursor: "pointer" }}>Reservar turno</button>
    </div>
  );

  if (step === 2) return (
    <div style={{ background: "#0d0a0e", color: "white", minHeight: "100vh", padding: 20 }}>
      <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>← Volver</button>
      <h2>Elegí servicio</h2>
      {services.map(s => (
        <div key={s.id} onClick={() => { setService(s.name); setStep(3); }} style={{ background: "#180f18", padding: 12, borderRadius: 12, marginBottom: 10, cursor: "pointer" }}>
          <strong>{s.name}</strong> - ${s.price} - {s.dur}min
        </div>
      ))}
    </div>
  );

  if (step === 3) return (
    <div style={{ background: "#0d0a0e", color: "white", minHeight: "100vh", padding: 20 }}>
      <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>← Volver</button>
      <h2>Completá tus datos</h2>
      <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} style={{ display: "block", width: "100%", padding: 10, marginBottom: 10, background: "#180f18", border: "none", borderRadius: 8, color: "white" }} />
      <input placeholder="WhatsApp (11 4444 5555)" value={phone} onChange={e => setPhone(e.target.value)} style={{ display: "block", width: "100%", padding: 10, marginBottom: 10, background: "#180f18", border: "none", borderRadius: 8, color: "white" }} />
      <select value={service} onChange={e => setService(e.target.value)} style={{ display: "block", width: "100%", padding: 10, marginBottom: 10, background: "#180f18", border: "none", borderRadius: 8, color: "white" }}>
        <option>Servicio</option>
        {services.map(s => <option key={s.id}>{s.name}</option>)}
      </select>
      <select value={professional} onChange={e => setProfessional(e.target.value)} style={{ display: "block", width: "100%", padding: 10, marginBottom: 10, background: "#180f18", border: "none", borderRadius: 8, color: "white" }}>
        <option>Profesional</option>
        {professionals.map(p => <option key={p.id}>{p.name}</option>)}
      </select>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ display: "block", width: "100%", padding: 10, marginBottom: 10, background: "#180f18", border: "none", borderRadius: 8, color: "white" }} />
      <select value={time} onChange={e => setTime(e.target.value)} style={{ display: "block", width: "100%", padding: 10, marginBottom: 10, background: "#180f18", border: "none", borderRadius: 8, color: "white" }}>
        <option>Horario</option>
        {times.map(t => <option key={t}>{t}</option>)}
      </select>
      <button onClick={submit} disabled={loading} style={{ background: "#ff6eb4", border: "none", padding: 12, borderRadius: 12, width: "100%", cursor: "pointer" }}>{loading ? "Reservando..." : "Confirmar"}</button>
    </div>
  );

  return (
    <div style={{ background: "#0d0a0e", color: "white", minHeight: "100vh", textAlign: "center", paddingTop: 80 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ff6eb4", color: "black", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>✓</div>
      <h2>¡Turno reservado!</h2>
      <button onClick={() => window.location.reload()} style={{ marginTop: 20, background: "#ff6eb4", border: "none", padding: 12, borderRadius: 12, cursor: "pointer" }}>Nueva reserva</button>
    </div>
  );
}
