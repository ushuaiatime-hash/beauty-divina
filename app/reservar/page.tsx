"use client";

import { useState } from "react";

const PROFESSIONALS = [
  {
    id: "milagros",
    name: "Milagros ✨",
    specialty: "Especialista en Uñas",
    services: [
      { id: 1, name: "Esmaltado Semipermanente", price: 30000, duration: 60, desc: "Esmaltado de larga duración." },
      { id: 2, name: "Capping en Polygel", price: 35000, duration: 120, desc: "Capa fina de polygel sobre la uña natural." },
      { id: 3, name: "Esculpidas en Polygel", price: 40000, duration: 150, desc: "Alargamiento de uñas en polygel." },
    ],
  },
  {
    id: "micaela_cosmi",
    name: "Micaela ✨",
    specialty: "Cosmiatra",
    services: [
      { id: 4, name: "Limpieza profunda", price: 20000, duration: 60, desc: "Limpieza facial profunda con extracción." },
      { id: 5, name: "Limpieza profunda con dermaplaning", price: 25000, duration: 75, desc: "Limpieza facial + dermaplaning." },
      { id: 6, name: "Microneedling (sesión)", price: 35000, duration: 90, desc: "Tratamiento de microneedling. 4 a 6 sesiones." },
      { id: 7, name: "Peeling químico suave", price: 25000, duration: 60, desc: "Renovación de piel con peeling químico." },
      { id: 8, name: "Limpieza profunda corporal", price: 25000, duration: 60, desc: "Limpieza corporal por zona a tratar." },
      { id: 9, name: "Tratamiento capilar (sesión)", price: 35000, duration: 90, desc: "Tratamiento capilar + refuerzo. 5 a 8 sesiones." },
    ],
  },
  {
    id: "micaela_masajista",
    name: "Micaela ✨",
    specialty: "Masajista",
    services: [
      { id: 10, name: "Masaje descontracturante/relajante", price: 15000, duration: 40, desc: "Masaje cuerpo entero o zona a tratar (35-40 min)." },
    ],
  },
  {
    id: "patricia",
    name: "Patricia ✨",
    specialty: "Podóloga",
    services: [
      { id: 11, name: "Pedicuria y Podología", price: 10000, duration: 30, desc: "Corte y tratamiento de uñas, limpieza de talones." },
    ],
  },
  {
    id: "patricia_rosa",
    name: "Patricia y Rosa ✨",
    specialty: "Depilación Definitiva",
    services: [
      { id: 12, name: "Depilación Definitiva (Cuerpo Completo)", price: 28000, duration: 30, desc: "Eliminación progresiva del vello con láser Soprano Ice." },
      { id: 13, name: "Depilación Definitiva (Zonas a elección)", price: 7000, duration: 30, desc: "Eliminación progresiva del vello. Elegí las zonas." },
    ],
  },
];

export default function ReservarPage() {
  const [step, setStep] = useState(1);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#fff0f5", 
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      maxWidth: "500px",
      margin: "0 auto"
    }}>
      <h1 style={{ color: "#e91e63", textAlign: "center" }}>✨ Beauty Divina ✨</h1>
      
      {step === 1 && (
        <div>
          <h2>✨ ¿Con quién querés atenderte?</h2>
          {PROFESSIONALS.map((p) => (
            <div 
              key={p.id}
              onClick={() => { setSelectedProfessional(p); setStep(2); }}
              style={{
                background: "white",
                padding: "15px",
                borderRadius: "12px",
                marginBottom: "10px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <h3>{p.name}</h3>
              <p style={{ color: "#666" }}>{p.specialty}</p>
            </div>
          ))}
        </div>
      )}

      {step === 2 && selectedProfessional && (
        <div>
          <button onClick={() => setStep(1)} style={{ marginBottom: "15px" }}>← Volver</button>
          <h2>✨ Servicios de {selectedProfessional.name}</h2>
          <p style={{ color: "#666" }}>{selectedProfessional.specialty}</p>
          
          {selectedProfessional.services.map((s: any) => (
            <div 
              key={s.id}
              onClick={() => { setSelectedService(s); setStep(3); }}
              style={{
                background: "white",
                padding: "15px",
                borderRadius: "12px",
                marginBottom: "10px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <h3>{s.name}</h3>
              <p style={{ color: "#666" }}>{s.desc}</p>
              <p><strong style={{ color: "#e91e63" }}>${s.price.toLocaleString()}</strong> - {s.duration} min</p>
            </div>
          ))}
        </div>
      )}

      {step === 3 && selectedService && (
        <div style={{ textAlign: "center", padding: "30px" }}>
          <div style={{ fontSize: "48px" }}>✅</div>
          <h2>¡Servicio seleccionado!</h2>
          <p><strong>{selectedService.name}</strong></p>
          <p style={{ color: "#666" }}>{selectedService.desc}</p>
          <p><strong style={{ color: "#e91e63" }}>${selectedService.price.toLocaleString()}</strong></p>
          <button 
            onClick={() => { setStep(1); setSelectedProfessional(null); setSelectedService(null); }}
            style={{
              background: "#e91e63",
              color: "white",
              border: "none",
              padding: "12px 30px",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "20px"
            }}
          >
            Hacer otra reserva
          </button>
        </div>
      )}
    </div>
  );
}