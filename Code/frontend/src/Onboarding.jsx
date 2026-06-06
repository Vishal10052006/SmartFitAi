import { useState } from "react";
import { colors } from "./design-system/colors";

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(1);

  const next = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  const screens = {
    1: {
        title: "Look Better In Every Outfit",
        description:
        "Discover colors and styles that naturally suit you.",
        icon: "✨",
        button: "Get Started",
    },

    2: {
        title: "Upload One Photo",
        description:
        "Our AI analyzes your appearance and builds your personal style profile.",
        icon: "📷",
        button: "Continue",
    },

    3: {
        title: "Get Personalized Recommendations",
        description:
        "Receive outfit suggestions made specifically for your appearance.",
        icon: "👔",
        button: "Continue",
    },

    4: {
        title: "Your Personal Stylist Is Ready",
        description:
        "Let's discover your best colors and looks.",
        icon: "🚀",
        button: "Start Analysis",
    },
    };

  const current = screens[step];

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "24px",
      }}
    >
      {/* Progress */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            style={{
              width: item === step ? "40px" : "10px",
              height: "10px",
              borderRadius: "999px",
              background:
                item <= step
                  ? colors.primary
                  : colors.border,
              transition: "0.3s",
            }}
          />
        ))}
      </div>

      {/* Card */}

      <div
        style={{
          background: "#111827",
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "56px",
            marginBottom: "20px",
          }}
        >
          {current.icon}
        </div>

        <h2
          style={{
            color: "#FFFFFF",
            marginBottom: "16px",
          }}
        >
          {current.title}
        </h2>

        <p
          style={{
            color: colors.textSecondary,
            lineHeight: "1.8",
            fontSize: "15px",
          }}
        >
          {current.description}
        </p>
      </div>

      {/* Button */}

      <button
        onClick={next}
        style={{
          background: colors.primary,
          color: "#FFFFFF",
          border: "none",
          borderRadius: "18px",
          padding: "18px",
          fontSize: "16px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        {current.button}
      </button>
    </div>
  );
}