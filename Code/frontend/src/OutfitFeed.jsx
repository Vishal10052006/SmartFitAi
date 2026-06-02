import { useState, useEffect } from "react"

function OutfitFeed({ skinTone, onBack }) {
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!skinTone) return
    setLoading(true)
    setError(null)
    fetch(
      `${import.meta.env.VITE_API_URL}/outfits?skin_tone=${encodeURIComponent(skinTone)}`
    )
      .then(r => {
        if (!r.ok) throw new Error("Failed to load outfits")
        return r.json()
      })
      .then(d => {
        setOutfits(d.outfits || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [skinTone])

  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <p style={{ color: "#888", fontSize: "12px", letterSpacing: "0.08em" }}>
          OUTFITS FOR
        </p>
        <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#E9C46A" }}>
          {skinTone}
        </h2>
      </div>

      {loading && (
        <p style={{ color: "#888", textAlign: "center", fontSize: "14px" }}>
          Finding your outfits...
        </p>
      )}

      {error && (
        <p style={{ color: "#ff6b6b", textAlign: "center", fontSize: "14px" }}>
          ⚠️ {error}
        </p>
      )}

      {!loading && !error && outfits.length === 0 && (
        <p style={{ color: "#888", textAlign: "center", fontSize: "14px" }}>
          No outfits found for your tone.
        </p>
      )}

      {!loading && outfits.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "20px"
        }}>
          {outfits.map((o, i) => (
            <div key={i} style={{
              borderRadius: "12px", overflow: "hidden",
              background: "#1a1a1a", border: "1px solid #2a2a2a",
              gridColumn: outfits.length % 2 !== 0 && i === outfits.length - 1 ? "1 / -1" : "auto"
            }}>
              <div style={{ height: "64px", background: o.color }} />
              <div style={{ padding: "10px 12px" }}>
                <p style={{ fontWeight: "600", fontSize: "13px", color: "#fff", lineHeight: "1.3" }}>
                  {o.name}
                </p>
                <p style={{ fontSize: "11px", color: "#888", margin: "4px 0" }}>
                  {o.style} · {o.occasion}
                </p>
                <p style={{ fontSize: "11px", color: "#E9C46A", fontStyle: "italic", lineHeight: "1.4" }}>
                  "{o.tip}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={onBack} style={{
        width: "100%", background: "#222", color: "#fff",
        border: "none", padding: "14px", borderRadius: "12px",
        fontSize: "14px", cursor: "pointer"
      }}>
        Try Another Photo
      </button>
    </div>
  )
}

export default OutfitFeed