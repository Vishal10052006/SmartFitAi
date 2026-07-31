import { useState } from "react";
import { colors } from "./design-system/colors";
import kiaraAvatar from "./assets/kiara-avatar.png";

/**
 * T2.1 — Onboarding flow architecture & routing (done)
 * T2.2 — Kiara persistent header + dialogue per step (done)
 * T2.3 — Gender & Age capture (done)
 * T2.4 — Height & Weight capture (this update)
 *
 * IMPORTANT: this is the task that actually matters for correctness.
 * Height feeds MeasurementConverter on the backend — up to now App.jsx
 * never sent a real value, so every user got body-shape math computed
 * off a hardcoded 170cm default. This update captures a real height
 * here; App.jsx.PATCH-T2.4.md wires it into the actual /style-dna call.
 *
 * Height/Weight stay skippable like Gender/Age (same product decision),
 * but if height is skipped, App.jsx still needs a documented fallback —
 * see the patch notes for how that's handled.
 */

const KIARA_LINES = {
  welcome: {
    heading: "Hi, I'm Kiara ✨",
    body: "I'm your personal AI stylist. Give me two minutes and I'll tell you exactly what actually works for you — no guesswork.",
  },
  meetKiara: {
    heading: "Here's how this works",
    body: "SmartFit AI uses me to turn your photos and info into outfits built around your real body, skin tone, and vibe — not generic trends.",
  },
  gender: {
    heading: "First, a quick basic",
    body: "This helps me tailor style rules that actually apply to you instead of guessing. Totally optional.",
  },
  age: {
    heading: "And your age?",
    body: "Just helps me calibrate — style advice shifts a bit depending on life stage. Skip it if you'd rather not.",
  },
  height: {
    heading: "Now for the numbers",
    body: "This one actually matters — your height is what makes my body-shape analysis accurate instead of a rough guess.",
  },
  weight: {
    heading: "Almost done with the basics",
    body: "This rounds out your measurements so fit recommendations actually fit.",
  },
  lifestyle: {
    heading: "Let's talk about your day-to-day",
    body: "Office? Campus? Always out? This shapes what I actually recommend you wear.",
  },
  fashionGoals: {
    heading: "Last one — what are you going for?",
    body: "Tell me what you want more of, and I'll aim every recommendation at it.",
  },
};

function KiaraHeader({ stepKey, isLastStep }) {
  const line = KIARA_LINES[stepKey];
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <img
        src={kiaraAvatar}
        alt="Kiara"
        style={{
          width: 92,
          height: 92,
          borderRadius: "50%",
          objectFit: "cover",
          margin: "0 auto 16px",
          border: `2px solid ${colors.primary}`,
          boxShadow: "0 0 24px rgba(108,99,255,0.35)",
        }}
      />
      <h2 style={{ color: colors.text, fontSize: 21, fontWeight: 800, marginBottom: 8 }}>
        {line.heading}
      </h2>
      <p
        style={{
          color: colors.textSecondary,
          fontSize: 14.5,
          lineHeight: 1.6,
          maxWidth: 340,
          margin: "0 auto",
        }}
      >
        {line.body}
      </p>
      {isLastStep && (
        <p style={{ color: colors.primary, fontWeight: 700, fontSize: 15, marginTop: 14 }}>
          Let's get started! 🎉
        </p>
      )}
    </div>
  );
}

const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];

function GenderBody({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
      {GENDER_OPTIONS.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(selected ? null : opt)}
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              border: `1px solid ${selected ? colors.primary : colors.border}`,
              background: selected ? "rgba(108,99,255,0.15)" : colors.card,
              color: selected ? colors.primary : colors.text,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function AgeBody({ value, onChange, error }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <input
        type="number"
        inputMode="numeric"
        placeholder="Your age"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={numInputStyle(error)}
      />
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
}

// ---------- STEP BODY: Height ----------
function HeightBody({ value, onChange, error }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ position: "relative" }}>
        <input
          type="number"
          inputMode="numeric"
          placeholder="Height"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={numInputStyle(error)}
        />
        <span style={unitLabelStyle}>cm</span>
      </div>
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
}

// ---------- STEP BODY: Weight ----------
function WeightBody({ value, onChange, error }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ position: "relative" }}>
        <input
          type="number"
          inputMode="numeric"
          placeholder="Weight"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={numInputStyle(error)}
        />
        <span style={unitLabelStyle}>kg</span>
      </div>
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
}

function PlaceholderBody({ label }) {
  return (
    <div
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: "24px",
        textAlign: "center",
        marginBottom: 24,
      }}
    >
      <p style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }}>
        [Input UI — built in a later task]
      </p>
      <p style={{ color: colors.text, fontWeight: 600 }}>{label}</p>
    </div>
  );
}

