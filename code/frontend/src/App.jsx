import { useState, useEffect } from "react";
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

  // T2.6: onboarding status now comes from the backend, not localStorage.
  // `null` = "haven't checked yet" (shows a brief loading state instead
  // of flashing onboarding before we know). localStorage below is only
  // a fallback if the profile fetch itself fails.
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  const [onboardingAnswers, setOnboardingAnswers] = useState({});
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setProfileLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setProfileLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error("Profile fetch failed");

        const data = await res.json();
        if (cancelled) return;

        setOnboardingComplete(data.onboarding_complete);
        setOnboardingAnswers({
          gender: data.gender,
          age: data.age,
          height: data.height_cm,
          weight: data.weight_kg,
          lifestyle: data.lifestyle || [],
        });
      } catch (err) {
        // Backend unreachable / profile fetch failed — fall back to
        // the localStorage cache from before T2.6 so returning users
        // on this same browser don't get stuck re-onboarding due to
        // a transient network issue.
        console.warn("Profile fetch failed, falling back to localStorage:", err);
        if (cancelled) return;

        const cachedComplete =
          userId && localStorage.getItem(`smartfit-onboarded-${userId}`) === "true";
        const cachedAnswersRaw =
          userId && localStorage.getItem(`smartfit-answers-${userId}`);

        setOnboardingComplete(!!cachedComplete);
        setOnboardingAnswers(cachedAnswersRaw ? JSON.parse(cachedAnswersRaw) : {});
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken, userId]);

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
      formData.append("user_id", userId);

      // T2.4 fix: previously this never sent height, so the backend
      // silently defaulted to 170cm for every user.
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

        if (res.status === 401) {
          logout();
          return;
        }

        throw new Error(errorText);
      }

      const data = await res.json();

      setResult(data);

      // T2.5 fix: previously hardcoded to "College". Lifestyle is
      // multi-select — using the first selected value as primary.
      const primaryLifestyle =
        onboardingAnswers.lifestyle?.[0] || "College";

      const generatedDNA = buildStyleDNA({
        stylePreference: "Smart Casual",
        occasionPreference: primaryLifestyle,
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

  // T2.6: save onboarding answers to the backend. localStorage write
  // stays as a fallback cache only — if this PUT fails, we still flip
  // onboardingComplete locally so the user isn't stuck, but the next
  // fetch (new device, cleared cache) would show onboarding again since
  // the server never actually got it. Logged clearly so it's debuggable.
  async function completeOnboarding(answers) {
    setOnboardingAnswers(answers);

    if (userId) {
      localStorage.setItem(`smartfit-onboarded-${userId}`, "true");
      localStorage.setItem(`smartfit-answers-${userId}`, JSON.stringify(answers));
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          onboarding_complete: true,
          gender: answers.gender ?? null,
          age: answers.age ? Number(answers.age) : null,
          height_cm: answers.height ? Number(answers.height) : null,
          weight_kg: answers.weight ? Number(answers.weight) : null,
          lifestyle: answers.lifestyle ?? [],
        }),
      });
    } catch (err) {
      console.error(
        "Failed to save onboarding profile to backend — saved to localStorage only:",
        err
      );
    }

    setOnboardingComplete(true);
  }

  // Loading Screen (photo analysis)

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

  // T2.6: brief loading state while we check the backend for onboarding
  // status — prevents a flash of the onboarding flow for returning
  // users whose profile just hasn't loaded yet.
  if (profileLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: `3px solid ${colors.border}`,
            borderTop: `3px solid ${colors.primary}`,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!onboardingComplete) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
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
      {/* Header — single sticky header, Log Out merged in top-right */}

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
        <button
          onClick={logout}
          style={{
            position: "absolute",
            right: "20px",
            top: "18px",
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
    </div>
  );
}