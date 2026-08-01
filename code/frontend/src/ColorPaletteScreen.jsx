import { colors } from "./design-system/colors";

function ColorPaletteScreen({
  skinTone,
  colorPalette,   // NEW — pass result.style_dna.skin_tone.colour_palette directly
  onBack
}) {
  const palette = colorPalette || { best: [], good: [], avoid: [] };

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <div style={{ background: colors.card, borderRadius: "24px", padding: "24px", marginBottom: "20px", border: `1px solid ${colors.border}`, textAlign: "center" }}>
        <h2 style={{ color: colors.text, margin: 0 }}>🎨 Your Color Palette</h2>
        <p style={{ color: colors.textSecondary, marginTop: "10px" }}>
          Based on your skin tone:<br /><strong>{skinTone}</strong>
        </p>
      </div>

      <div style={{ background: colors.card, borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
        <h3 style={{ color: "#4ADE80" }}>✅ Best Colors</h3>
        {palette.best.length === 0 && <p style={{ color: colors.textSecondary, fontSize: 13 }}>No data yet — analyze a photo first.</p>}
        {palette.best.map((hex, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, background: hex, border: `1px solid ${colors.border}` }} />
            <span style={{ color: colors.text }}>{hex}</span>
          </div>
        ))}
      </div>

      <div style={{ background: colors.card, borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
        <h3 style={{ color: "#60A5FA" }}>👍 Good Colors</h3>
        {palette.good.map((hex, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, background: hex, border: `1px solid ${colors.border}` }} />
            <span style={{ color: colors.text }}>{hex}</span>
          </div>
        ))}
      </div>

      <div style={{ background: colors.card, borderRadius: "20px", padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ color: "#F87171" }}>❌ Avoid</h3>
        {palette.avoid.map((hex, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, background: hex, border: `1px solid ${colors.border}` }} />
            <span style={{ color: colors.text }}>{hex}</span>
          </div>
        ))}
      </div>

      <button onClick={onBack} style={{ width: "100%", background: colors.primary, color: "#fff", border: "none", padding: "16px", borderRadius: "18px", cursor: "pointer", fontWeight: "700" }}>
        Back To Home
      </button>
    </div>
  );
}

export default ColorPaletteScreen;