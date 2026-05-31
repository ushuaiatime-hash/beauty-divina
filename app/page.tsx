"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [view, setView] = useState<"book" | "admin">("book");
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  // Pantalla de reserva
  if (view === "book") {
    return <Booking onAdmin={() => setView("admin")} />;
  }

  // Pantalla admin con PIN
  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0a0e", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
        <div style={{ background: "#180f18", padding: 32, borderRadius: 24 }}>
          <h2>Panel Admin</h2>
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ margin: "16px 0", padding: 12, borderRadius: 12, width: "100%" }}
          />
          <button
            onClick={() => pin === "1234" && setAuthenticated(true)}
            style={{ background: "#ff6eb4", padding: "12px 24px", borderRadius: 12, width: "100%", border: "none", fontWeight: "bold", cursor: "pointer" }}
          >
            Entrar
          </button>
          <button onClick={() => setView("book")} style={{ marginTop: 12, background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
            ← Volver a reservas
          </button>
        </div>
      </div>
    );
  }

  return <Admin onBack={() => { setAuthenticated(false); setView("book"); }} />;
}

// ==================== COMPONENTE DE RESERVA ====================
function Booking({ onAdmin }: { onAdmin: () => void }) {
  const [step, setStep] = useState(1);
  const [selSvc, setSvc] = useState<any>(null);
  const [selProf, setProf] = useState<any>(null);
  const [selDate, setDate] = useState("");
  const [selTime, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sub, setSub] = useState(false);

  const services = [
    { id: "s1", name: "Manicuria Semipermanente", dur: 60, price: 3500, cat: "Uñas" },
    { id: "s2", name: "Pedicuría Completa", dur: 75, price: 4200, cat: "Uñas" },
    { id: "s3", name: "Limpieza Facial Profunda", dur: 90, price: 6500, cat: "Facial" },
    { id: "s4", name: "Depilación Piernas", dur: 50, price: 3000, cat: "Depilación" },
  ];

  const professionals = [
    { id: "p1", name: "Milagros Dominguez", spec: "Uñas & Pedicura", ini: "MD" },
    { id: "p2", name: "Micaela Gomez", spec: "Cosmetología", ini: "MG" },
  ];

  const today = () => new Date().toISOString().split("T")[0];
  const fmtP = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);

  async function submit() {
    if (!selSvc || !selProf || !selDate || !selTime || !name || !phone) return;
    setSub(true);
    const { error } = await supabase.from("appointments").insert({
      client_name: name,
      client_phone: phone,
      service_name: selSvc.name,
      professional_name: selProf.name,
      date: selDate,
      time: selTime,
      duration_minutes: selSvc.dur,
      price: selSvc.price,
      status: "pending"
    });
    if (error) {
      alert("Error al guardar");
    } else {
      setStep(4);
    }
    setSub(false);
  }

  // Estilos básicos
  const styles = {
    page: { background: "#0d0a0e", color: "#f5f0f4", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
    header: { padding: "44px 20px", borderBottom: "1px solid rgba(255,110,180,.1)", textAlign: "center" as const },
    card: { background: "#180f18", border: "1px solid rgba(255,110,180,.1)", borderRadius: 16, padding: 14, marginBottom: 10, cursor: "pointer" },
    button: { background: "#ff6eb4", color: "#0d0a0e", fontWeight: "bold", border: "none", padding: 12, borderRadius: 16, cursor: "pointer", width: "100%" },
  };

  if (step === 1) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={{ fontFamily: "Georgia, serif" }}>Beauty Divina Turnos</h1>
        <p style={{ opacity: 0.6 }}>Salón de belleza & estética premium 💅</p>
        <p style={{ opacity: 0.5, fontSize: 12 }}>📍 Cairo 83, Monte Grande</p>
      </div>
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <button onClick={onAdmin} style={{ background: "none", border: "none", color: "#ff6eb4", marginBottom: 16, cursor: "pointer" }}>🔐 Panel Admin →</button>
        <h2 style={{ fontSize: 19, marginBottom: 14 }}>¿Qué servicio?</h2>
        {services.map(s => (
          <div key={s.id} onClick={() => { setSvc(s); setStep(2); }} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><strong>{s.name}</strong><p style={{ fontSize: 12, opacity: 0.6 }}>{s.dur}min · {s.cat}</p></div>
              <span style={{ color: "#ff6eb4", fontWeight: "bold" }}>{fmtP(s.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>← Volver</button>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>Beauty Divina</h1>
      </div>
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontSize: 19, marginBottom: 14 }}>¿Con quién?</h2>
        {professionals.map(p => (
          <div key={p.id} onClick={() => { setProf(p); setStep(3); }} style={styles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(200,245,66,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{p.ini}</div>
              <div><strong>{p.name}</strong><p style={{ fontSize: 12, opacity: 0.6 }}>{p.spec}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 3) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>← Volver</button>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>Beauty Divina</h1>
      </div>
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontSize: 19, marginBottom: 14 }}>Fecha y horario</h2>
        <input type="date" min={today()} value={selDate} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: 12, background: "#180f18", border: "1px solid rgba(255,110,180,.1)", borderRadius: 16, marginBottom: 16, color: "white" }} />
        {selDate && (
          <div>
            <p style={{ marginBottom: 8 }}>Horarios disponibles:</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(h => (
                <button key={h} onClick={() => setTime(h)} style={{ padding: 10, borderRadius: 12, background: selTime === h ? "#ff6eb4" : "#180f18", color: selTime === h ? "black" : "white", border: "none", cursor: "pointer" }}>{h}</button>
              ))}
            </div>
          </div>
        )}
        {selTime && <button onClick={() => setStep(4)} style={{ ...styles.button, marginTop: 16 }}>Continuar →</button>}
      </div>
    </div>
  );

  if (step === 4) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => setStep(3)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>← Volver</button>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>Beauty Divina</h1>
      </div>
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontSize: 19, marginBottom: 14 }}>Tus datos</h2>
        <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: 12, background: "#180f18", border: "1px solid rgba(255,110,180,.1)", borderRadius: 16, marginBottom: 12, color: "white" }} />
        <input type="tel" placeholder="WhatsApp (11 4444 5555)" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%", padding: 12, background: "#180f18", border: "1px solid rgba(255,110,180,.1)", borderRadius: 16, marginBottom: 16, color: "white" }} />
        <button onClick={submit} disabled={sub} style={styles.button}>{sub ? "Reservando..." : "Confirmar turno"}</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ff6eb4", color: "black", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>✓</div>
        <h2 style={{ fontSize: 24 }}>¡Reserva enviada!</h2>
        <p style={{ opacity: 0.6 }}>Te avisaremos por WhatsApp</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 24, background: "#ff6eb4", color: "black", padding: "12px 24px", borderRadius: 40, border: "none", fontWeight: "bold", cursor: "pointer" }}>Nueva reserva</button>
      </div>
    </div>
  );
}

