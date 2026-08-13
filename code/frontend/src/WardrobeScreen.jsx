import { useState, useEffect } from "react";
import { colors } from "./design-system/colors";

function WardrobeScreen({ accessToken, onBack }) {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadLooks() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/looks/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("Failed to load wardrobe");
        const data = await res.json();
        if (cancelled) return;
        setLooks(data.looks || []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLooks();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  async function handleDelete(lookId) {
    const prev = looks;
    setLooks((current) => current.filter((l) => l.id !== lookId)); // optimistic

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/looks/${lookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
    } catch {
      setLooks(prev); // revert
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
      }}
    >
      <div
        style={{
          background: colors.card,
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "20px",
          border: `1px solid ${colors.border}`,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: colors.text,
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          My Wardrobe 👕
        </h2>

        <p
          style={{
            color: colors.textSecondary,
            marginTop: "10px",
          }}
        >
          Your saved outfit recommendations
        </p>
      </div>

      {loading && (
        <p style={{ color: colors.textSecondary, textAlign: "center", fontSize: "13px" }}>
          Loading your wardrobe...
        </p>
      )}

      {error && (
        <p style={{ color: "#FF6B6B", textAlign: "center", fontSize: "13px", marginBottom: "16px" }}>
          ⚠️ {error}
        </p>
      )}

      {!loading && looks.length === 0 && !error && (
        <div
          style={{
            background: colors.card,
            borderRadius: "20px",
            padding: "30px",
            textAlign: "center",
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 style={{ color: colors.text }}>
            No Saved Looks Yet
          </h3>

          <p
            style={{
              color: colors.textSecondary,
            }}
          >
            Save outfit recommendations to build
            your personal wardrobe.
          </p>
        </div>
      )}

      {!loading && looks.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          {looks.map((look) => (
            <div
              key={look.id}
              style={{
                background: colors.card,
                borderRadius: "20px",
                overflow: "hidden",
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  height: "80px",
                  background: look.color || colors.primary,
                }}
              />

              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3
                    style={{
                      color: colors.text,
                      marginBottom: "8px",
                      marginTop: 0,
                    }}
                  >
                    ❤️ {look.outfit_name}
                  </h3>

                  <button
                    onClick={() => handleDelete(look.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: colors.textMuted,
                      cursor: "pointer",
                      fontSize: "13px",
                      padding: "2px 6px",
                    }}
                  >
                    ✕
                  </button>
                </div>

                <p
                  style={{
                    color: colors.textSecondary,
                    fontSize: "14px",
                  }}
                >
                  {look.style_identity} • {look.occasion}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        style={{
          width: "100%",
          marginTop: "20px",
          background: colors.primary,
          color: "#FFFFFF",
          border: "none",
          padding: "16px",
          borderRadius: "18px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        Back To Home
      </button>
    </div>
  );
}

export default WardrobeScreen;