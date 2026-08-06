import { colors } from "./design-system/colors";

function ResultScreen({ result, onSeeOutfits, onReset }) {
  
  console.log(result);
  
  const bodyShape =
    result?.style_dna?.body_shape?.body_shape ||
    "Unknown";

  const measurements =
    result?.style_dna?.measurements || {};

  // Pull the unified confidence engine result — falls back gracefully
  // if it's missing (e.g. old cached result, or body shape detection failed
  // and unified_confidence was never computed on the backend).
  const confidenceData = result?.style_dna?.confidence;

  const confidenceScore = confidenceData?.overall_confidence ?? null;
  const confidenceLabel = confidenceData?.label ?? "Confidence Unavailable";

  // Map label bands to colors so the UI visually reflects trust level,
  // not just a static green "High Accuracy" regardless of the score.
  function getConfidenceColor(score) {
    if (score === null) return colors.textSecondary;
    if (score >= 85) return colors.success;
    if (score >= 65) return colors.primary;
    if (score >= 45) return colors.warning;
    return colors.error;
  }

  const confidenceColor = getConfidenceColor(confidenceScore);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
      }}
    >
      {/* Analysis Complete */}

      <div
        style={{
          background: colors.card,
          borderRadius: "24px",
          padding: "28px",
          marginBottom: "20px",
          textAlign: "center",
          border: `1px solid ${colors.border}`,
        }}
      >
        <p
          style={{
            color: colors.success,
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "10px",
          }}
        >
          ✓ Analysis Complete
        </p>

        <p
          style={{
            color: colors.textSecondary,
            fontSize: "13px",
            marginBottom: "8px",
          }}
        >
          Your Body Shape
        </p>

        <h2
          style={{
            color: colors.text,
            fontSize: "30px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          {bodyShape}
        </h2>

        <p
          style={{
            color: colors.textSecondary,
            lineHeight: "1.6",
          }}
        >
          SmartFit AI analyzed your body structure
          and generated your body profile.
        </p>
      </div>

      {/* Confidence Score */}

      <div
        style={{
          background: colors.card,
          borderRadius: "24px",
          padding: "22px",
          marginBottom: "20px",
          border: `1px solid ${colors.border}`,
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: colors.textSecondary,
            marginBottom: "8px",
          }}
        >
          AI Confidence Score
        </p>

        <h2
          style={{
            color: confidenceColor,
            margin: 0,
            fontSize: "42px",
          }}
        >
          {confidenceScore !== null ? `${confidenceScore}%` : "—"}
        </h2>

        <p
          style={{
            color: confidenceColor,
            marginTop: "8px",
            fontWeight: "600",
          }}
        >
          {confidenceLabel}
        </p>

        {/* Optional breakdown — only render if the backend sent it */}
        {confidenceData?.breakdown && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: `1px solid ${colors.border}`,
              textAlign: "left",
              fontSize: "12px",
              color: colors.textSecondary,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span>Image Quality</span>
              <span>{confidenceData.breakdown.image_quality}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span>Face Detection</span>
              <span>{confidenceData.breakdown.face_detection}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span>Pose Detection</span>
              <span>{confidenceData.breakdown.pose_detection}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Body Shape Match</span>
              <span>{confidenceData.breakdown.body_shape}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Body Analysis */}

      <div
        style={{
          background: colors.card,
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "20px",
          border: `1px solid ${colors.border}`,
        }}
      >
        <h3
          style={{
            color: colors.text,
            marginBottom: "12px",
          }}
        >
          AI Insight
        </h3>

        <p
          style={{
            color: colors.textSecondary,
            lineHeight: "1.8",
          }}
        >
          Your body structure is classified as{" "}
          <strong>{bodyShape}</strong>.
          SmartFit AI will use this information
          to recommend better-fitting clothing,
          sizes, and personalized style choices.
        </p>
      </div>

      {/* Style DNA */}

      <div
        style={{
          background: colors.card,
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "20px",
          border: `1px solid ${colors.border}`,
        }}
      >
        <h3
          style={{
            color: colors.text,
            marginBottom: "12px",
          }}
        >
          Style DNA
        </h3>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "rgba(108,99,255,0.15)",
              color: colors.primary,
              padding: "8px 14px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Body Shape Aware
          </span>

          <span
            style={{
              background: "rgba(108,99,255,0.15)",
              color: colors.primary,
              padding: "8px 14px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Smart Fit
          </span>

          <span
            style={{
              background: "rgba(108,99,255,0.15)",
              color: colors.primary,
              padding: "8px 14px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Personalized Style
          </span>
        </div>
      </div>

      {/* Recommended Fit */}
      {result?.style_dna?.fit_recommendations && (
        <div
          style={{
            background: colors.card,
            borderRadius: "24px",
            padding: "24px",
            marginBottom: "20px",
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3
            style={{
              color: colors.text,
              marginBottom: "16px",
            }}
          >
            Recommended Fit
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
            }}
          >
            {Object.entries(result.style_dna.fit_recommendations).map(
              ([category, fit]) => (
                <div
                  key={category}
                  style={{
                    background: colors.background,
                    borderRadius: "16px",
                    padding: "14px 10px",
                    textAlign: "center",
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <p
                    style={{
                      color: colors.textSecondary,
                      fontSize: "11px",
                      textTransform: "capitalize",
                      marginBottom: "6px",
                    }}
                  >
                    {category}
                  </p>

                  <p
                    style={{
                      color: colors.primary,
                      fontSize: "22px",
                      fontWeight: "700",
                      margin: 0,
                    }}
                  >
                    {fit.size_label}
                  </p>

                  {fit.confidence === "low" && (
                    <p
                      style={{
                        color: colors.warning,
                        fontSize: "10px",
                        marginTop: "4px",
                      }}
                    >
                      Estimated
                    </p>
                  )}
                </div>
              )
            )}
          </div>

          <p
            style={{
              color: colors.textSecondary,
              fontSize: "11px",
              marginTop: "14px",
              lineHeight: "1.5",
            }}
          >
            Based on your body measurements. Sizing may vary slightly by brand.
          </p>
        </div>
      )}

      {/* CTA */}

      <button
        onClick={onSeeOutfits}
        style={{
          width: "100%",
          background: colors.primary,
          color: "#FFFFFF",
          border: "none",
          padding: "16px",
          borderRadius: "18px",
          fontSize: "16px",
          fontWeight: "700",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        Generate My Looks ✨
      </button>

      <button
        onClick={onReset}
        style={{
          width: "100%",
          background: colors.card,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          padding: "14px",
          borderRadius: "18px",
          cursor: "pointer",
        }}
      >
        Analyze Another Photo
      </button>
    </div>
  );
}

export default ResultScreen;