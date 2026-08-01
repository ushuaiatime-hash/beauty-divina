"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PIN_DUENO = "1234";

type Turno = {
  id: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  professional_name: string;
  date: string;
  time: string;
  price: number;
  status: string;
  created_at: string;
};

export default function PanelPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [pin, setPin] = useState("");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [error, setError] = useState("");

  useEffect(() => {
    if (autenticado) {
      cargarTurnos();
    }
  }, [autenticado]);

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
      } else if (data) {
        setTurnos(data);
      }
    } catch (err) {
      setError("Error inesperado");
    }
    setLoading(false);
  }

  const turnosFiltrados = filtro === "todos" 
    ? turnos 
    : turnos.filter(t => t.status === filtro);

  if (!autenticado) {
    return (
      <div style={stylesLogin.page}>
        <div style={stylesLogin.card}>
          <h2 style={stylesLogin.title}>🔐 Panel Dueña</h2>
          <p style={stylesLogin.subtitle}>Ingresá el PIN para ver los turnos</p>
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={stylesLogin.input}
            onKeyDown={(e) => e.key === "Enter" && pin === PIN_DUENO && setAutenticado(true)}
          />
          <button
            style={stylesLogin.btn}
            onClick={() => pin === PIN_DUENO && setAutenticado(true)}
          >
            Entrar
          </button>
          {pin && pin !== PIN_DUENO && (
            <p style={stylesLogin.error}>PIN incorrecto</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #f5f5f5; font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>📊 Panel de Control</h1>
          <div style={styles.headerRight}>
            <span style={styles.turnosCount}>{turnos.length} turnos</span>
            <button style={styles.logoutBtn} onClick={() => setAutenticado(false)}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {error && (
          <div style={styles.errorBanner}>
            ❌ {error}
          </div>
        )}

        {/* Filtros */}
        <div style={styles.filtros}>
          <button 
            style={{ ...styles.filtroBtn, ...(filtro === "todos" ? styles.filtroActive : {}) }}
            onClick={() => setFiltro("todos")}
          >
            Todos ({turnos.length})
          </button>
          <button 
            style={{ ...styles.filtroBtn, ...(filtro === "pending_seña" ? styles.filtroActive : {}) }}
            onClick={() => setFiltro("pending_seña")}
          >
            ⏳ Pendientes ({turnos.filter(t => t.status === "pending_seña").length})
          </button>
          <button 
            style={{ ...styles.filtroBtn, ...(filtro === "confirmed" ? styles.filtroActive : {}) }}
            onClick={() => setFiltro("confirmed")}
          >
            ✅ Confirmados ({turnos.filter(t => t.status === "confirmed").length})
          </button>
          <button 
            style={{ ...styles.filtroBtn, ...(filtro === "cancelled" ? styles.filtroActive : {}) }}
            onClick={() => setFiltro("cancelled")}
          >
            ❌ Cancelados ({turnos.filter(t => t.status === "cancelled").length})
          </button>
        </div>

        {loading ? (
          <p style={styles.loading}>Cargando turnos...</p>
        ) : turnosFiltrados.length === 0 ? (
          <p style={styles.vacio}>No hay turnos {filtro !== "todos" ? "con este estado" : ""}</p>
        ) : (
          <div style={styles.turnosLista}>
            {turnosFiltrados.map((t) => (
              <div key={t.id} style={styles.turnoCard}>
                <div style={styles.turnoHeader}>
                  <div>
                    <span style={styles.turnoNombre}>👤 {t.client_name}</span>
                    <span style={{
                      ...styles.turnoEstado,
                      background: t.status === "pending_seña" ? "#fff3e0" : t.status === "confirmed" ? "#e8f5e9" : "#fce4ec",
                      color: t.status === "pending_seña" ? "#e65100" : t.status === "confirmed" ? "#2e7d32" : "#c62828"
                    }}>
                      {t.status === "pending_seña" ? "⏳ Pendiente" : t.status === "confirmed" ? "✅ Confirmado" : "❌ Cancelado"}
                    </span>
                  </div>
                  <span style={styles.turnoFecha}>
                    {new Date(t.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
                <div style={styles.turnoBody}>
                  <p><strong>Servicio:</strong> {t.service_name}</p>
                  <p><strong>Profesional:</strong> {t.professional_name}</p>
                  <p><strong>Fecha:</strong> {t.date} a las {t.time}</p>
                  <p><strong>Teléfono:</strong> {t.client_phone}</p>
                  <p><strong style={{ color: "#e91e63" }}>Precio:</strong> ${t.price?.toLocaleString("es-AR")}</p>
                </div>
                <div style={styles.turnoFooter}>
                  <a
                    href={`https://wa.me/${t.client_phone}`}
                    target="_blank"
                    style={styles.whatsappBtn}
                  >
                    💬 Contactar
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>Beauty Divina © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

const stylesLogin: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  card: { background: "#fff", borderRadius: 20, padding: 40, maxWidth: 400, width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", textAlign: "center" },
  title: { fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#999", marginBottom: 20 },
  input: { width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid #ddd", fontSize: 16, marginBottom: 16, outline: "none" },
  btn: { width: "100%", padding: 14, background: "linear-gradient(135deg, #1a1a2e, #16213e)", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" },
  error: { color: "#e91e63", fontSize: 14, marginTop: 8 },
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  header: { background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "16px 20px" },
  headerContent: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  turnosCount: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  logoutBtn: { background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  main: { maxWidth: 1200, margin: "0 auto", padding: "20px" },
  errorBanner: { background: "#fce4ec", color: "#c62828", padding: 12, borderRadius: 8, marginBottom: 16 },
  filtros: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  filtroBtn: { padding: "8px 16px", borderRadius: 20, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#555" },
  filtroActive: { background: "#1a1a2e", color: "#fff", borderColor: "#1a1a2e" },
  loading: { textAlign: "center", padding: 40, color: "#999" },
  vacio: { textAlign: "center", padding: 40, color: "#999", fontSize: 16 },
  turnosLista: { display: "flex", flexDirection: "column", gap: 16 },
  turnoCard: { background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  turnoHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  turnoNombre: { fontSize: 18, fontWeight: 700, color: "#1a1a2e" },
  turnoEstado: { fontSize: 12, fontWeight: 600, padding: "2px 12px", borderRadius: 12, marginLeft: 10 },
  turnoFecha: { fontSize: 13, color: "#999" },
  turnoBody: { fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 12 },
  turnoFooter: { display: "flex", gap: 10 },
  whatsappBtn: { display: "inline-block", background: "#25D366", color: "#fff", padding: "6px 18px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 },
  footer: { textAlign: "center", padding: "20px", borderTop: "1px solid #eee", marginTop: 20 },
  footerText: { fontSize: 12, color: "#999", margin: 0 },
};