"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#0d0a0e;color:#fff}
  button{cursor:pointer}
  .ff{font-family:'Syne',sans-serif}
  .ab{background:#ff6eb4;color:#000;font-weight:800;border:none}
  .sf{background:#180f18;border:1px solid rgba(255,110,180,.1)}
`;

const BIZ = { name: "Beauty Divina Turnos", pin: "1234", addr: "Cairo 83, Monte Grande", ownerPhone: "541164475239" };

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: "#0d0a0e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#180f18", padding: 32, borderRadius: 24, textAlign: "center" }}>
        <h2 className="ff">Panel Admin</h2>
        <input type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{ margin: "16px 0", padding: 12, borderRadius: 12, border: "none", width: "100%" }} />
        <button onClick={() => pin === BIZ.pin && onUnlock()} className="ab" style={{ padding: "12px 24px", borderRadius: 12, width: "100%" }}>Entrar</button>
      </div>
    </div>
  );
}

function Admin() {
  const [apts, setApts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    const { data } = await supabase.from("appointments").select("*").order("date", { ascending: false });
    setApts(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    loadAppointments();
  }

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}>Cargando...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1 className="ff" style={{ fontSize: 24 }}>Panel Admin - {BIZ.name}</h1>
      {apts.length === 0 && <p>No hay turnos</p>}
      {apts.map(a => (
        <div key={a.id} className="sf" style={{ borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <p><strong>{a.client_name}</strong> - {a.service_name}</p>
          <p style={{ fontSize: 12 }}>{a.date} {a.time}hs · {a.professional_name}</p>
          <p style={{ fontSize: 12 }}>WhatsApp: {a.client_phone}</p>
          <p style={{ fontSize: 12, marginBottom: 8 }}>Estado: <span style={{ fontWeight: "bold", color: a.status === "pending" ? "yellow" : a.status === "confirmed" ? "lightgreen" : "gray" }}>{a.status}</span></p>
          <div style={{ display: "flex", gap: 8 }}>
            {a.status === "pending" && <button onClick={() => updateStatus(a.id, "confirmed")} className="ab" style={{ padding: "8px 16px", borderRadius: 12 }}>Confirmar</button>}
            {a.status === "confirmed" && <button onClick={() => updateStatus(a.id, "completed")} className="ab" style={{ padding: "8px 16px", borderRadius: 12 }}>Completar</button>}
            <button onClick={() => updateStatus(a.id, "cancelled")} style={{ padding: "8px 16px", borderRadius: 12, background: "red", color: "white", border: "none" }}>Cancelar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PanelPage() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;
  return <Admin />;
}
