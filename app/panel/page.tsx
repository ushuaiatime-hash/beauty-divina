"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--acc:#ff6eb4;--bg:#0d0a0e;--sf:#180f18;--br:rgba(255,110,180,.1);--tx:#f5f0f4;--mu:rgba(245,240,244,.45)}
  body{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--tx)}
  .ff{font-family:'Syne',sans-serif}
  .sf{background:var(--sf);border:1px solid var(--br)}
  .ab{background:var(--acc);color:var(--bg);font-weight:800;cursor:pointer;border:none}
  .card{background:var(--sf);border-radius:20px;padding:20px;border:1px solid var(--br);transition:all 0.3s}
  .card:hover{border-color:var(--acc);transform:translateY(-3px)}
  .badge{padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600}
`;

const BIZ = { name: "Beauty Divina Turnos", pin: "1234" };

export default function PanelPage() {
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, total: 0, revenue: 0 });

  useEffect(() => {
    if (auth) cargarTurnos();
  }, [auth]);

  async function cargarTurnos() {
    const { data } = await supabase.from("appointments").select("*").order("date", { ascending: false });
    setTurnos(data || []);
    const pending = data?.filter(t => t.status === "pending").length || 0;
    const confirmed = data?.filter(t => t.status === "confirmed").length || 0;
    const completed = data?.filter(t => t.status === "completed").length || 0;
    const revenue = data?.filter(t => t.status === "completed").reduce((sum, t) => sum + (t.price || 0), 0) || 0;
    setStats({ pending, confirmed, completed, total: data?.length || 0, revenue });
  }

  async function actualizarStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    cargarTurnos();
  }

  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{CSS}</style>
        <div className="card" style={{ width: 320, textAlign: "center" }}>
          <h1 className="ff" style={{ fontSize: 24, color: "var(--acc)", marginBottom: 20 }}>🔐 {BIZ.name}</h1>
          <input type="password" placeholder="Código PIN" value={pin} onChange={e => setPin(e.target.value)} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", borderRadius: 12, color: "white", marginBottom: 16 }} />
          <button onClick={() => pin === BIZ.pin && setAuth(true)} className="ab" style={{ width: "100%", padding: 12, borderRadius: 12, fontSize: 16 }}>Ingresar</button>
        </div>
      </div>
    );
  }

  const turnosFiltrados = filter === "all" ? turnos : turnos.filter(t => t.status === filter);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{CSS}</style>
      
      {/* Header futurista */}
      <div style={{ padding: "30px 20px", borderBottom: "1px solid var(--br)", background: "rgba(0,0,0,.3)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="ff" style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #ff6eb4, #ffb347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✨ {BIZ.name}</h1>
            <p style={{ fontSize: 13, color: "var(--mu)", marginTop: 4 }}>Dashboard de gestión</p>
          </div>
          <button onClick={() => { setAuth(false); setPin(""); }} style={{ background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", padding: "8px 16px", borderRadius: 40, color: "white", cursor: "pointer" }}>🚪 Cerrar sesión</button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--mu)" }}>Total turnos</p>
            <p className="ff" style={{ fontSize: 36, fontWeight: 800, color: "white" }}>{stats.total}</p>
          </div>
          <div className="card" style={{ textAlign: "center", borderLeftColor: "#fde047" }}>
            <p style={{ fontSize: 12, color: "var(--mu)" }}>⏳ Pendientes</p>
            <p className="ff" style={{ fontSize: 36, fontWeight: 800, color: "#fde047" }}>{stats.pending}</p>
          </div>
          <div className="card" style={{ textAlign: "center", borderLeftColor: "#4ade80" }}>
            <p style={{ fontSize: 12, color: "var(--mu)" }}>✅ Confirmados</p>
            <p className="ff" style={{ fontSize: 36, fontWeight: 800, color: "#4ade80" }}>{stats.confirmed}</p>
          </div>
          <div className="card" style={{ textAlign: "center", borderLeftColor: "var(--acc)" }}>
            <p style={{ fontSize: 12, color: "var(--mu)" }}>💰 Facturado</p>
            <p className="ff" style={{ fontSize: 36, fontWeight: 800, color: "var(--acc)" }}>${stats.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {["all", "pending", "confirmed", "completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="ab" style={{ padding: "8px 20px", borderRadius: 40, fontSize: 14, background: filter === f ? "var(--acc)" : "rgba(255,255,255,.05)", color: filter === f ? "black" : "white", border: "none" }}>
              {f === "all" ? "📋 Todos" : f === "pending" ? "⏳ Pendientes" : f === "confirmed" ? "✅ Confirmados" : "✔️ Completados"}
            </button>
          ))}
        </div>

        {/* Lista de turnos estilo tarjetas interactivas */}
        <div style={{ display: "grid", gap: 16 }}>
          {turnosFiltrados.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <p style={{ color: "var(--mu)" }}>📭 No hay turnos en esta categoría</p>
            </div>
          )}
          {turnosFiltrados.map(t => (
            <div key={t.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                  <h3 className="ff" style={{ fontSize: 18, fontWeight: 700 }}>{t.client_name}</h3>
                  <span className="badge" style={{ 
                    background: t.status === "pending" ? "rgba(253,224,71,.15)" : t.status === "confirmed" ? "rgba(74,222,128,.15)" : "rgba(156,163,175,.15)",
                    color: t.status === "pending" ? "#fde047" : t.status === "confirmed" ? "#4ade80" : "#9ca3af"
                  }}>{t.status}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--mu)" }}>💅 {t.service_name} · 👤 {t.professional_name}</p>
                <p style={{ fontSize: 13, color: "var(--mu)" }}>📅 {t.date} 🕐 {t.time}hs · 📞 {t.client_phone}</p>
                {t.price && <p style={{ fontSize: 14, fontWeight: 600, color: "var(--acc)", marginTop: 4 }}>💰 ${t.price.toLocaleString()}</p>}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {t.status === "pending" && <button onClick={() => actualizarStatus(t.id, "confirmed")} style={{ background: "#4ade80", color: "black", border: "none", padding: "8px 16px", borderRadius: 40, cursor: "pointer", fontWeight: 600 }}>Confirmar</button>}
                {t.status === "pending" && <button onClick={() => actualizarStatus(t.id, "cancelled")} style={{ background: "rgba(239,68,68,.2)", color: "#f87171", border: "1px solid #f87171", padding: "8px 16px", borderRadius: 40, cursor: "pointer" }}>Cancelar</button>}
                {t.status === "confirmed" && <button onClick={() => actualizarStatus(t.id, "completed")} style={{ background: "var(--acc)", color: "black", border: "none", padding: "8px 16px", borderRadius: 40, cursor: "pointer", fontWeight: 600 }}>Completar</button>}
                {t.status === "confirmed" && <button onClick={() => actualizarStatus(t.id, "cancelled")} style={{ background: "rgba(239,68,68,.2)", color: "#f87171", border: "1px solid #f87171", padding: "8px 16px", borderRadius: 40, cursor: "pointer" }}>Cancelar</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}