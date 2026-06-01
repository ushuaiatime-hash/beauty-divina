"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PanelPage() {
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  const [turnos, setTurnos] = useState([]);

  useEffect(() => {
    if (auth) {
      supabase.from("appointments").select("*").then(({ data }) => setTurnos(data || []));
    }
  }, [auth]);

  if (!auth) {
    return (
      <div style={{ background: "#0d0a0e", color: "white", minHeight: "100vh", padding: 50 }}>
        <h2>Panel Admin</h2>
        <input type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{ padding: 8, margin: 10 }} />
        <button onClick={() => pin === "1234" && setAuth(true)} style={{ background: "#ff6eb4", padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer" }}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d0a0e", color: "white", minHeight: "100vh", padding: 20 }}>
      <h2>Turnos</h2>
      {turnos.length === 0 && <p>No hay turnos</p>}
      {turnos.map((t: any) => (
        <div key={t.id} style={{ border: "1px solid gray", margin: 10, padding: 10, borderRadius: 8 }}>
          {t.client_name} - {t.date} {t.time}
        </div>
      ))}
    </div>
  );
}
