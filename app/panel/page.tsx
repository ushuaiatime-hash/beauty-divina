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
  const [error, setError] = useState("");

  useEffect(() => {
    if (acceso) {
      cargarTurnos();
    }
  }, [acceso]);

  async function cargarTurnos() {
    setLoading(true);
    setError("");
    try {
      const { data, error: supabaseError } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        setError("Error al cargar turnos: " + supabaseError.message);
        console.error("Error Supabase:", supabaseError);
      } else if (data) {
        console.log("Turnos cargados:", data.length);
        setTurnos(data);
      }
    } catch (err) {
      setError("Error inesperado: " + (err as Error).message);
      console.error("Error:", err);
    }
    setLoading(false);
  }

  if (!acceso) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ background: "white", padding: 40, borderRadius: 20, maxWidth: 400, width: "100%", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e" }}>🔐 Panel Dueña</h2>
          <p style={{ color: "#999", marginBottom: 20 }}>Ingresá el PIN para ver los turnos</p>
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid #ddd", fontSize: 16, marginBottom: 16, outline: "none" }}
            onKeyDown={(e) => e.key === "Enter" && pin === PIN && setAcceso(true)}
          />
          <button
            onClick={() => pin === PIN && setAcceso(true)}
            style={{ width: "100%", padding: 14, background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            Entrar
          </button>
          {pin && pin !== PIN && <p style={{ color: "#e91e63", marginTop: 8 }}>PIN incorrecto</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header style={{ background: "#1a1a2e", padding: "16px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>📊 Panel de Control</h1>
          <button
            onClick={() => setAcceso(false)}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
          >
            Salir
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
        {error && (
          <div style={{ background: "#fce4ec", color: "#c62828", padding: 12, borderRadius: 8, marginBottom: 16 }}>
            ❌ {error}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center", padding: 40, color: "#999" }}>Cargando turnos...</p>
        ) : turnos.length === 0 ? (
          <p style={{ textAlign: "center", padding: 40, color: "#999", fontSize: 16 }}>No hay turnos aún</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {turnos.map((t) => (
              <div key={t.id} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>👤 {t.client_name || "Sin nombre"}</span>
                  <span style={{ fontSize: 13, color: "#999" }}>
                    {t.created_at ? new Date(t.created_at).toLocaleDateString("es-AR") : "Fecha desconocida"}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                  <p><strong>Servicio:</strong> {t.service_name || "Sin servicio"}</p>
                  <p><strong>Profesional:</strong> {t.professional_name || "Sin profesional"}</p>
                  <p><strong>Fecha:</strong> {t.date || "Sin fecha"} {t.time ? `a las ${t.time}` : ""}</p>
                  <p><strong>Teléfono:</strong> {t.client_phone || "Sin teléfono"}</p>
                  <p><strong style={{ color: "#e91e63" }}>Precio:</strong> ${t.price?.toLocaleString("es-AR") || "0"}</p>
                  <p><strong>Estado:</strong> {t.status || "pending"}</p>
                </div>
                <a
                  href={`https://wa.me/${t.client_phone || "54"}`}
                  target="_blank"
                  style={{ display: "inline-block", marginTop: 12, background: "#25D366", color: "#fff", padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}
                >
                  💬 Contactar
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}