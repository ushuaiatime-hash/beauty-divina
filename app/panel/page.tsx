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

const BIZ = { name: "Beauty Divina Turnos", pin: "1234", ownerPhone: "541124055660" };
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const HORARIOS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const SERVICIOS_INICIALES = [
  { id: "s1", name: "Manicuria Semipermanente", desc: "Esmaltado semi + diseño", dur: 60, price: 3500, cat: "Uñas", active: true },
  { id: "s2", name: "Pedicuría Completa", desc: "Tratamiento completo", dur: 75, price: 4200, cat: "Uñas", active: true },
  { id: "s3", name: "Limpieza Facial Profunda", desc: "Limpieza + hidratación", dur: 90, price: 6500, cat: "Facial", active: true },
  { id: "s4", name: "Depilación Piernas", desc: "Cera fría premium", dur: 50, price: 3000, cat: "Depilación", active: true },
];

const PROFESIONALES = [
  { id: "p1", name: "Milagros Dominguez", spec: "Uñas & Pedicura", ini: "MD" },
  { id: "p2", name: "Micaela Gomez", spec: "Cosmetología", ini: "MG" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function fmtP(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
}

export default function PanelPage() {
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [servicios, setServicios] = useState(SERVICIOS_INICIALES);
  const [horarios, setHorarios] = useState(HORARIOS);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [moviendo, setMoviendo] = useState<any>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [activeTab, setActiveTab] = useState<"turnos" | "servicios" | "horarios">("turnos");
  const [editingService, setEditingService] = useState<any>(null);

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

  async function guardarServicio() {
    if (!editingService?.name || !editingService?.price) return;
    if (editingService.id) {
      setServicios(servicios.map(s => s.id === editingService.id ? editingService : s));
    } else {
      setServicios([...servicios, { ...editingService, id: `s${Date.now()}`, active: true }]);
    }
    setEditingService(null);
  }

  // Estadísticas
  const turnosHoy = turnos.filter(t => t.date === new Date().toISOString().split("T")[0]).length;
  const pendientes = turnos.filter(t => t.status === "pending").length;
  const facturadoMes = turnos.filter(t => t.status === "completed" && t.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((sum, t) => sum + (t.price || 0), 0);
  const serviciosFacturados: Record<string, number> = {};
  turnos.filter(t => t.status === "completed").forEach(t => {
    serviciosFacturados[t.service_name] = (serviciosFacturados[t.service_name] || 0) + (t.price || 0);
  });
  const topServicios = Object.entries(serviciosFacturados).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxFacturacion = topServicios[0]?.[1] || 1;

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
      
      {/* Header */}
      <div style={{ padding: "30px 20px", borderBottom: "1px solid var(--br)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <h1 className="ff" style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #ff6eb4, #ffb347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✨ {BIZ.name}</h1>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setActiveTab("turnos")} style={{ background: activeTab === "turnos" ? "var(--acc)" : "rgba(255,255,255,.05)", border: "none", padding: "8px 20px", borderRadius: 40, cursor: "pointer", color: activeTab === "turnos" ? "black" : "white" }}>📅 Turnos</button>
            <button onClick={() => setActiveTab("servicios")} style={{ background: activeTab === "servicios" ? "var(--acc)" : "rgba(255,255,255,.05)", border: "none", padding: "8px 20px", borderRadius: 40, cursor: "pointer", color: activeTab === "servicios" ? "black" : "white" }}>✂️ Servicios</button>
            <button onClick={() => setActiveTab("horarios")} style={{ background: activeTab === "horarios" ? "var(--acc)" : "rgba(255,255,255,.05)", border: "none", padding: "8px 20px", borderRadius: 40, cursor: "pointer", color: activeTab === "horarios" ? "black" : "white" }}>🕐 Horarios</button>
            <button onClick={() => { setAuth(false); setPin(""); }} style={{ background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", padding: "8px 16px", borderRadius: 40, cursor: "pointer", color: "white" }}>🚪 Salir</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
        
        {/* Panel de Turnos */}
        {activeTab === "turnos" && (
          <>
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--mu)" }}>📅 Turnos hoy</p>
                <p className="ff" style={{ fontSize: 32, fontWeight: 800, color: "var(--acc)" }}>{turnosHoy}</p>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--mu)" }}>⏳ Pendientes</p>
                <p className="ff" style={{ fontSize: 32, fontWeight: 800, color: "#fde047" }}>{pendientes}</p>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--mu)" }}>💰 Facturado (mes)</p>
                <p className="ff" style={{ fontSize: 32, fontWeight: 800, color: "var(--acc)" }}>{fmtP(facturadoMes)}</p>
              </div>
            </div>

            {/* Top servicios */}
            {topServicios.length > 0 && (
              <div className="card" style={{ marginBottom: 32 }}>
                <h3 className="ff" style={{ fontSize: 18, marginBottom: 16 }}>🏆 Servicios más facturados</h3>
                {topServicios.map(([name, total]) => (
                  <div key={name} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>{name}</span>
                      <span style={{ color: "var(--acc)", fontWeight: 600 }}>{fmtP(total)}</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,.1)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${(total / maxFacturacion) * 100}%`, height: "100%", background: "var(--acc)", borderRadius: 10 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Calendario semanal */}
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, marginBottom: 24 }}>
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

            {/* Turnos del día */}
            <div>
              <h2 className="ff" style={{ fontSize: 22, marginBottom: 16 }}>📋 Turnos del {selectedDate}</h2>
              {turnosDelDia.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40 }}>📭 No hay turnos este día</div>}
              {turnosDelDia.map(t => (
                <div key={t.id} className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                        <h3 className="ff" style={{ fontSize: 18 }}>{t.client_name}</h3>
                        <span className="badge" style={{ background: t.status === "pending" ? "rgba(253,224,71,.15)" : t.status === "confirmed" ? "rgba(74,222,128,.15)" : "rgba(156,163,175,.15)", color: t.status === "pending" ? "#fde047" : t.status === "confirmed" ? "#4ade80" : "#9ca3af" }}>{t.status}</span>
                      </div>
                      <p style={{ fontSize: 14, color: "var(--mu)" }}>💅 {t.service_name} · 👤 {t.professional_name}</p>
                      <p style={{ fontSize: 13, color: "var(--mu)" }}>🕐 {t.time}hs · 📞 {t.client_phone}</p>
                      {t.price && <p style={{ fontSize: 13, color: "var(--acc)", marginTop: 4 }}>💰 {fmtP(t.price)}</p>}
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
          </>
        )}

        {/* Panel de Servicios */}
        {activeTab === "servicios" && (
          <>
            <button onClick={() => setEditingService({ name: "", desc: "", dur: 60, price: 0, cat: "General" })} className="ab" style={{ padding: "12px 24px", borderRadius: 40, marginBottom: 24 }}>+ Agregar servicio</button>
            <div style={{ display: "grid", gap: 16 }}>
              {servicios.map(s => (
                <div key={s.id} className="card" style={{ opacity: s.active ? 1 : 0.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <h3 className="ff" style={{ fontSize: 18 }}>{s.name}</h3>
                      <p style={{ fontSize: 13, color: "var(--mu)" }}>{s.desc}</p>
                      <p style={{ fontSize: 13, marginTop: 4 }}>{s.dur}min · {fmtP(s.price)} · {s.cat}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setEditingService(s)} style={{ background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", padding: "8px 16px", borderRadius: 40, cursor: "pointer" }}>Editar</button>
                      <button onClick={() => setServicios(servicios.map(serv => serv.id === s.id ? { ...serv, active: !serv.active } : serv))} style={{ background: s.active ? "rgba(239,68,68,.2)" : "rgba(74,222,128,.2)", border: "1px solid", borderColor: s.active ? "#f87171" : "#4ade80", padding: "8px 16px", borderRadius: 40, cursor: "pointer", color: s.active ? "#f87171" : "#4ade80" }}>{s.active ? "Ocultar" : "Activar"}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Panel de Horarios */}
        {activeTab === "horarios" && (
          <>
            <p style={{ marginBottom: 16, color: "var(--mu)" }}>Configurá los horarios disponibles para cada profesional</p>
            {PROFESIONALES.map(prof => (
              <div key={prof.id} className="card" style={{ marginBottom: 24 }}>
                <h3 className="ff" style={{ fontSize: 18, marginBottom: 8 }}>{prof.name}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {horarios.map(h => (
                    <label key={h} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.05)", padding: "6px 12px", borderRadius: 40 }}>
                      <input type="checkbox" defaultChecked /> {h}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => alert("Horarios guardados (demo)")} className="ab" style={{ padding: "12px 24px", borderRadius: 40 }}>Guardar horarios</button>
          </>
        )}
      </div>

      {/* Modal para editar servicio */}
      {editingService && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="card" style={{ width: 400, maxWidth: "90%" }}>
            <h3 className="ff" style={{ fontSize: 20, marginBottom: 16 }}>{editingService.id ? "Editar" : "Nuevo"} servicio</h3>
            <input placeholder="Nombre" value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", borderRadius: 12, marginBottom: 12, color: "white" }} />
            <input placeholder="Descripción" value={editingService.desc} onChange={e => setEditingService({ ...editingService, desc: e.target.value })} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", borderRadius: 12, marginBottom: 12, color: "white" }} />
            <input placeholder="Duración (min)" value={editingService.dur} onChange={e => setEditingService({ ...editingService, dur: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", borderRadius: 12, marginBottom: 12, color: "white" }} />
            <input placeholder="Precio" value={editingService.price} onChange={e => setEditingService({ ...editingService, price: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", borderRadius: 12, marginBottom: 12, color: "white" }} />
            <input placeholder="Categoría" value={editingService.cat} onChange={e => setEditingService({ ...editingService, cat: e.target.value })} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", borderRadius: 12, marginBottom: 12, color: "white" }} />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={guardarServicio} className="ab" style={{ flex: 1, padding: 12, borderRadius: 40 }}>Guardar</button>
              <button onClick={() => setEditingService(null)} style={{ background: "rgba(255,255,255,.05)", border: "1px solid var(--br)", padding: "12px 24px", borderRadius: 40, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}