const numInputStyle = (error) => ({
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: `1px solid ${error ? colors.error : colors.border}`,
  background: colors.card,
  color: colors.text,
  fontSize: 15,
  textAlign: "center",
  boxSizing: "border-box",
});

const unitLabelStyle = {
  position: "absolute",
  right: 16,
  top: "50%",
  transform: "translateY(-50%)",
  color: colors.textSecondary,
  fontSize: 13,
  pointerEvents: "none",
};

const errorTextStyle = {
  color: colors.error,
  fontSize: 12,
  marginTop: 8,
  textAlign: "center",
};

function validateAge(raw) {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = Number(raw);
  if (!Number.isInteger(n)) return "Enter a whole number.";
  if (n < 13) return "Must be 13 or older.";
  if (n > 100) return "Enter a valid age.";
  return null;
}

function validateHeight(raw) {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return "Enter a number.";
  if (n < 100 || n > 250) return "Enter a height between 100–250cm.";
  return null;
}

function validateWeight(raw) {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return "Enter a number.";
  if (n < 30 || n > 200) return "Enter a weight between 30–200kg.";
  return null;
}

const STEPS = [
  { key: "welcome", label: "Welcome", skippable: false },
  { key: "meetKiara", label: "Meet Kiara", skippable: false },
  { key: "gender", label: "Gender", skippable: true },
  { key: "age", label: "Age", skippable: true },
  { key: "height", label: "Height", skippable: true },
  { key: "weight", label: "Weight", skippable: true },
  { key: "lifestyle", label: "Lifestyle", skippable: true },
  { key: "fashionGoals", label: "Fashion Goals", skippable: true },
];

export default function OnboardingScreen({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;
  const progressPct = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  const fieldErrors = {
    age: step.key === "age" ? validateAge(answers.age) : null,
    height: step.key === "height" ? validateHeight(answers.height) : null,
    weight: step.key === "weight" ? validateWeight(answers.weight) : null,
  };
  const canContinue = !fieldErrors.age && !fieldErrors.height && !fieldErrors.weight;

  function updateAnswers(patch) {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }

  function goNext() {
    if (!canContinue) return;
    if (isLast) {
      onComplete(answers);
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (isFirst) return;
    setStepIndex((i) => i - 1);
  }

  function skipStep() {
    if (!step.skippable) return;
    if (step.key === "gender") updateAnswers({ gender: null });
    if (step.key === "age") updateAnswers({ age: null });
    if (step.key === "height") updateAnswers({ height: null });
    if (step.key === "weight") updateAnswers({ weight: null });
    goNext();
  }

  function skipAll() {
    onComplete(answers);
  }

  function renderBody() {
    switch (step.key) {
      case "gender":
        return <GenderBody value={answers.gender} onChange={(v) => updateAnswers({ gender: v })} />;
      case "age":
        return <AgeBody value={answers.age} onChange={(v) => updateAnswers({ age: v })} error={fieldErrors.age} />;
      case "height":
        return <HeightBody value={answers.height} onChange={(v) => updateAnswers({ height: v })} error={fieldErrors.height} />;
      case "weight":
        return <WeightBody value={answers.weight} onChange={(v) => updateAnswers({ weight: v })} error={fieldErrors.weight} />;
      case "welcome":
      case "meetKiara":
        return null;
      default:
        return <PlaceholderBody label={step.label} />;
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: colors.textSecondary,
              marginBottom: 8,
            }}
          >
            <span>
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            {step.skippable && (
              <span onClick={skipStep} style={{ cursor: "pointer" }}>
                Skip
              </span>
            )}
          </div>
          <div style={{ height: 6, background: colors.border, borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: colors.primary,
                transition: "width 0.25s ease",
              }}
            />
          </div>
        </div>

        <KiaraHeader stepKey={step.key} isLastStep={isLast} />
        {renderBody()}

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {!isFirst && (
            <button onClick={goBack} style={btnSecondary}>
              Back
            </button>
          )}
          <button
            onClick={goNext}
            disabled={!canContinue}
            style={{
              ...btnPrimary,
              opacity: canContinue ? 1 : 0.5,
              cursor: canContinue ? "pointer" : "not-allowed",
            }}
          >
            {isLast ? "Let's go →" : "Continue"}
          </button>
        </div>

        <p
          onClick={skipAll}
          style={{
            textAlign: "center",
            color: colors.textSecondary,
            fontSize: 12,
            marginTop: 24,
            cursor: "pointer",
          }}
        >
          Skip onboarding for now
        </p>
      </div>
    </div>
  );
}

const btnPrimary = {
  background: colors.primary,
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "12px 28px",
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary = {
  background: "transparent",
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: 14,
  padding: "12px 28px",
  fontWeight: 600,
  cursor: "pointer",
};