"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const BIZ = { name: "Beauty Divina Turnos", pin: "1234" };

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: "#0d0a0e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#180f18", padding: 32, borderRadius: 24 }}>
        <h2 style={{ color: "white" }}>Panel Admin</h2>
        <input type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{ margin: "16px 0", padding: 12, borderRadius: 12, width: "100%" }} />
        <button onClick={() => pin === BIZ.pin && onUnlock()} style={{ background: "#ff6eb4", padding: "12px 24px", borderRadius: 12, width: "100%", border: "none", fontWeight: "bold", cursor: "pointer" }}>Entrar</button>
      </div>
    </div>
  );
}

function Admin() {
  const [apts, setApts] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("appointments").select("*").order("date", { ascending: false }).then(({ data }) => setApts(data || []));
  }, []);
  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setApts(apts.map(a => a.id === id ? { ...a, status } : a));
  }
  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ color: "white" }}>Panel Admin</h1>
      {apts.map(a => (
        <div key={a.id} style={{ background: "#180f18", borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <p><strong style={{ color: "white" }}>{a.client_name}</strong> - <span style={{ color: "#ff6eb4" }}>{a.service_name}</span></p>
          <p style={{ color: "#aaa" }}>{a.date} {a.time}hs · {a.professional_name}</p>
          <p style={{ color: "#aaa" }}>WhatsApp: {a.client_phone}</p>
          <p>Estado: <strong style={{ color: a.status === "pending" ? "#fde047" : a.status === "confirmed" ? "#4ade80" : "#f87171" }}>{a.status}</strong></p>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {a.status === "pending" && <button onClick={() => updateStatus(a.id, "confirmed")} style={{ background: "#ff6eb4", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>Confirmar</button>}
            {a.status === "confirmed" && <button onClick={() => updateStatus(a.id, "completed")} style={{ background: "#4ade80", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>Completar</button>}
            <button onClick={() => updateStatus(a.id, "cancelled")} style={{ background: "#ef4444", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>Cancelar</button>
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