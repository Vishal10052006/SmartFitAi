import { colors } from "./design-system/colors";

export default function StyleDNAScreen({
  result,
  styleDNA,
  onViewLooks
}) {
  const bodyShape =
    result?.style_dna?.body_shape?.body_shape ||
    "Unknown";

  const skinTone =
    result?.style_dna?.skin_tone?.tone ||
    "Unknown";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
      }}
    >
      {/* Header */}

      <div
        style={{
          background: colors.card,
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "20px",
          border: `1px solid ${colors.border}`,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: colors.text,
            margin: 0,
          }}
        >
          🧬 Your Style DNA
        </h2>
      </div>

      {/* DNA Details */}

      <div style={{ marginTop: "20px" }}>

        <p>
          <strong>Style Identity:</strong>{" "}
          {styleDNA?.styleIdentity}
        </p>

        <p>
          <strong>Fit Preference:</strong>{" "}
          {styleDNA?.fitPreference}
        </p>

        <p>
          <strong>Lifestyle:</strong>{" "}
          {styleDNA?.lifestyle}
        </p>

        <p>
          <strong>Skin Tone:</strong>{" "}
          {skinTone || "Not Analyzed Yet"}
        </p>

        <p>
          <strong>Body Shape:</strong>{" "}
          {" "}
          {bodyShape}
        </p>

      </div>

      <button
        onClick={onViewLooks}
        style={{
          width: "100%",
          background: colors.primary,
          color: "#fff",
          border: "none",
          padding: "16px",
          borderRadius: "18px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        Generate My Looks ✨
      </button>
    </div>
  );
}