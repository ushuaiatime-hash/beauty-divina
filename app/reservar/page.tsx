"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReservarPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [done, setDone] = useState(false);

  async function reservar() {
    if (!name || !phone || !date || !time) return;
    const { error } = await supabase.from("appointments").insert({
      client_name: name,
      client_phone: phone,
      date: date,
      time: time,
      service_name: "Manicuria",
      professional_name: "Milagros",
      status: "pending"
    });
    if (error) alert("Error");
    else setDone(true);
  }

  if (done) return <div style={{ background: "#0d0a0e", color: "white", minHeight: "100vh", padding: 50 }}><h1>✅ Turno reservado</h1></div>;

  return (
    <div style={{ background: "#0d0a0e", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1>Beauty Divina</h1>
      <p>📍 Cairo 83, Monte Grande</p>
      <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} style={{ display: "block", margin: 10, padding: 8, width: "100%" }} />
      <input placeholder="WhatsApp" value={phone} onChange={e => setPhone(e.target.value)} style={{ display: "block", margin: 10, padding: 8, width: "100%" }} />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ display: "block", margin: 10, padding: 8, width: "100%" }} />
      <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ display: "block", margin: 10, padding: 8, width: "100%" }} />
      <button onClick={reservar} style={{ background: "#ff6eb4", padding: 10, border: "none", borderRadius: 8, cursor: "pointer" }}>Reservar</button>
    </div>
  );
}