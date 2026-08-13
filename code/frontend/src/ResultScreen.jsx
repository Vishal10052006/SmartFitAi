import AnalysisSummary from "./AnalysisSummary";
import MeasurementBreakdown from "./MeasurementBreakdown";

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

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
      }}
    >
      <AnalysisSummary bodyShape={bodyShape} confidenceScore={confidenceScore} />
      <MeasurementBreakdown confidenceData={confidenceData} />

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