// ==================== COMPONENTE ADMIN ====================
function Admin({ onBack }: { onBack: () => void }) {
  const [apts, setApts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("appointments").select("*").order("date", { ascending: false }).then(({ data }) => {
      setApts(data || []);
      setLoading(false);
    });
  }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setApts(apts.map(a => a.id === id ? { ...a, status } : a));
  }

  if (loading) return <div style={{ padding: 50, textAlign: "center", color: "white", background: "#0d0a0e", minHeight: "100vh" }}>Cargando...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto", background: "#0d0a0e", minHeight: "100vh", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>Panel Admin</h2>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#ff6eb4", cursor: "pointer" }}>← Ver reservas</button>
      </div>
      {apts.length === 0 && <p>No hay turnos</p>}
      {apts.map(a => (
        <div key={a.id} style={{ background: "#180f18", borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <p><strong>{a.client_name}</strong> - {a.service_name}</p>
          <p style={{ fontSize: 12, opacity: 0.7 }}>{a.date} {a.time}hs · {a.professional_name}</p>
          <p style={{ fontSize: 12 }}>WhatsApp: {a.client_phone}</p>
          <p style={{ marginTop: 8 }}>Estado: <strong style={{ color: a.status === "pending" ? "#fde047" : a.status === "confirmed" ? "#4ade80" : "#f87171" }}>{a.status}</strong></p>
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