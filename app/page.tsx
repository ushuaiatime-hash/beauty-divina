"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#0d0a0e;color:#fff}
  button{cursor:pointer}
`;

const BIZ = { 
  name: "Beauty Divina Turnos", 
  phone: "541164475239", 
  pin: "1234" 
};

const PROFS = [
  { id: "p1", name: "Valentina Ruiz", ini: "VR" },
  { id: "p2", name: "Camila Torres", ini: "CT" },
];

const SVCS = [
  { id: "s1", name: "Manicuria", price: 3500, dur: 60 },
  { id: "s2", name: "Pedicuria", price: 4200, dur: 75 },
];

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Panel Admin</h1>
      <input type="password" placeholder="PIN" onChange={(e) => setPin(e.target.value)} />
      <button onClick={() => pin === BIZ.pin && onUnlock()}>Entrar</button>
    </div>
  );
}

function Booking() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name || !phone || !service) return;
    setLoading(true);
    const { error } = await supabase.from("appointments").insert({
      client_name: name,
      client_phone: phone,
      service_name: service,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(),
      price: service === "Manicuria" ? 3500 : 4200,
    });
    if (error) alert("Error");
    else setStep(3);
    setLoading(false);
  }

  if (step === 1) return (
    <div style={{ padding: "20px" }}>
      <h1>{BIZ.name}</h1>
      <button onClick={() => setStep(2)}>Reservar turno</button>
    </div>
  );
  if (step === 2) return (
    <div style={{ padding: "20px" }}>
      <h2>Completá tus datos</h2>
      <input placeholder="Nombre" onChange={(e) => setName(e.target.value)} /><br />
      <input placeholder="WhatsApp" onChange={(e) => setPhone(e.target.value)} /><br />
      <select onChange={(e) => setService(e.target.value)}>
        <option>Seleccioná servicio</option>
        {SVCS.map(s => <option key={s.id}>{s.name} ${s.price}</option>)}
      </select><br />
      <button onClick={submit} disabled={loading}>{loading ? "Reservando..." : "Confirmar"}</button>
    </div>
  );
  return <div style={{ padding: "20px" }}><h2>✅ Turno reservado</h2><a href={`https://wa.me/${BIZ.phone}`}>WhatsApp</a></div>;
}

function Admin() {
  const [apts, setApts] = useState([]);
  useEffect(() => {
    supabase.from("appointments").select("*").then(({ data }) => setApts(data || []));
  }, []);
  return (
    <div style={{ padding: "20px" }}>
      <h2>Panel Admin</h2>
      {apts.map((a: any) => (
        <div key={a.id} style={{ border: "1px solid #333", margin: "10px 0", padding: "10px" }}>
          <p><strong>{a.client_name}</strong> - {a.service_name}</p>
          <p>WhatsApp: {a.client_phone}</p>
          <p>Estado: {a.status}</p>
          <button onClick={() => supabase.from("appointments").update({ status: "confirmed" }).eq("id", a.id)}>Confirmar</button>
          <button onClick={() => supabase.from("appointments").update({ status: "completed" }).eq("id", a.id)}>Completar</button>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<"book" | "pin" | "admin">("book");
  const [unlocked, setUnlocked] = useState(false);
  if (view === "pin") return <PinScreen onUnlock={() => { setUnlocked(true); setView("admin"); }} />;
  if (view === "admin") return <Admin />;
  return <Booking />;
}