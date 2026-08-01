import { useState } from "react";
import { colors } from "./design-system/colors";
import CameraCapture from "./CameraCapture";

function UploadScreen({ preview, loading, onUpload, onAnalyze }) {
  const [showCamera, setShowCamera] = useState(false);

  function handleCameraCapture(file, previewUrl) {
    onUpload({ target: { files: [file] } });
    setShowCamera(false);
  }

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      {/* Hero Section */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h2 style={{ color: colors.text, fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
          Create Your Body Profile
        </h2>
        <p style={{ color: colors.textSecondary, fontSize: "15px", lineHeight: "1.6" }}>
          Upload a full-body photo and let SmartFit AI analyze your body shape,
          measurements, and style profile.
        </p>
      </div>

      {/* Upload Card */}
      <div
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          padding: "28px",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              style={{
                width: "220px",
                height: "220px",
                objectFit: "cover",
                borderRadius: "20px",
                marginBottom: "20px",
                border: `2px solid ${colors.primary}`,
              }}
            />
            <p style={{ color: colors.success, fontWeight: "600", marginBottom: "16px" }}>
              ✓ Photo Ready For Analysis
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "rgba(108,99,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "36px",
              }}
            >
              📸
            </div>
            <p style={{ color: colors.text, fontWeight: "600", marginBottom: "8px" }}>
              Front Body Photo
            </p>
            <p style={{ color: colors.textSecondary, fontSize: "14px", marginBottom: "20px" }}>
              Required • Full body visible
            </p>
          </>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowCamera(true)}
            style={{
              background: colors.primary,
              color: "#FFFFFF",
              padding: "12px 20px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            📷 Take Photo
          </button>

          <label
            style={{
              background: colors.card,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              padding: "12px 20px",
              borderRadius: "999px",
              cursor: "pointer",
              fontWeight: "600",
              display: "inline-block",
            }}
          >
            Choose from Gallery
            <input type="file" accept="image/*" onChange={onUpload} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {/* Optional Details */}
      <div
        style={{
          background: colors.card,
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "24px",
          border: `1px solid ${colors.border}`,
        }}
      >
        <p style={{ color: colors.text, fontWeight: "600", marginBottom: "16px" }}>
          Optional Details
        </p>

        <input
          type="number"
          placeholder="Height (cm)"
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "12px",
            border: `1px solid ${colors.border}`,
            boxSizing: "border-box",
          }}
        />

        <input
          type="number"
          placeholder="Weight (kg)"
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "12px",
            border: `1px solid ${colors.border}`,
            boxSizing: "border-box",
          }}
        />

        <select
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: `1px solid ${colors.border}`,
            boxSizing: "border-box",
          }}
        >
          <option value="">Gender (Optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* Analysis Features */}
      <div
        style={{
          background: colors.card,
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "24px",
          border: `1px solid ${colors.border}`,
        }}
      >
        <p style={{ color: colors.text, fontWeight: "600", marginBottom: "14px" }}>
          SmartFit AI Will Analyze
        </p>

        <div style={{ color: colors.textSecondary, fontSize: "14px", lineHeight: "1.9" }}>
          <p>✓ Body Shape Detection</p>
          <p>✓ Shoulder Analysis</p>
          <p>✓ Body Measurements</p>
          <p>✓ Size Recommendation</p>
          <p>✓ Style DNA Profile</p>
        </div>
      </div>

      {/* Analyze Button — THIS was missing */}
      {preview && (
        <button
          onClick={onAnalyze}
          disabled={loading}
          style={{
            width: "100%",
            background: colors.primary,
            color: "#FFFFFF",
            border: "none",
            padding: "16px",
            borderRadius: "18px",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {loading ? "Analyzing Your Body..." : "Analyze My Body"}
        </button>
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

export default UploadScreen;