function ResultScreen({ result, onSeeOutfits, onReset }) {
  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>

      {/* Skin Tone */}
      <div style={{
        background: "#1a1a1a", borderRadius: "16px",
        padding: "24px", marginBottom: "16px", textAlign: "center"
      }}>
        <p style={{ color: "#888", fontSize: "12px", marginBottom: "8px" }}>YOUR SKIN TONE</p>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#E9C46A" }}>
          {result.skin_tone}
        </h2>
      </div>

      {/* Color Palette */}
      <div style={{
        background: "#1a1a1a", borderRadius: "16px",
        padding: "24px", marginBottom: "16px"
      }}>
        <p style={{ color: "#888", fontSize: "12px", marginBottom: "16px" }}>
          RECOMMENDED COLORS FOR YOU
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          {result.recommended_colors.map((color, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                width: "52px", height: "52px",
                borderRadius: "12px", background: color, marginBottom: "6px"
              }} />
              <p style={{ fontSize: "10px", color: "#888" }}>{color}</p>
            </div>
          ))}
        </div>
      </div>

      {/* See Outfits CTA */}
      <button onClick={onSeeOutfits} style={{
        width: "100%", background: "#E9C46A", color: "#000",
        border: "none", padding: "16px", borderRadius: "12px",
        fontSize: "16px", fontWeight: "700", cursor: "pointer",
        marginBottom: "10px"
      }}>
        See Outfits For Me →
      </button>

      {/* Reset */}
      <button onClick={onReset} style={{
        width: "100%", background: "#222", color: "#fff",
        border: "none", padding: "14px", borderRadius: "12px",
        fontSize: "14px", cursor: "pointer"
      }}>
        Try Another Photo
      </button>

    </div>
  )
}

export default ResultScreen