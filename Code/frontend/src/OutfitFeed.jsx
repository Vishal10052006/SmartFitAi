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
        <p style={{
          color: "#B3B7C2",
          fontSize: "13px",
          marginBottom: "6px"
        }}>
          Looks Recommended For You
        </p>

        <h2 style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#FFFFFF"
        }}>
          Skin Tone: {skinTone}
        </h2>
      </div>

      {loading && (
        <p style={{
          color: "#888",
          textAlign: "center",
          fontSize: "14px"
        }}>
          Finding your perfect looks...
        </p>
      )}

      {error && (
        <p style={{
          color: "#ff6b6b",
          textAlign: "center",
          fontSize: "14px"
        }}>
          ⚠️ {error}
        </p>
      )}

      {!loading && !error && outfits.length === 0 && (
        <p style={{
          color: "#888",
          textAlign: "center",
          fontSize: "14px"
        }}>
          No recommendations found.
        </p>
      )}

      {!loading && outfits.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px"
          }}
        >
          {outfits.map((o, i) => {
            const matchScore = Math.max(88, 92 - i)

            return (
              <div
                key={i}
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  gridColumn:
                    outfits.length % 2 !== 0 &&
                    i === outfits.length - 1
                      ? "1 / -1"
                      : "auto"
                }}
              >
                <div
                  style={{
                    height: "90px",
                    background: o.color
                  }}
                />

                <div style={{ padding: "12px" }}>
                  <p style={{
                    color: "#6C63FF",
                    fontSize: "12px",
                    fontWeight: "700",
                    marginBottom: "8px"
                  }}>
                    {matchScore}% Match
                  </p>

                  <p style={{
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "#fff",
                    lineHeight: "1.4",
                    marginBottom: "6px"
                  }}>
                    {o.name
                      .replace(" shirt", "Outfit")
                      .replace(" kurta", "Outfit")
                      .replace("co-ord", " Style")
                      .replace(" blazer", "Outfit") + " Outfit"}
                  </p>

                  <p style={{
                    fontSize: "11px",
                    color: "#888",
                    marginBottom: "8px"
                  }}>
                    Perfect For {o.occasion}
                  </p>

                  <p style={{
                    fontSize: "11px",
                    color: "#E9C46A",
                    lineHeight: "1.5"
                  }}>
                    <strong>Why It Works</strong>
                    <br />
                    {o.tip}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "12px",
                      fontSize: "12px",
                      color: "#fff"
                    }}
                  >
                    <button>Save Look</button>
                    <button>View Similar</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={onBack}
        style={{
          width: "100%",
          background: "#222",
          color: "#fff",
          border: "none",
          padding: "14px",
          borderRadius: "12px",
          fontSize: "14px",
          cursor: "pointer"
        }}
      >
        Analyze Another Photo
      </button>
    </div>
  )
}

export default OutfitFeed
