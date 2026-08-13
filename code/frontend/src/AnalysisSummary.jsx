import { colors } from "./design-system/colors";

const CONFIDENCE_BANDS = [
  { min: 85, label: "High Accuracy", icon: "✓", color: colors.success },
  { min: 65, label: "Good — Minor Uncertainty", icon: "◐", color: colors.primary },
  { min: 45, label: "Fair — Consider Retaking Photo", icon: "◑", color: colors.warning },
  { min: 0, label: "Low — Please Retake With Better Lighting", icon: "!", color: colors.error },
];

function getBand(score) {
  if (score === null) return { label: "Confidence Unavailable", icon: "?", color: colors.textSecondary };
  return CONFIDENCE_BANDS.find((b) => score >= b.min);
}

function AnalysisSummary({ bodyShape, confidenceScore }) {
  const band = getBand(confidenceScore);

  return (
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
      <p style={{ color: colors.success, fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>
        ✓ Analysis Complete
      </p>

      <p style={{ color: colors.textSecondary, fontSize: "13px", marginBottom: "8px" }}>
        Your Body Shape
      </p>

      <h2 style={{ color: colors.text, fontSize: "30px", fontWeight: "700", marginBottom: "16px" }}>
        {bodyShape}
      </h2>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: `${band.color}1A`,
          border: `1px solid ${band.color}`,
          borderRadius: "999px",
          padding: "8px 16px",
        }}
      >
        <span style={{ color: band.color, fontWeight: "700", fontSize: "14px" }}>
          {band.icon}
        </span>
        <span style={{ color: band.color, fontWeight: "600", fontSize: "13px" }}>
          {confidenceScore !== null ? `${confidenceScore}% — ${band.label}` : band.label}
        </span>
      </div>

      <p style={{ color: colors.textSecondary, lineHeight: "1.6", marginTop: "16px", fontSize: "13px" }}>
        SmartFit AI analyzed your body structure and generated your body profile.
      </p>
    </div>
  );
}

export default AnalysisSummary;