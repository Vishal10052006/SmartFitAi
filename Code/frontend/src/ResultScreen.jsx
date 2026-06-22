import { colors } from "./design-system/colors";

function ResultScreen({ result, onSeeOutfits, onReset }) {
  
  console.log(result);
  
  const bodyShape =
    result?.style_dna?.body_shape?.body_shape ||
    "Unknown";

  const confidence =
    result?.style_dna?.body_shape?.confidence ||
    0;

  const measurements =
    result?.style_dna?.measurements || {};

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
            color: colors.primary,
            margin: 0,
            fontSize: "42px",
          }}
        >
          {confidence}%
        </h2>

        <p
          style={{
            color: colors.success,
            marginTop: "8px",
            fontWeight: "600",
          }}
        >
          High Accuracy
        </p>
      </div>
      
      {/* Measurements */}
      {/*

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
            marginBottom: "18px",
            textAlign: "center",
          }}
        >
          Body Measurements
        
        </h3>

        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          <div>
            <strong>Shoulder Width:</strong>{" "}
            {measurements.shoulder_width?.toFixed?.(2) ||
              measurements.shoulder_width}
          </div>

          <div>
            <strong>Hip Width:</strong>{" "}
            {measurements.hip_width?.toFixed?.(2) ||
              measurements.hip_width}
          </div>

          <div>
            <strong>Torso Length:</strong>{" "}
            {measurements.torso_length?.toFixed?.(2) ||
              measurements.torso_length}
          </div>

          <div>
            <strong>Leg Length:</strong>{" "}
            {measurements.leg_length?.toFixed?.(2) ||
              measurements.leg_length}
          </div>
        </div>
      </div>
      */}

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
              background:
                "rgba(108,99,255,0.15)",
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
              background:
                "rgba(108,99,255,0.15)",
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
              background:
                "rgba(108,99,255,0.15)",
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