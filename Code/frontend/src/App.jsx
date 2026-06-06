import { useState } from "react";

import { colors } from "./design-system/colors";

import UploadScreen from "./UploadScreen";
import ResultScreen from "./ResultScreen";
import OutfitFeed from "./OutfitFeed";
import HomeScreen from "./HomeScreen";
import Onboarding from "./Onboarding";
import WardrobeScreen from "./WardrobeScreen";

export default function App() {
  const [view, setView] = useState("onboarding");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedLooks, setSavedLooks] = useState([]);
  
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

    formData.append(
      "front_image",
      image
    );

    const res = await fetch(
      "http://127.0.0.1:8000/api/body-analysis",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error(
        "Body analysis failed."
      );
    }

    const data = await res.json();

    setResult(data);
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
        }}
      >
        <p
          style={{
            color: colors.textSecondary,
            fontSize: "12px",
            marginBottom: "6px",
          }}
        >
          Your Personal AI Stylist
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

        {view === "onboarding" && (
          <Onboarding
            onFinish={() => setView("home")}
          />
        )}

        {view === "home" && (
          <HomeScreen
            skinTone={result?.skin_tone}
            onAnalyze={() => setView("upload")}
            onWardrobe={() => setView("wardrobe")}
            onViewLooks={() => {
              if (result) {
                setView("feed");
              } else {
                alert("Please analyze a photo first.");
                setView("upload");
              }
            }}
          />
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
            onSeeOutfits={() => setView("feed")}
            onReset={resetAll}
          />
        )}

        {view === "feed" && result && (
          <OutfitFeed
            skinTone={result.skin_tone}
            onBack={resetAll}
            savedLooks={savedLooks}
            setSavedLooks={setSavedLooks}
          />
        )}

        {view === "wardrobe" && (
          <WardrobeScreen
            savedLooks={savedLooks}
            onBack={() => setView("home")}
          />
        )}

      </div>
    </div>
  );
}