import { useState, useEffect } from "react"
import generateWhyItWorks from "./ai/recommendationEngine/generateWhyItWorks";
import calculateOutfitScore from "./ai/recommendationEngine/calculateOutfitScore";

function OutfitFeed({
  skinTone,
  styleDNA,
  onBack,
  savedLooks,
  setSavedLooks,
  bodyShape,
  shapeRules,

  onOpenWardrobe,
  onOpenPalette,
  onOpenUpload
}) {
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOutfit, setSelectedOutfit] = useState(null)

  console.log("SKIN TONE", skinTone)
  console.log("STYLE DNA FULL")
  console.log(JSON.stringify(styleDNA, null, 2))
  console.log("BODY SHAPE", bodyShape)
  console.log("SHAPE RULES", shapeRules)
  
  function calculateScore(outfit, skinTone, styleDNA, bodyShape) {
    let score = 65

    // Style Identity

    if (
      styleDNA?.styleIdentity === "Urban Trendsetter" &&
      (
        outfit.style === "Streetwear" ||
        outfit.occasion === "Weekend"
      )
    ) {
      score += 15
    }

    if (
      styleDNA?.styleIdentity === "Clean Minimal" &&
      (
        outfit.style === "Minimal" ||
        outfit.color === "#F5F5F5"
      )
    ) {
      score += 15
    }

    if (
      styleDNA?.styleIdentity === "Modern Professional" &&
      outfit.occasion === "Office"
    ) {
      score += 15
    }

    // Lifestyle

    if (
      styleDNA?.lifestyle === "Corporate" &&
      outfit.occasion === "Office"
    ) {
      score += 10
    }

    if (
      styleDNA?.lifestyle === "Social" &&
      (
        outfit.occasion === "Weekend" ||
        outfit.occasion === "Festive"
      )
    ) {
      score += 10
    }

    // Skin Tone

    if (skinTone?.includes("Warm")) {
      score += 5
    }

    // Body Shape

    if (bodyShape === "Inverted Triangle") {
      score += 5
    }

    return Math.min(score, 100)
  }

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

        console.log("OUTFITS API")
        console.log(d)

        console.log("FIRST OUTFIT")
        console.log(d.outfits?.[0])
        
        let filteredOutfits = d.outfits || []

        if (styleDNA?.styleIdentity === "Urban Trendsetter") {
          filteredOutfits = filteredOutfits.filter(
            o =>
              o.name.toLowerCase().includes("olive") ||
              o.name.toLowerCase().includes("street")
          )
        }

        else if (styleDNA?.styleIdentity === "Clean Minimal") {
          filteredOutfits = filteredOutfits.filter(
            o =>
              o.name.toLowerCase().includes("white") ||
              o.name.toLowerCase().includes("minimal")
          )
        }

        else if (styleDNA?.styleIdentity === "Modern Professional") {
          filteredOutfits = filteredOutfits.filter(
            o =>
              o.occasion === "Everyday" ||
              o.occasion === "Office"
          )
        }

        const outfitsToRank = d.outfits || [];

        const rankedOutfits = outfitsToRank
          .map(outfit => ({
            ...outfit,
            score: calculateOutfitScore(
              outfit,
              styleDNA,
              bodyShape,
              skinTone
            )
          }))
          .sort((a, b) => b.score - a.score)

        setOutfits(rankedOutfits)

        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [
    skinTone,
    styleDNA,
    bodyShape
  ])

  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <p style={{
          color: "#B3B7C2",
          fontSize: "13px",
          marginBottom: "6px"
        }}>
    
        </p>

        <h2 style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#FFFFFF"
        }}>
      
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

      {shapeRules && (
        <div
          style={{
            background: "#1a1a1a",
            padding: "16px",
            borderRadius: "16px",
            marginBottom: "20px",
            border: "1px solid #2a2a2a"
          }}
        >
          <h3 style={{ color: "#fff" }}>
            SmartFit Styling Tip
          </h3>

          <p style={{ color: "#ccc" }}>
            {shapeRules.fit_tip}
          </p>
        </div>
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
            const matchScore =
              o.score

              const reasons = generateWhyItWorks(
                o,
                styleDNA,
                bodyShape,
                skinTone
              );

              const strengths =
              styleDNA?.strengths || [];

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
                    height: "110px",
                    background: o.color || "#6C63FF",
                    borderRadius: "12px 12px 0 0",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "10px",
                    background: "rgba(0,0,0,0.4)",
                    color: "#fff",
                    fontSize: "10px",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    fontWeight: "600"
                  }}>
                    {o.color || ""}
                  </div>
                </div>

                <div style={{ padding: "12px" }}>
                  <p style={{
                    color: "#6C63FF",
                    fontSize: "12px",
                    fontWeight: "700",
                    marginBottom: "8px"
                  }}>

                    {matchScore}% Match
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px",
                      marginBottom: "10px",
                      justifyContent: "center"
                    }}
                  >
                    {strengths.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          background: "#242842",
                          color: "#8B7DFF",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          fontSize: "10px",
                          fontWeight: "600"
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

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

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#E9C46A",
                      lineHeight: "1.5"
                    }}
                  >
                    <strong>Why It Works</strong>

                    {reasons.map((reason, index) => (
                      <div key={index}>
                        ✓ {reason}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "12px",
                      fontSize: "12px",
                      color: "#fff"
                    }}
                  >
                    <button
                      onClick={() => {
                        const look = {
                          name: o.name,
                          color: o.color,
                          occasion: o.occasion,
                          style: styleDNA?.styleIdentity || "SmartFit Style"
                        }

                        const alreadySaved = savedLooks.some(
                          saved => saved.name === look.name
                        )

                        if (!alreadySaved) {
                          setSavedLooks(prev => [...prev, look])
                          alert("Look Saved To Wardrobe ❤️")
                        }
  
                      }}
                      style={{
                        background: "#6C63FF",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      ❤️ Save Look
                    </button>
                    <button
                      onClick={() => setSelectedOutfit(o)}
                      style={{
                        background: "#333",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      View Similar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedOutfit && (
        <div
          style={{
            marginTop: "24px",
            background: "#1a1a1a",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #2a2a2a"
          }}
        >
          <h3
            style={{
              color: "#fff",
              marginBottom: "16px"
            }}
          >
            Similar Looks
          </h3>

          <div style={{ color: "#ccc" }}>
            <p>✓ {selectedOutfit.name} Street Style</p>
            <p>✓ {selectedOutfit.name} Weekend Edition</p>
            <p>✓ Premium {selectedOutfit.name}</p>
          </div>
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
