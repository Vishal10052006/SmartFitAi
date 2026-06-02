import { useState } from "react"
import UploadScreen from "./UploadScreen"
import ResultScreen from "./ResultScreen"
import OutfitFeed from "./OutfitFeed"

export default function App() {
  const [view, setView]       = useState("upload")
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const analyzeColor = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", image)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/analyse`,
        { method: "POST", body: formData }
      )
      if (!res.ok) throw new Error("Analysis failed. Please try again.")
      const data = await res.json()
      setResult(data)
      setView("result")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setView("upload")
  }

  // ── Loading Screen ──────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0f0f0f",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        color: "#ffffff", fontFamily: "'Segoe UI', sans-serif"
      }}>
        <div style={{
          width: 48, height: 48,
          border: "4px solid #333",
          borderTop: "4px solid #E9C46A",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: 24
        }} />
        <p style={{ fontSize: 16, color: "#888" }}>
          Analysing your colours...
        </p>
        <p style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
          This takes 2–4 seconds
        </p>
        <style>{`
          @keyframes spin {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // ── Main App ────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      color: "#ffffff",
      fontFamily: "'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>

      {/* Sticky Header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        width: "100%",
        background: "#0f0f0f",
        padding: "16px 20px 12px",
        textAlign: "center",
        borderBottom: "1px solid #1a1a1a"
      }}>
        <h1 style={{
          fontSize: "22px",
          fontWeight: "800",
          letterSpacing: "-0.5px"
        }}>
          SmartFit <span style={{ color: "#E9C46A" }}>AI</span>
        </h1>
        <p style={{ color: "#888", fontSize: "12px", marginTop: "2px" }}>
          Discover your personal color palette
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        width: "100%",
        maxWidth: "400px",
        padding: "24px 16px"
      }}>

        {/* Error Banner */}
        {error && (
          <div style={{
            background: "#2a0f0f",
            border: "1px solid #cc3333",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 24
          }}>
            <p style={{ color: "#ff6b6b", fontSize: 14, marginBottom: 10 }}>
              ⚠️ {error}
            </p>
            <button onClick={() => setError(null)} style={{
              background: "#333", color: "#fff",
              border: "none", borderRadius: 8,
              padding: "8px 16px", fontSize: 13, cursor: "pointer"
            }}>
              Try again
            </button>
          </div>
        )}

        {/* Upload View */}
        {view === "upload" && (
          <UploadScreen
            preview={preview}
            loading={loading}
            onUpload={handleUpload}
            onAnalyze={analyzeColor}
          />
        )}

        {/* Result View */}
        {view === "result" && result && (
          <ResultScreen
            result={result}
            onSeeOutfits={() => setView("feed")}
            onReset={resetAll}
          />
        )}

        {/* Feed View */}
        {view === "feed" && result && (
          <OutfitFeed
            skinTone={result.skin_tone}
            onBack={resetAll}
          />
        )}

      </div>
    </div>
  )
}