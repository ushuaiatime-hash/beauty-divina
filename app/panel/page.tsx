export default function PanelPage() {
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
        <h1 style={{ color: "#1a1a2e" }}>✅ Panel de Control</h1>
        <p style={{ color: "#666" }}>Si ves esto, el panel funciona correctamente.</p>
        <p style={{ color: "#999", fontSize: 14 }}>PIN: 1234</p>
      </div>
    </div>
  );
}