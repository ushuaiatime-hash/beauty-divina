"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PIN_DUENO = "1234";

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [pin, setPin] = useState("");
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autenticado) {
      cargarPedidos();
    }
  }, [autenticado]);

  async function cargarPedidos() {
    setLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPedidos(data);
    setLoading(false);
  }

  if (!autenticado) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ background: "white", padding: 40, borderRadius: 20, maxWidth: 400, width: "100%", textAlign: "center" }}>
          <h2>🔐 Panel Dueña</h2>
          <input
            type="password"
            placeholder="Ingresá el PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
            onKeyDown={(e) => e.key === "Enter" && pin === PIN_DUENO && setAutenticado(true)}
          />
          <button
            onClick={() => pin === PIN_DUENO && setAutenticado(true)}
            style={{ width: "100%", padding: 12, background: "#1a1a2e", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Entrar
          </button>
          {pin && pin !== PIN_DUENO && <p style={{ color: "red", marginTop: 8 }}>PIN incorrecto</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <header style={{ background: "#1a1a2e", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: 22 }}>📊 Panel de Control</h1>
        <button onClick={() => setAutenticado(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>
          Salir
        </button>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        <h2>📋 Todos los turnos</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : pedidos.length === 0 ? (
          <p style={{ textAlign: "center", padding: 40, color: "#999" }}>No hay turnos aún</p>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>👤 {p.client_name}</span>
                <span style={{ fontSize: 13, color: "#999" }}>{new Date(p.created_at).toLocaleDateString("es-AR")}</span>
              </div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                <p><strong>Servicio:</strong> {p.service_name}</p>
                <p><strong>Profesional:</strong> {p.professional_name}</p>
                <p><strong>Fecha:</strong> {p.date} a las {p.time}</p>
                <p><strong>Teléfono:</strong> {p.client_phone}</p>
                <p><strong style={{ color: "#e91e63" }}>Precio:</strong> ${p.price?.toLocaleString("es-AR")}</p>
                <p><strong>Estado:</strong> {p.status}</p>
              </div>
              <a href={`https://wa.me/${p.client_phone}`} target="_blank" style={{ display: "inline-block", marginTop: 12, background: "#25D366", color: "white", padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                💬 Contactar
              </a>
            </div>
          ))
        )}
      </main>
    </div>
  );
}