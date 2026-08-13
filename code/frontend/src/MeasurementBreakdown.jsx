import { colors } from "./design-system/colors";

function MeasurementBreakdown({ confidenceData }) {
  if (!confidenceData?.breakdown) return null;

  const rows = [
    { label: "Image Quality", value: confidenceData.breakdown.image_quality },
    { label: "Face Detection", value: confidenceData.breakdown.face_detection },
    { label: "Pose Detection", value: confidenceData.breakdown.pose_detection },
    { label: "Body Shape Match", value: confidenceData.breakdown.body_shape },
  ];

  return (
    <div
      style={{
        background: colors.card,
        borderRadius: "24px",
        padding: "22px",
        marginBottom: "20px",
        border: `1px solid ${colors.border}`,
      }}
    >
      <h3 style={{ color: colors.text, marginBottom: "16px", fontSize: "15px" }}>
        Confidence Breakdown
      </h3>

      {rows.map((row) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            fontSize: "13px",
          }}
        >
          <span style={{ color: colors.textSecondary }}>{row.label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "140px" }}>
            <div
              style={{
                flex: 1,
                height: "6px",
                background: colors.background,
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${row.value}%`,
                  height: "100%",
                  background: colors.primary,
                  borderRadius: "999px",
                }}
              />
            </div>
            <span style={{ color: colors.text, minWidth: "32px", textAlign: "right" }}>
              {row.value}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MeasurementBreakdown;