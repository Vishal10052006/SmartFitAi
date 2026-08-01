export default function BottomNavigation({
  onHome,
  onAnalyze,
  onPalette
}) {
  const navStyle = {
    cursor: "pointer",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
    borderRadius: "12px",
    transition: "background 0.2s",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "420px",
        background: "#111827",
        border: "1px solid #232838",
        borderRadius: "20px",
        padding: "16px",
        display: "flex",
        justifyContent: "space-around",
        zIndex: 1000
      }}
    >
      <div onClick={onHome} style={navStyle}>🏠 Home</div>
      <div onClick={onAnalyze} style={navStyle}>📷 Analyze</div>
      <div onClick={onPalette} style={navStyle}>🎨 Palette</div>
    </div>
  );
}