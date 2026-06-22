import { colors } from "./design-system/colors";

export default function HomeScreen({
  skinTone,
  styleDNA,
  onAnalyze,
  onViewLooks,
  onWardrobe,
  onPalette,
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

        </h2>

        <p
          style={{
            color: colors.textSecondary,
            marginTop: "12px",
            lineHeight: "1.7",
            fontSize: "14px",
          }}
        >
          Know your best suited clothes based on your body shape, skin tone and Style DNA.
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

        <p
          style={{
            color: "#6C63FF",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "16px",
            marginBottom: "16px",
          }}
        >
          {styleDNA?.styleIdentity || "No Style DNA Yet"}
        </p>

        <p
          style={{
            color: "#B3B7C2",
            textAlign: "center",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          {styleDNA?.fitPreference}
        </p>

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
        onClick={onPalette}
        style={{
          background: "#0F172A",
          color: "#FFFFFF",
          border: "1px solid #6C63FF",
          borderRadius: "18px",
          padding: "18px",
          fontWeight: "700",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        🎨 View My Colors
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
    </div>
  );
}
