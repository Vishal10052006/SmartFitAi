import { colors } from "./design-system/colors";

export default function HomeScreen({
  skinTone,
  onAnalyze,
  onViewLooks,
  onWardrobe,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        paddingBottom: "100px",
      }}
    >

      {/* Welcome Card */}

      <div
        style={{
          background: "linear-gradient(135deg, #111827 0%, #0F172A 100%)",
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          padding: "24px",
        }}
      >
        <h2
          style={{
            color: "#FFFFFF",
            margin: 0,
            fontSize: "26px",
            fontWeight: "700",
          }}
        >
          Welcome To SmartFit AI

          Discover the colors, outfits,
          and fashion styles that suit you best.
        </h2>

        <p
          style={{
            color: colors.textSecondary,
            marginTop: "12px",
            lineHeight: "1.7",
            fontSize: "14px",
          }}
        >
          Discover the colors, outfits,
          and fashion styles that suit you best.
          <br />
          <br />
        </p>
      </div>

      {/* Style Profile */}

      <div
        style={{
          background: "#111827",
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          padding: "20px",
        }}
      >
        <h3
          style={{
            color: "#FFFFFF",
            marginTop: 0,
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Your Style Profile
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                color: colors.textSecondary,
                fontSize: "12px",
              }}
            >
              Skin Tone
            </p>

            <h4
              style={{
                color: colors.primary,
                margin: 0,
              }}
            >
              {skinTone || "Not Analyzed Yet"}
            </h4>
          </div>

          <div>
            <p
              style={{
                color: colors.textSecondary,
                fontSize: "12px",
              }}
            >
              Looks Generated
            </p>

            <h4
              style={{
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              0
            </h4>
          </div>

          <div>
            <p
              style={{
                color: colors.textSecondary,
                fontSize: "12px",
              }}
            >
              Wardrobe Items
            </p>

            <h4
              style={{
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              0
            </h4>
          </div>
        </div>
      </div>

      {/* Primary Action */}

      <button
        onClick={onAnalyze}
        style={{
          background: colors.primary,
          color: "#FFFFFF",
          border: "none",
          borderRadius: "18px",
          padding: "18px",
          fontWeight: "700",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Analyze Yourself
      </button>

      {/* Secondary Action */}

      <button
        onClick={onViewLooks}
        style={{
          background: "#1F2937",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "18px",
          padding: "18px",
          fontWeight: "700",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Generate Looks
      </button>

      {/* Recommended For You */}

      <div
        style={{
          background: "#111827",
          border: "1px solid #232838",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        <h3
          style={{
            color: "#FFFFFF",
            marginTop: 0,
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Recommended For You
        </h3>

        <div
            onClick={onViewLooks}
            style={{
                background: "#1A1F2E",
                cursor: "pointer",
            }}
        >
          <p
            style={{
              color: "#FFFFFF",
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            Camel Linen Look
          </p>

          <p
            style={{
              color: colors.primary,
              fontSize: "13px",
            }}
          >
            92% Match
          </p>

          <p
            style={{
              color: "#B3B7C2",
              fontSize: "13px",
            }}
          >
            Based on your skin tone and style profile
          </p>
        </div>

        <div
          style={{
            background: "#1A1F2E",
            padding: "14px",
            borderRadius: "14px",
          }}
        >
          <p
            style={{
              color: "#FFFFFF",
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            Sage Green Co-ord
          </p>

          <p
            style={{
              color: colors.primary,
              fontSize: "13px",
            }}
          >
            91% Match
          </p>

          <p
            style={{
              color: "#B3B7C2",
              fontSize: "13px",
            }}
          >
            Recommended by SmartFit AI
          </p>
        </div>
      </div>

      {/* Popular Features */}

      <div
        style={{
          background: "#111827",
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          padding: "20px",
        }}
      >
        <h3
          style={{
            color: "#FFFFFF",
            textAlign: "center",
            marginTop: 0,
            marginBottom: "18px",
          }}
        >
          Popular Features
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          <div>AI Style Analysis</div>
          <div>Outfit Recommendations</div>
          <div>Virtual Try-On</div>
          <div>Smart Wardrobe</div>
        </div>
      </div>

      {/* Bottom Navigation */}

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "420px",
          background: "#111827",
          border: `1px solid ${colors.border}`,
          borderRadius: "20px",
          padding: "16px",
          display: "flex",
          justifyContent: "space-around",
          color: "#FFFFFF",
          zIndex: 1000,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            background: "#111827",
            border: `1px solid ${colors.border}`,
            borderRadius: "20px",
            padding: "16px",
            display: "flex",
            justifyContent: "space-around",
            color: "#FFFFFF",
            marginBottom: "20px",
          }}
        >
          <div>🏠 Home</div>

          <div
            onClick={onAnalyze}
            style={{ cursor: "pointer" }}
          >
            📷 Analyze
          </div>

          <div
            onClick={onWardrobe}
            style={{ cursor: "pointer" }}
          >
            👕 Wardrobe
          </div>

          <div>👤 Profile</div>
        </div>
      </div>
    </div>
  );
}
