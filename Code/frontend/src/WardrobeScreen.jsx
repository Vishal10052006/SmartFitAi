import { colors } from "./design-system/colors";

function WardrobeScreen({ savedLooks, onBack }) {
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
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          My Wardrobe 👕
        </h2>

        <p
          style={{
            color: colors.textSecondary,
            marginTop: "10px",
          }}
        >
          Your saved outfit recommendations
        </p>
      </div>

      {/* Empty State */}

      {savedLooks.length === 0 && (
        <div
          style={{
            background: colors.card,
            borderRadius: "20px",
            padding: "30px",
            textAlign: "center",
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 style={{ color: colors.text }}>
            No Saved Looks Yet
          </h3>

          <p
            style={{
              color: colors.textSecondary,
            }}
          >
            Save outfit recommendations to build
            your personal wardrobe.
          </p>
        </div>
      )}

      {/* Saved Looks */}

      {savedLooks.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          {savedLooks.map((look, index) => (
            <div
              key={index}
              style={{
                background: colors.card,
                borderRadius: "20px",
                overflow: "hidden",
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  height: "80px",
                  background: look.color,
                }}
              />

              <div style={{ padding: "16px" }}>
                <h3
                  style={{
                    color: colors.text,
                    marginBottom: "8px",
                  }}
                >
                  ❤️ {look.name}
                </h3>

                <p
                  style={{
                    color: colors.textSecondary,
                    fontSize: "14px",
                  }}
                >
                  {look.style} • {look.occasion}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        style={{
          width: "100%",
          marginTop: "20px",
          background: colors.primary,
          color: "#FFFFFF",
          border: "none",
          padding: "16px",
          borderRadius: "18px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        Back To Home
      </button>
    </div>
  );
}

export default WardrobeScreen;