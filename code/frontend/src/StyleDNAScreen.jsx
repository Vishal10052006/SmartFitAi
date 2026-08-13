import { useRef, useState } from "react";
import { colors } from "./design-system/colors";
import { shareElementAsImage } from "./utils/shareImage";

const CONFIDENCE_BANDS = null; // unused here, left out intentionally

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <span style={{ color: colors.textSecondary, fontSize: "13px" }}>{label}</span>
      <span style={{ color: colors.text, fontSize: "14px", fontWeight: "600" }}>{value}</span>
    </div>
  );
}

function ColorSwatches({ colorsList }) {
  if (!colorsList || colorsList.length === 0) return null;

  const isHex = colorsList[0]?.startsWith("#");

  return (
    <div style={{ padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}>
      <span style={{ color: colors.textSecondary, fontSize: "13px", display: "block", marginBottom: "10px" }}>
        Signature Colors
      </span>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {colorsList.map((c, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: isHex ? c : colors.primary,
                border: `2px solid ${colors.border}`,
                display: "block",
              }}
            />
            {!isHex && (
              <span style={{ color: colors.textMuted, fontSize: "10px" }}>{c}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Callout({ icon, text }) {
  if (!text) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        background: "rgba(108,99,255,0.08)",
        border: `1px solid ${colors.primary}33`,
        borderRadius: "14px",
        padding: "14px",
        marginTop: "12px",
      }}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <p style={{ color: colors.textSecondary, fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

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

  const today = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const reportRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(null);

  async function handleShareReport() {
    setShareError(null);
    setSharing(true);
    try {
      await shareElementAsImage(
        reportRef.current,
        "smartfit-style-dna-report.png",
        `My Style DNA: ${styleDNA?.styleIdentity || "SmartFit AI"} — ${bodyShape} shape, ${skinTone} tone.`
      );
    } catch (err) {
      setShareError(err.message || "Couldn't share your report.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
      }}
    >
      <div ref={reportRef}>
        {/* Report Header */}

        <div
          style={{
            background: `linear-gradient(135deg, ${colors.card} 0%, #171A21 100%)`,
            borderRadius: "24px",
            padding: "24px",
            marginBottom: "16px",
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(108,99,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                flexShrink: 0,
              }}
            >
              🧬
            </div>
            <div>
              <h2 style={{ color: colors.text, margin: 0, fontSize: "20px" }}>
                Your Style DNA Report
              </h2>
              <p style={{ color: colors.textMuted, margin: 0, fontSize: "12px", marginTop: "2px" }}>
                Generated {today}
              </p>
            </div>
          </div>

          <div
            style={{
              background: "rgba(108,99,255,0.12)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <p style={{ color: colors.primary, fontWeight: "800", fontSize: "18px", margin: 0 }}>
              {styleDNA?.styleIdentity || "No Style DNA Yet"}
            </p>
            <p style={{ color: colors.textSecondary, fontSize: "12px", marginTop: "4px", margin: 0 }}>
              {styleDNA?.archetype}
            </p>
          </div>
        </div>

        {/* Report Body */}

        <div
          style={{
            background: colors.card,
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "20px",
            border: `1px solid ${colors.border}`,
          }}
        >
          <InfoRow label="Fit Preference" value={styleDNA?.fitPreference} />
          <InfoRow label="Lifestyle" value={styleDNA?.lifestyle} />
          <InfoRow label="Skin Tone" value={skinTone || "Not Analyzed Yet"} />
          <InfoRow label="Body Shape" value={bodyShape} />
          <ColorSwatches colorsList={styleDNA?.signatureColors} />

          <Callout icon="💡" text={styleDNA?.bodyShapeTip} />
          <Callout icon="🎨" text={styleDNA?.skinToneNote} />
        </div>
      </div>

      {shareError && (
        <p style={{ color: "#FF6B6B", fontSize: "13px", textAlign: "center", marginBottom: "12px" }}>
          ⚠️ {shareError}
        </p>
      )}

      <button
        onClick={handleShareReport}
        disabled={sharing}
        style={{
          width: "100%",
          background: colors.card,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          padding: "14px",
          borderRadius: "18px",
          fontWeight: "600",
          cursor: sharing ? "default" : "pointer",
          marginBottom: "12px",
        }}
      >
        {sharing ? "Preparing..." : "📤 Share My Style DNA"}
      </button>

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