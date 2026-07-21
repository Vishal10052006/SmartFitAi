import { colors } from "./design-system/colors";
import colorPalettes from "./data/colorPalettes";

function ColorPaletteScreen({
  skinTone,
  onBack
}) {

  console.log("COLOR PALETTE SCREEN LOADED");
  console.log("Skin Tone:", skinTone);

  const palette =
    colorPalettes[skinTone] || {
      best: [],
      good: [],
      avoid: []
    };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px"
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
          textAlign: "center"
        }}
      >
        <h2
          style={{
            color: colors.text,
            margin: 0
          }}
        >
          🎨 Your Color Palette
        </h2>

        <p
          style={{
            color: colors.textSecondary,
            marginTop: "10px"
          }}
        >
          Based on your skin tone:
          <br />
          <strong>{skinTone}</strong>
        </p>
      </div>

      {/* Best Colors */}

      <div
        style={{
          background: colors.card,
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "16px"
        }}
      >
        <h3 style={{ color: "#4ADE80" }}>
          ✅ Best Colors
        </h3>

        {palette.best.map((color, index) => (
          <p
            key={index}
            style={{
              color: colors.text
            }}
          >
            {color}
          </p>
        ))}
      </div>

      {/* Good Colors */}

      <div
        style={{
          background: colors.card,
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "16px"
        }}
      >
        <h3 style={{ color: "#60A5FA" }}>
          👍 Good Colors
        </h3>

        {palette.good.map((color, index) => (
          <p
            key={index}
            style={{
              color: colors.text
            }}
          >
            {color}
          </p>
        ))}
      </div>

      {/* Avoid */}

      <div
        style={{
          background: colors.card,
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "20px"
        }}
      >
        <h3 style={{ color: "#F87171" }}>
          ❌ Avoid
        </h3>

        {palette.avoid.map((color, index) => (
          <p
            key={index}
            style={{
              color: colors.text
            }}
          >
            {color}
          </p>
        ))}
      </div>

      <button
        onClick={onBack}
        style={{
          width: "100%",
          background: colors.primary,
          color: "#fff",
          border: "none",
          padding: "16px",
          borderRadius: "18px",
          cursor: "pointer",
          fontWeight: "700"
        }}
      >
        Back To Home
      </button>
    </div>
  );
}

export default ColorPaletteScreen;