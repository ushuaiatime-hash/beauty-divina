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
`;

const BIZ = { name: "Beauty Divina Turnos", pin: "1234", ownerPhone: "541124055660" };
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function PanelPage() {
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [moviendo, setMoviendo] = useState<any>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");

  useEffect(() => {
    if (auth) cargarTurnos();
  }, [auth]);

  async function cargarTurnos() {
    const { data } = await supabase.from("appointments").select("*").order("date", { ascending: true });
    setTurnos(data || []);
  }

  async function confirmarTurno(turno: any) {
    await supabase.from("appointments").update({ status: "confirmed" }).eq("id", turno.id);
    const mensaje = `🌸 *Turno confirmado*%0a%0aHola ${turno.client_name}, tu turno ha sido *confirmado*.%0a📅 *Fecha:* ${turno.date}%0a🕐 *Hora:* ${turno.time}hs%0a💅 *Servicio:* ${turno.service_name}%0a📍 *Dirección:* Cairo 83, Monte Grande%0a%0a¡Te esperamos! ✨`;
    window.open(`https://wa.me/${turno.client_phone}?text=${mensaje}`, "_blank");
    cargarTurnos();
  }

  async function moverTurno(turno: any) {
    if (!nuevaFecha || !nuevaHora) return;
    await supabase.from("appointments").update({ date: nuevaFecha, time: nuevaHora, status: "pending" }).eq("id", turno.id);
    const mensaje = `🔄 *Turno modificado*%0a%0aHola ${turno.client_name}, tu turno ha sido *movido* por cambios en la agenda.%0a📅 *Nueva fecha:* ${nuevaFecha}%0a🕐 *Nueva hora:* ${nuevaHora}hs%0a💅 *Servicio:* ${turno.service_name}%0a%0aGracias por tu comprensión 🌸`;
    window.open(`https://wa.me/${turno.client_phone}?text=${mensaje}`, "_blank");
    setMoviendo(null);
    cargarTurnos();
  }

  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{CSS}</style>
        <div className="card" style={{ width: 320, textAlign: "center" }}>
          <h1 className="ff" style={{ fontSize: 24, color: "var(--acc)", marginBottom: 20 }}>🔐 {BIZ.name}</h1>
          <input type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", borderRadius: 12, color: "white", marginBottom: 16 }} />
          <button onClick={() => pin === BIZ.pin && setAuth(true)} className="ab" style={{ width: "100%", padding: 12, borderRadius: 12 }}>Ingresar</button>
        </div>
      </div>
    );
  }

  const turnosDelDia = turnos.filter(t => t.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <div style={{ padding: "30px 20px", borderBottom: "1px solid var(--br)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <h1 className="ff" style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #ff6eb4, #ffb347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✨ {BIZ.name}</h1>
          <button onClick={() => { setAuth(false); setPin(""); }} style={{ background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", padding: "8px 16px", borderRadius: 40, cursor: "pointer", color: "white" }}>🚪 Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
          {DAYS.map((day, idx) => {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + idx + 1);
            const dateStr = date.toISOString().split("T")[0];
            const count = turnos.filter(t => t.date === dateStr).length;
            const isSelected = selectedDate === dateStr;
            return (
              <button key={day} onClick={() => setSelectedDate(dateStr)} style={{ background: isSelected ? "var(--acc)" : "var(--sf)", border: "1px solid var(--br)", borderRadius: 20, padding: "12px 20px", minWidth: 100, cursor: "pointer", transition: "0.2s" }}>
                <div className="ff" style={{ fontWeight: 700, color: isSelected ? "black" : "white" }}>{day}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{formatDate(dateStr)}</div>
                <div style={{ fontSize: 10, marginTop: 4 }}>{count} turnos</div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 24 }}>
          <h2 className="ff" style={{ fontSize: 22, marginBottom: 16 }}>📅 Turnos del día</h2>
          {turnosDelDia.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40 }}>📭 No hay turnos este día</div>}
          {turnosDelDia.map(t => (
            <div key={t.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                    <h3 className="ff" style={{ fontSize: 18 }}>{t.client_name}</h3>
                    <span style={{ padding: "4px 12px", borderRadius: 40, fontSize: 12, background: t.status === "pending" ? "rgba(253,224,71,.15)" : t.status === "confirmed" ? "rgba(74,222,128,.15)" : "rgba(156,163,175,.15)", color: t.status === "pending" ? "#fde047" : t.status === "confirmed" ? "#4ade80" : "#9ca3af" }}>{t.status}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--mu)" }}>💅 {t.service_name} · 👤 {t.professional_name}</p>
                  <p style={{ fontSize: 13, color: "var(--mu)" }}>🕐 {t.time}hs · 📞 {t.client_phone}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {t.status === "pending" && <button onClick={() => confirmarTurno(t)} style={{ background: "#4ade80", color: "black", border: "none", padding: "8px 16px", borderRadius: 40, cursor: "pointer", fontWeight: 600 }}>✅ Confirmar</button>}
                  {moviendo?.id === t.id ? (
                    <>
                      <input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} style={{ background: "var(--sf)", border: "1px solid var(--br)", padding: 8, borderRadius: 12, color: "white" }} />
                      <input type="time" value={nuevaHora} onChange={e => setNuevaHora(e.target.value)} style={{ background: "var(--sf)", border: "1px solid var(--br)", padding: 8, borderRadius: 12, color: "white" }} />
                      <button onClick={() => moverTurno(t)} style={{ background: "var(--acc)", border: "none", padding: "8px 16px", borderRadius: 40, cursor: "pointer", fontWeight: 600 }}>Guardar</button>
                      <button onClick={() => setMoviendo(null)} style={{ background: "#555", border: "none", padding: "8px 16px", borderRadius: 40, cursor: "pointer", color: "white" }}>Cancelar</button>
                    </>
                  ) : (
                    <button onClick={() => setMoviendo(t)} style={{ background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", padding: "8px 16px", borderRadius: 40, cursor: "pointer", color: "white" }}>🔄 Mover turno</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}