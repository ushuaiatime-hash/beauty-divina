"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PIN = "1234";

export default function PanelPage() {
  const [acceso, setAcceso] = useState(false);
  const [pin, setPin] = useState("");
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (acceso) {
      setLoading(true);
      supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) setTurnos(data);
          setLoading(false);
        });
    }
  }, [acceso]);

  if (!acceso) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ background: "white", padding: 40, borderRadius: 20, maxWidth: 400, width: "100%", textAlign: "center" }}>
          <h2>🔐 Panel</h2>
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
            onKeyDown={(e) => e.key === "Enter" && pin === PIN && setAcceso(true)}
          />
          <button
            onClick={() => pin === PIN && setAcceso(true)}
            style={{ width: "100%", padding: 12, background: "#1a1a2e", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Entrar
          </button>
          {pin && pin !== PIN && <p style={{ color: "red" }}>PIN incorrecto</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <header style={{ background: "#1a1a2e", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: 20 }}>📊 Panel - Turnos</h1>
        <button onClick={() => setAcceso(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "6px 14px", borderRadius: 6, cursor: "pointer" }}>Salir</button>
      </header>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
        {loading ? (
          <p>Cargando turnos...</p>
        ) : turnos.length === 0 ? (
          <p>No hay turnos aún</p>
        ) : (
          turnos.map((t) => (
            <div key={t.id} style={{ background: "white", borderRadius: 12, padding: 15, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <p><strong>{t.client_name}</strong> - {t.service_name}</p>
              <p style={{ fontSize: 14, color: "#666" }}>{t.date} a las {t.time}</p>
              <p style={{ fontSize: 14, color: "#666" }}>📱 {t.client_phone}</p>
              <p style={{ fontSize: 16, color: "#e91e63", fontWeight: "bold" }}>${t.price?.toLocaleString("es-AR")}</p>
              <a href={`https://wa.me/${t.client_phone}`} target="_blank" style={{ display: "inline-block", marginTop: 8, background: "#25D366", color: "white", padding: "6px 14px", borderRadius: 6, textDecoration: "none", fontSize: 13 }}>💬 WhatsApp</a>
            </div>
          ))
        )}
      </main>
    </div>
  );
}