function UploadScreen({ preview, loading, onUpload, onAnalyze }) {
  return (
    <>
      <div style={{
        border: "2px dashed #333",
        borderRadius: "20px",
        padding: "40px",
        textAlign: "center",
        width: "100%",
        maxWidth: "400px",
        marginBottom: "24px",
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        {preview ? (
          <img src={preview} alt="preview" style={{
            width: "200px", height: "200px",
            objectFit: "cover", borderRadius: "12px", marginBottom: "16px"
          }} />
        ) : (
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📷</div>
        )}
        <p style={{ color: "#888", marginBottom: "16px", fontSize: "14px" }}>
          {preview ? "Photo ready for analysis" : "Upload your photo to get started"}
        </p>
        <label style={{
          background: "#222", color: "#fff", padding: "10px 20px",
          borderRadius: "20px", cursor: "pointer", fontSize: "14px",
          display: "inline-block"
        }}>
          Choose Photo
          <input type="file" accept="image/*" onChange={onUpload} style={{ display: "none" }} />
        </label>
      </div>

      {preview && (
        <button onClick={onAnalyze} style={{
          background: "#E9C46A", color: "#000", border: "none",
          padding: "14px 32px", borderRadius: "30px", fontSize: "16px",
          fontWeight: "700", cursor: "pointer", marginBottom: "24px",
          width: "100%", maxWidth: "400px",
          boxSizing: "border-box"
        }}>
          {loading ? "Analysing..." : "Analyse My Colors"}
        </button>
      )}
    </>
  )
}

export default UploadScreen