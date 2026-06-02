"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--acc:#ff6eb4;--bg:#0d0a0e;--sf:#180f18;--br:rgba(255,110,180,.1);--tx:#f5f0f4;--mu:rgba(245,240,244,.45)}
  body{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--tx)}
  .ff{font-family:'Syne',sans-serif}
  .btn{background:linear-gradient(135deg, var(--acc), #ffb347);color:black;border:none;padding:12px 20px;border-radius:60px;font-weight:800;font-size:14px;cursor:pointer;transition:transform 0.2s}
  .btn-small{background:rgba(255,255,255,.1);border:1px solid var(--br);padding:8px 16px;border-radius:60px;cursor:pointer;color:white;transition:all 0.2s}
  .card{background:var(--sf);border-radius:24px;padding:16px;border:1px solid var(--br);margin-bottom:12px;transition:all 0.3s}
  .card:hover{border-color:var(--acc);transform:translateY(-3px)}
`;

const BIZ = { name: "Beauty Divina", pin: "1234", ownerPhone: "541124055260" };
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HORARIOS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function formatFecha(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function PanelPage() {
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
  const [moviendo, setMoviendo] = useState<any>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [servicios, setServicios] = useState([
    { id: "s1", name: "Manicuria", price: 3500, active: true },
    { id: "s2", name: "Pedicuria", price: 4200, active: true },
    { id: "s3", name: "Facial", price: 6500, active: true },
    { id: "s4", name: "Depilación", price: 3000, active: true },
  ]);
  const [mostrarServicios, setMostrarServicios] = useState(false);
  const [mostrarHorarios, setMostrarHorarios] = useState(false);
  const [nuevoServicio, setNuevoServicio] = useState({ name: "", price: 0 });
  const [horariosActivos, setHorariosActivos] = useState<string[]>(HORARIOS);

  useEffect(() => {
    if (auth) cargarTurnos();
  }, [auth]);

  async function cargarTurnos() {
    const { data } = await supabase.from("appointments").select("*").order("date", { ascending: true });
    setTurnos(data || []);
  }

  async function confirmarTurno(t: any) {
    await supabase.from("appointments").update({ status: "confirmed" }).eq("id", t.id);
    const msg = `🌸 *Turno confirmado*%0a%0aHola ${t.client_name}, tu turno ha sido *confirmado*.%0a📅 *Fecha:* ${t.date}%0a🕐 *Hora:* ${t.time}hs%0a💅 *Servicio:* ${t.service_name}%0a📍 *Dirección:* Cairo 83, Monte Grande%0a%0a¡Te esperamos! ✨`;
    window.open(`https://wa.me/${t.client_phone}?text=${encodeURIComponent(msg)}`, "_blank");
    cargarTurnos();
  }

  async function moverTurno(t: any) {
    if (!nuevaFecha || !nuevaHora) return;
    await supabase.from("appointments").update({ date: nuevaFecha, time: nuevaHora, status: "pending" }).eq("id", t.id);
    const msg = `🔄 *Turno modificado*%0a%0aHola ${t.client_name}, tu turno fue movido por cambios en la agenda.%0a📅 *Nueva fecha:* ${nuevaFecha}%0a🕐 *Nueva hora:* ${nuevaHora}hs%0a💅 *Servicio:* ${t.service_name}%0a%0aGracias por tu comprensión 🌸`;
    window.open(`https://wa.me/${t.client_phone}?text=${encodeURIComponent(msg)}`, "_blank");
    setMoviendo(null);
    cargarTurnos();
  }

  async function agregarServicio() {
    if (!nuevoServicio.name || !nuevoServicio.price) return;
    setServicios([...servicios, { ...nuevoServicio, id: `s${Date.now()}`, active: true }]);
    setNuevoServicio({ name: "", price: 0 });
  }

  const toggleHorario = (h: string) => {
    if (horariosActivos.includes(h)) {
      setHorariosActivos(horariosActivos.filter(hor => hor !== h));
    } else {
      setHorariosActivos([...horariosActivos, h]);
    }
  };

  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <style>{CSS}</style>
        <div className="card" style={{ width: 320, textAlign: "center" }}>
          <h2 className="ff" style={{ fontSize: 28, marginBottom: 20, background: "linear-gradient(135deg, var(--acc), #ffb347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🔐 Panel</h2>
          <input type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{ width: "100%", padding: 14, background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", borderRadius: 60, color: "white", marginBottom: 16, textAlign: "center", fontSize: 20 }} />
          <button onClick={() => pin === BIZ.pin && setAuth(true)} className="btn" style={{ width: "100%" }}>Ingresar</button>
        </div>
      </div>
    );
  }

  const turnosDelDia = turnos.filter(t => t.date === fechaSeleccionada).sort((a, b) => a.time.localeCompare(b.time));
  const turnosHoy = turnos.filter(t => t.date === new Date().toISOString().split("T")[0]).length;
  const pendientes = turnos.filter(t => t.status === "pending").length;
  const gananciasMes = turnos.filter(t => t.status === "completed" && t.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, t) => s + (t.price || 0), 0);
  
  const serviciosFacturados: Record<string, number> = {};
  turnos.filter(t => t.status === "completed").forEach(t => {
    serviciosFacturados[t.service_name] = (serviciosFacturados[t.service_name] || 0) + (t.price || 0);
  });
  const topServicios = Object.entries(serviciosFacturados).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const maxFacturacion = topServicios[0]?.[1] || 1;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 40 }}>
      <style>{CSS}</style>
      
      <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--br)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h1 className="ff" style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg, var(--acc), #ffb347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✨ {BIZ.name}</h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setMostrarServicios(!mostrarServicios)} className="btn-small">✂️ Servicios</button>
            <button onClick={() => setMostrarHorarios(!mostrarHorarios)} className="btn-small">🕐 Horarios</button>
            <button onClick={() => { setAuth(false); }} className="btn-small">🚪 Salir</button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12, padding: "16px" }}>
        <div className="card" style={{ textAlign: "center", padding: 12 }}>
          <div style={{ fontSize: 28 }}>📅</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{turnosHoy}</div>
          <div style={{ fontSize: 11, color: "var(--mu)" }}>Turnos hoy</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 12 }}>
          <div style={{ fontSize: 28 }}>⏳</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fde047" }}>{pendientes}</div>
          <div style={{ fontSize: 11, color: "var(--mu)" }}>Pendientes</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 12 }}>
          <div style={{ fontSize: 28 }}>💰</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--acc)" }}>${gananciasMes.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: "var(--mu)" }}>Este mes</div>
        </div>
      </div>

      {/* Top Servicios */}
      {topServicios.length > 0 && (
        <div className="card" style={{ margin: "0 16px 16px 16px" }}>
          <h3 className="ff" style={{ fontSize: 16, marginBottom: 12 }}>🏆 Top servicios</h3>
          {topServicios.map(([name, total]) => (
            <div key={name} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>{name}</span>
                <span style={{ color: "var(--acc)" }}>${total.toLocaleString()}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,.1)", borderRadius: 10 }}>
                <div style={{ width: `${(total / maxFacturacion) * 100}%`, height: 6, background: "linear-gradient(90deg, var(--acc), #ffb347)", borderRadius: 10 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gestión de Servicios */}
      {mostrarServicios && (
        <div style={{ padding: "0 16px", marginBottom: 16 }}>
          <div className="card">
            <h3 className="ff" style={{ fontSize: 18, marginBottom: 12 }}>✂️ Servicios</h3>
            {servicios.filter(s => s.active).map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span><strong>{s.name}</strong> ${s.price}</span>
                <button onClick={() => setServicios(servicios.map(ser => ser.id === s.id ? { ...ser, active: false } : ser))} className="btn-small" style={{ background: "rgba(239,68,68,.2)", color: "#f87171" }}>Ocultar</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <input placeholder="Nombre" value={nuevoServicio.name} onChange={e => setNuevoServicio({ ...nuevoServicio, name: e.target.value })} style={{ flex: 2, minWidth: 120, background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", padding: 10, borderRadius: 60, color: "white" }} />
              <input placeholder="Precio" type="number" value={nuevoServicio.price} onChange={e => setNuevoServicio({ ...nuevoServicio, price: parseInt(e.target.value) || 0 })} style={{ flex: 1, minWidth: 80, background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", padding: 10, borderRadius: 60, color: "white" }} />
              <button onClick={agregarServicio} className="btn" style={{ padding: "10px 20px" }}>+</button>
            </div>
          </div>
        </div>
      )}

      {/* Gestión de Horarios */}
      {mostrarHorarios && (
        <div style={{ padding: "0 16px", marginBottom: 16 }}>
          <div className="card">
            <h3 className="ff" style={{ fontSize: 18, marginBottom: 12 }}>🕐 Horarios</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {HORARIOS.map(h => (
                <button key={h} onClick={() => toggleHorario(h)} style={{ background: horariosActivos.includes(h) ? "var(--acc)" : "rgba(255,255,255,.05)", border: "none", padding: "6px 14px", borderRadius: 60, cursor: "pointer", color: horariosActivos.includes(h) ? "black" : "white", fontSize: 13 }}>{h}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendario semanal */}
      <div style={{ overflowX: "auto", whiteSpace: "nowrap", padding: "0 16px", marginBottom: 16 }}>
        {DIAS.map((dia, idx) => {
          const date = new Date();
          date.setDate(date.getDate() - date.getDay() + idx + 1);
          const dateStr = date.toISOString().split("T")[0];
          const count = turnos.filter(t => t.date === dateStr).length;
          const isSelected = fechaSeleccionada === dateStr;
          return (
            <button key={dia} onClick={() => setFechaSeleccionada(dateStr)} style={{ display: "inline-block", background: isSelected ? "var(--acc)" : "var(--sf)", border: "1px solid var(--br)", borderRadius: 60, padding: "10px 16px", marginRight: 8, cursor: "pointer", transition: "0.2s" }}>
              <span style={{ fontWeight: 700, color: isSelected ? "black" : "white" }}>{dia}</span>
              <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.7 }}>{formatFecha(dateStr)}</span>
              <span style={{ fontSize: 10, marginLeft: 6, background: isSelected ? "black" : "var(--acc)", padding: "2px 6px", borderRadius: 20, color: isSelected ? "white" : "black" }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Turnos del día */}
      <div style={{ padding: "0 16px" }}>
        <h2 className="ff" style={{ fontSize: 20, marginBottom: 12 }}>📋 Turnos del día</h2>
        {turnosDelDia.length === 0 && <div className="card" style={{ textAlign: "center", padding: 24 }}>📭 Sin turnos</div>}
        {turnosDelDia.map(t => (
          <div key={t.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{t.client_name}</span>
                <span style={{ marginLeft: 8, fontSize: 11, background: t.status === "pending" ? "rgba(253,224,71,.2)" : "rgba(74,222,128,.2)", padding: "2px 8px", borderRadius: 60, color: t.status === "pending" ? "#fde047" : "#4ade80" }}>{t.status}</span>
              </div>
              <span style={{ fontWeight: 700, color: "var(--acc)" }}>{t.time}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--mu)", marginBottom: 12 }}>💅 {t.service_name} · 👤 {t.professional_name}</div>
            
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {t.status === "pending" && <button onClick={() => confirmarTurno(t)} className="btn" style={{ padding: "8px 16px" }}>✅ Confirmar</button>}
              
              {moviendo?.id === t.id ? (
                <>
                  <input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} style={{ background: "var(--sf)", border: "1px solid var(--br)", padding: 8, borderRadius: 60, color: "white", width: 130 }} />
                  <input type="time" value={nuevaHora} onChange={e => setNuevaHora(e.target.value)} style={{ background: "var(--sf)", border: "1px solid var(--br)", padding: 8, borderRadius: 60, color: "white", width: 90 }} />
                  <button onClick={() => moverTurno(t)} className="btn" style={{ padding: "8px 16px", background: "#4ade80", color: "black" }}>Guardar</button>
                  <button onClick={() => setMoviendo(null)} className="btn-small">Cancelar</button>
                </>
              ) : (
                <button onClick={() => setMoviendo(t)} className="btn-small">🔄 Mover</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}