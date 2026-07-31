import { useState } from "react";
import BottomNavigation from "./BottomNavigation";

import { colors } from "./design-system/colors";

import UploadScreen from "./UploadScreen";
import ResultScreen from "./ResultScreen";
import OutfitFeed from "./OutfitFeed";
import HomeScreen from "./HomeScreen";
import OnboardingScreen from "./OnboardingScreen";

import WardrobeScreen from "./WardrobeScreen";
import buildStyleDNA from "./ai/styleDNA/buildStyleDNA";
import ColorPaletteScreen from "./ColorPaletteScreen";
import StyleDNAScreen from "./StyleDNAScreen";

import detectIntent from "./ai/assistant/detectIntent";
import FashionAssistantScreen from "./FashionAssistantScreen";

import { useAuth } from "./auth/AuthContext";
import AuthScreen from "./auth/AuthScreen";

console.log(
  "TEST",
  detectIntent("Open wardrobe")
);

export default function App() {
  const [view, setView] = useState("home");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedLooks, setSavedLooks] = useState([]);
  const [styleDNA, setStyleDNA] = useState(null);

  const { isAuthenticated, accessToken, logout, userId } = useAuth();

  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    if (!userId) return false;
    return localStorage.getItem(`smartfit-onboarded-${userId}`) === "true";
  });

  const [onboardingAnswers, setOnboardingAnswers] = useState(() => {
    if (!userId) return {};
    const saved = localStorage.getItem(`smartfit-answers-${userId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const analyzeBody = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", image);

      // T2.4 fix: previously this never sent height, so the backend
      // silently defaulted to 170cm for every user. Now it sends the
      // real onboarding value, falling back to 170 only if the user
      // explicitly skipped that step.
      const heightCm = onboardingAnswers.height
        ? Number(onboardingAnswers.height)
        : 170;
      formData.append("height_cm", heightCm);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/style-dna`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();

        // if token expired/invalid mid-session, force re-login
        // instead of showing a confusing raw 401 JSON to the user
        if (res.status === 401) {
          logout();
          return;
        }

        throw new Error(errorText);
      }

      const data = await res.json();

      setResult(data);

      const generatedDNA = buildStyleDNA({
        stylePreference: "Smart Casual",
        occasionPreference: "College"
      });

      setStyleDNA(generatedDNA);

      console.log("GENERATED DNA");
      console.log(generatedDNA);

      setView("result");

    } catch (err) {

      setError(
        err.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };

  const resetAll = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setView("upload");
  };

  // Loading Screen

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: colors.text,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: `4px solid ${colors.border}`,
            borderTop: `4px solid ${colors.primary}`,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: 24,
          }}
        />

        <p
          style={{
            fontSize: 16,
            color: colors.text,
            fontWeight: 500,
          }}
        >
          Analysing your body profile...
        </p>

        <p
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 8,
          }}
        >
          Analyzing body shape and measurements
        </p>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (!onboardingComplete) {
    return (
      <OnboardingScreen
        onComplete={(answers) => {
          setOnboardingAnswers(answers);
          if (userId) {
            localStorage.setItem(`smartfit-onboarded-${userId}`, "true");
            // Store the raw answers too, so height/weight survive a refresh
            // (this is a stopgap — T2.6 replaces it with a real Supabase save)
            localStorage.setItem(`smartfit-answers-${userId}`, JSON.stringify(answers));
          }
          setOnboardingComplete(true);
        }}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
        color: colors.text,
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          width: "100%",
          background: colors.background,
          padding: "18px 20px 14px",
          textAlign: "center",
          borderBottom: `1px solid ${colors.border}`,
          position: "relative",
        }}
      >
        <p
          style={{
            color: colors.textSecondary,
            fontSize: "12px",
            marginBottom: "6px",
          }}
        >
          Your Personal AI Stylist Kiara.
        </p>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: "800",
            letterSpacing: "-0.6px",
            margin: 0,
          }}
        >
          SmartFit{" "}
          <span
            style={{
              color: colors.primary,
            }}
          >
            AI
          </span>
        </h1>
      </div>

      {/* Main Content */}

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "24px 16px",
          paddingBottom: "140px"
        }}
      >
        {/* Error */}

        {error && (
          <div
            style={{
              background: "#2A0F0F",
              border: "1px solid #CC3333",
              borderRadius: 16,
              padding: "16px",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                color: "#FF6B6B",
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              ⚠️ {error}
            </p>

            <button
              onClick={() => setError(null)}
              style={{
                background: colors.primary,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 12,
                padding: "10px 16px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {view === "home" && (
          <>

            <HomeScreen
              skinTone={result?.style_dna?.skin_tone?.tone}
              styleDNA={styleDNA}
              onAnalyze={() => setView("upload")}
              onWardrobe={() => setView("wardrobe")}
              onPalette={() => setView("palette")}
              onViewLooks={() => {
                if (result) {
                  setView("feed");
                } else {
                  alert("Please analyze a photo first.");
                  setView("upload");
                }
              }}
            />
          </>
        )}

        {view === "upload" && (
          <UploadScreen
            preview={preview}
            loading={loading}
            onUpload={handleUpload}
            onAnalyze={analyzeBody}
          />
        )}

        {view === "result" && result && (
          <ResultScreen
            result={result}
            onSeeOutfits={() => setView("styleDNA")}
            onReset={resetAll}
          />
        )}

        {view === "styleDNA" && result && (
          <StyleDNAScreen
            result={result}
            styleDNA={styleDNA}
            onViewLooks={() => setView("feed")}
          />
        )}

        {view === "feed" && (
          <OutfitFeed
            skinTone={result?.style_dna?.skin_tone?.tone}
            styleDNA={styleDNA}
            onBack={() => setView("home")}
            savedLooks={savedLooks}
            setSavedLooks={setSavedLooks}
            bodyShape={
              result?.style_dna?.body_shape?.body_shape
            }
            shapeRules={
              result?.style_dna?.shape_rules
            }

            onOpenWardrobe={() => setView("wardrobe")}
            onOpenPalette={() => setView("palette")}
            onOpenUpload={() => setView("upload")}
          />
        )}

        {view === "wardrobe" && (
          <WardrobeScreen
            savedLooks={savedLooks}
            onBack={() => setView("home")}
          />
        )}

        {view === "palette" && (
          <ColorPaletteScreen
            skinTone={result?.style_dna?.skin_tone?.tone}
            onBack={() => setView("home")}
          />
        )}

      </div>

      <FashionAssistantScreen
        skinTone={result?.style_dna?.skin_tone}
        bodyShape={
          result?.style_dna?.body_shape?.body_shape
        }
        styleDNA={styleDNA}
        onAction={(action) => {

          if (action === "WARDROBE")
            setView("wardrobe");

          if (action === "FEED")
            setView("feed");

          if (action === "PALETTE")
            setView("palette");

          if (action === "UPLOAD")
            setView("upload");

        }}
      />

      <BottomNavigation
        onHome={() => setView("home")}
        onAnalyze={() => setView("upload")}
        onWardrobe={() => setView("wardrobe")}
        onPalette={() => setView("palette")}
      />

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          width: "100%",
          background: colors.background,
          padding: "18px 20px 14px",
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }} />

        <div style={{ textAlign: "center" }}>
          <p style={{ color: colors.textSecondary, fontSize: "12px", marginBottom: "6px" }}>
            Your Personal AI Stylist Kiara.
          </p>
          <h1 style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.6px", margin: 0 }}>
            SmartFit <span style={{ color: colors.primary }}>AI</span>
          </h1>
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
              borderRadius: "12px",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
      </div>

    </div>
  );
}