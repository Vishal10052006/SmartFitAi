import { useState, useEffect } from "react"
import generateWhyItWorks from "./ai/recommendationEngine/generateWhyItWorks";
import calculateOutfitScore from "./ai/recommendationEngine/calculateOutfitScore";

const OCCASIONS = [
  { value: "casual", label: "Casual" },
  { value: "office", label: "Office" },
  { value: "party", label: "Party" },
  { value: "interview", label: "Interview" },
  { value: "wedding", label: "Wedding" },
  { value: "dateNight", label: "Date Night" },
];

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
  onOpenUpload,
  onOutfitsLoaded,
  accessToken
}) {
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOutfit, setSelectedOutfit] = useState(null)
  const [occasionDNA, setOccasionDNA] = useState(null)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!skinTone) return

    setLoading(true)
    setError(null)

    fetch(
      `${import.meta.env.VITE_API_URL}/outfits?skin_tone=${encodeURIComponent(skinTone)}${occasionDNA ? `&occasion=${occasionDNA}` : ''}`
    )
      .then(r => {
        if (!r.ok) throw new Error("Failed to load outfits")
        return r.json()
      })
      .then(d => {
        const outfitsToRank = d.outfits || [];

        const rankedOutfits = outfitsToRank
          .map(outfit => ({
            ...outfit,
            score: calculateOutfitScore(outfit, styleDNA, bodyShape, skinTone)
          }))
          .sort((a, b) => b.score - a.score)

        setOutfits(rankedOutfits)

        if (onOutfitsLoaded) {
          onOutfitsLoaded(
            rankedOutfits.slice(0, 3).map(o => ({
              name: o.name,
              occasion: o.occasion,
              reasons: generateWhyItWorks(o, styleDNA, bodyShape, skinTone)
            }))
          )
        }

        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [
    skinTone,
    styleDNA,
    bodyShape,
    occasionDNA
  ])

  async function handleSaveLook(o) {
    const look = {
      name: o.name,
      color: o.color,
      occasion: o.occasion,
      style: styleDNA?.styleIdentity || "SmartFit Style",
    };

    const alreadySaved = savedLooks.some(
      (saved) => saved.name === look.name && saved.occasion === look.occasion
    );
    if (alreadySaved) return;

    setSavedLooks((prev) => [...prev, look]); // optimistic
    setSaveError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/looks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          outfit_name: o.name,
          color: o.color,
          occasion: o.occasion,
          style_identity: styleDNA?.styleIdentity,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch {
      setSavedLooks((prev) =>
        prev.filter((l) => !(l.name === look.name && l.occasion === look.occasion))
      );
      setSaveError("Couldn't save that look — try again.");
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          marginBottom: "20px",
          paddingBottom: "4px"
        }}
      >
        <button
          onClick={() => setOccasionDNA(null)}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            border: !occasionDNA ? "1px solid #6C63FF" : "1px solid #2a2a2a",
            background: !occasionDNA ? "rgba(108,99,255,0.15)" : "#1a1a1a",
            color: !occasionDNA ? "#6C63FF" : "#888",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          All
        </button>
        {OCCASIONS.map(o => (
          <button
            key={o.value}
            onClick={() => setOccasionDNA(o.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "999px",
              border: occasionDNA === o.value ? "1px solid #6C63FF" : "1px solid #2a2a2a",
              background: occasionDNA === o.value ? "rgba(108,99,255,0.15)" : "#1a1a1a",
              color: occasionDNA === o.value ? "#6C63FF" : "#888",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0
            }}
          >
            {o.label}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ color: "#888", textAlign: "center", fontSize: "14px" }}>
          Finding your perfect looks...
        </p>
      )}

      {error && (
        <p style={{ color: "#ff6b6b", textAlign: "center", fontSize: "14px" }}>
          ⚠️ {error}
        </p>
      )}

      {saveError && (
        <p style={{ color: "#ff6b6b", textAlign: "center", fontSize: "13px", marginBottom: "12px" }}>
          ⚠️ {saveError}
        </p>
      )}

      {!loading && !error && outfits.length === 0 && (
        <p style={{ color: "#888", textAlign: "center", fontSize: "14px" }}>
          No recommendations found.
        </p>
      )}

      {shapeRules && (
        <div style={{ background: "#1a1a1a", padding: "16px", borderRadius: "16px", marginBottom: "20px", border: "1px solid #2a2a2a" }}>
          <h3 style={{ color: "#fff" }}>SmartFit Styling Tip</h3>
          <p style={{ color: "#ccc" }}>{shapeRules.fit_tip}</p>
        </div>
      )}

      {occasionDNA && outfits[0]?.styling_tip && (
        <div style={{ background: "#1a1a1a", padding: "16px", borderRadius: "16px", marginBottom: "20px", border: "1px solid #2a2a2a" }}>
          <h3 style={{ color: "#fff" }}>
            {OCCASIONS.find(o => o.value === occasionDNA)?.label} Tip
          </h3>
          <p style={{ color: "#ccc" }}>{outfits[0].styling_tip}</p>
        </div>
      )}

      {!loading && outfits.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          {outfits.map((o, i) => {
            const matchScore = o.score
            const reasons = generateWhyItWorks(o, styleDNA, bodyShape, skinTone);
            const strengths = styleDNA?.strengths || [];
            const isSaved = savedLooks.some(
              (saved) => saved.name === o.name && saved.occasion === o.occasion
            );

            return (
              <div
                key={i}
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  gridColumn: outfits.length % 2 !== 0 && i === outfits.length - 1 ? "1 / -1" : "auto"
                }}
              >
                <div style={{ height: "110px", background: o.color || "#6C63FF", borderRadius: "12px 12px 0 0", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", bottom: "8px", right: "10px", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: "10px", padding: "3px 8px", borderRadius: "999px", fontWeight: "600" }}>
                    {o.color || ""}
                  </div>
                </div>

                <div style={{ padding: "12px" }}>
                  <p style={{ color: "#6C63FF", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
                    {matchScore}% Match
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px", justifyContent: "center" }}>
                    {strengths.slice(0, 2).map((tag, index) => (
                      <span key={index} style={{ background: "#242842", color: "#8B7DFF", padding: "3px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: "600" }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p style={{ fontWeight: "700", fontSize: "14px", color: "#fff", lineHeight: "1.4", marginBottom: "6px" }}>
                    {o.name.replace(" shirt", "").replace(" kurta", "").replace("co-ord", "Style").replace(" blazer", "")} Outfit
                  </p>

                  <p style={{ fontSize: "11px", color: "#888", marginBottom: "8px" }}>
                    Perfect For {o.occasion}
                  </p>

                  <div style={{ fontSize: "11px", color: "#E9C46A", lineHeight: "1.5" }}>
                    <strong>Why It Works</strong>
                    {reasons.map((reason, index) => (
                      <div key={index}>✓ {reason}</div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "12px", color: "#fff" }}>
                    <button
                      onClick={() => handleSaveLook(o)}
                      disabled={isSaved}
                      style={{
                        background: isSaved ? "#333" : "#6C63FF",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px",
                        cursor: isSaved ? "default" : "pointer",
                        fontSize: "11px"
                      }}
                    >
                      {isSaved ? "✓ Saved" : "❤️ Save Look"}
                    </button>
                    <button
                      onClick={() => setSelectedOutfit(o)}
                      style={{ background: "#333", color: "#fff", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", fontSize: "11px" }}
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
        <div style={{ marginTop: "24px", background: "#1a1a1a", borderRadius: "16px", padding: "20px", border: "1px solid #2a2a2a" }}>
          <h3 style={{ color: "#fff", marginBottom: "16px" }}>Similar Looks</h3>
          <div style={{ color: "#ccc" }}>
            <p>✓ {selectedOutfit.name} Street Style</p>
            <p>✓ {selectedOutfit.name} Weekend Edition</p>
            <p>✓ Premium {selectedOutfit.name}</p>
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        style={{ width: "100%", background: "#222", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontSize: "14px", cursor: "pointer" }}
      >
        Analyze Another Photo
      </button>
    </div>
  )
}

export default OutfitFeed