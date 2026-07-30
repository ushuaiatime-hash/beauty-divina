export default function AdminPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "#f5f5f5",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: 40,
        borderRadius: 20,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        textAlign: "center"
      }}>
        <h1 style={{ color: "#1a1a2e" }}>✅ Administración</h1>
        <p style={{ color: "#666" }}>Si ves esto, el admin funciona correctamente.</p>
      </div>
    </div>
  );
}
