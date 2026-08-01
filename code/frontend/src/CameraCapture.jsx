import { useRef, useState, useEffect, useCallback } from "react";
import { colors } from "./design-system/colors";

function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // rear camera preferred for full-body shots
            width: { ideal: 1080 },
            height: { ideal: 1440 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setIsReady(true);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError(
          err.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access or use Upload instead."
            : "Could not access camera. Please use Upload instead."
        );
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedImage({ blob, url });
        }
      },
      "image/jpeg",
      0.92
    );
  }, []);

  function handleRetake() {
    if (capturedImage) URL.revokeObjectURL(capturedImage.url);
    setCapturedImage(null);
  }

  function handleUsePhoto() {
    if (!capturedImage) return;
    const file = new File([capturedImage.blob], `camera-capture-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    onCapture(file, capturedImage.url);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          background: "rgba(0,0,0,0.6)",
        }}
      >
        <span style={{ color: "#fff", fontWeight: 600 }}>
          {capturedImage ? "Review Photo" : "Take Full-Body Photo"}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "22px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Camera / Preview area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {error && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <p style={{ color: colors.error }}>{error}</p>
          </div>
        )}

        {!error && !capturedImage && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Framing guide overlay */}
            {isReady && (
              <div
                style={{
                  position: "absolute",
                  inset: "8% 20%",
                  border: `2px dashed ${colors.primary}`,
                  borderRadius: "12px",
                  pointerEvents: "none",
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "16px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#fff", fontSize: "13px" }}>
                Stand back so your full body fits inside the frame. Good lighting helps accuracy.
              </p>
            </div>
          </>
        )}

        {capturedImage && (
          <img
            src={capturedImage.url}
            alt="Captured preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* Controls */}
      <div
        style={{
          padding: "24px",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        {!capturedImage ? (
          <button
            onClick={handleCapture}
            disabled={!isReady || !!error}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: `4px solid #fff`,
              background: isReady ? colors.primary : "#555",
              cursor: isReady ? "pointer" : "not-allowed",
            }}
          />
        ) : (
          <>
            <button
              onClick={handleRetake}
              style={{
                background: "transparent",
                border: `1px solid ${colors.border}`,
                color: "#fff",
                padding: "14px 28px",
                borderRadius: "16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retake
            </button>
            <button
              onClick={handleUsePhoto}
              style={{
                background: colors.primary,
                border: "none",
                color: "#fff",
                padding: "14px 28px",
                borderRadius: "16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Use Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CameraCapture;