import { useState, useEffect } from "react";
import { colors } from "./design-system/colors";

export default function HomeScreen({
  userId,
  accessToken,
  styleDNA,
  onAnalyze,
  onViewLooks,
  onWardrobe,
  onPalette,
}) {
  // Module 3: dashboard now owns its own data fetch instead of relying
  // on session-only `result` state passed down from App.jsx. This is
  // what makes "Previous Analysis" and "Recent Activity" survive a
  // page refresh — before this, the dashboard forgot everything the
  // moment the tab reloaded.
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Backend now reads the user from the verified JWT via
    // Depends(get_current_user) at /analyses/me — it no longer accepts
    // a client-supplied user_id in the URL (that was a deliberate
    // security fix). So this fetch is gated on accessToken, not userId.
    if (!accessToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadAnalyses() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/analyses/me?limit=10`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (res.status === 401) {
          throw new Error("Session expired — please log in again");
        }
        if (!res.ok) throw new Error("Failed to load analysis history");

        const data = await res.json();
        if (cancelled) return;

        setAnalyses(data.analyses || []);
      } catch (err) {
        console.error("Failed to load analyses:", err);
        if (cancelled) return;
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnalyses();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const latest = analyses[0] || null;
  const skinTone = latest?.skin_tone;
  const bodyShape = latest?.body_shape;
  const bodyShapeConfidence = latest?.body_shape_confidence;

  // "Previous Analysis" — everything after the most recent one
  const previousAnalyses = analyses.slice(1, 4);

  // "Recent Activity" — derived from the same analyses list for now.
  // Each analysis run is one activity event. Saved-look events can be
  // merged in here later once WardrobeScreen persists to a backend
  // table instead of local-only state.
  const recentActivity = analyses.slice(0, 5).map((a) => ({
    id: a.id,
    label: `Analysis run — ${a.body_shape || "Unknown shape"}`,
    date: a.created_at,
  }));

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        paddingBottom: "100px",
      }}
    >

      {/* Welcome Card */}

      <div
        style={{
          background: "linear-gradient(135deg, #111827 0%, #0F172A 100%)",
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          padding: "24px",
        }}
      >
        <h2
          style={{
            color: "#FFFFFF",
            margin: 0,
            fontSize: "26px",
            fontWeight: "700",
          }}
        >
          Welcome To SmartFit AI
        </h2>

        <p
          style={{
            color: colors.textSecondary,
            marginTop: "12px",
            lineHeight: "1.7",
            fontSize: "14px",
          }}
        >
          Know your best suited clothes based on your body shape, skin tone and Style DNA.
        </p>
      </div>

      {/* Style Profile */}

      <div
        style={{
          background: "#111827",
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          padding: "20px",
        }}
      >
        <h3
          style={{
            color: "#FFFFFF",
            marginTop: 0,
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Your Style Profile
        </h3>

        {loading ? (
          <p style={{ color: colors.textSecondary, textAlign: "center", fontSize: "13px" }}>
            Loading your profile...
          </p>
        ) : (
          <>
            <p
              style={{
                color: "#6C63FF",
                textAlign: "center",
                fontWeight: "700",
                fontSize: "16px",
                marginBottom: "16px",
              }}
            >
              {styleDNA?.styleIdentity || "No Style DNA Yet"}
            </p>

            <p
              style={{
                color: "#B3B7C2",
                textAlign: "center",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              {styleDNA?.fitPreference}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p style={{ color: colors.textSecondary, fontSize: "12px" }}>
                  Skin Tone
                </p>
                <h4 style={{ color: colors.primary, margin: 0 }}>
                  {skinTone || "Not Analyzed Yet"}
                </h4>
              </div>

              <div>
                <p style={{ color: colors.textSecondary, fontSize: "12px" }}>
                  Body Shape
                </p>
                <h4 style={{ color: "#FFFFFF", margin: 0 }}>
                  {bodyShape || "—"}
                  {bodyShapeConfidence ? (
                    <span style={{ color: colors.textSecondary, fontSize: "11px", fontWeight: 400 }}>
                      {" "}({bodyShapeConfidence}%)
                    </span>
                  ) : null}
                </h4>
              </div>

              <div>
                <p style={{ color: colors.textSecondary, fontSize: "12px" }}>
                  Analyses Run
                </p>
                <h4 style={{ color: "#FFFFFF", margin: 0 }}>
                  {analyses.length}
                </h4>
              </div>
            </div>
          </>
        )}

        {error && (
          <p style={{ color: "#FF6B6B", fontSize: "12px", textAlign: "center", marginTop: "12px" }}>
            Couldn't load history — {error}
          </p>
        )}
      </div>

      {/* Primary Action */}

      <button
        onClick={onAnalyze}
        style={{
          background: colors.primary,
          color: "#FFFFFF",
          border: "none",
          borderRadius: "18px",
          padding: "18px",
          fontWeight: "700",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {latest ? "Re-Analyze Yourself" : "Analyze Yourself"}
      </button>

      {/* Secondary Action */}

      <button
        onClick={onPalette}
        style={{
          background: "#0F172A",
          color: "#FFFFFF",
          border: "1px solid #6C63FF",
          borderRadius: "18px",
          padding: "18px",
          fontWeight: "700",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        🎨 View My Colors
      </button>

      {/* Previous Analysis */}

      <div
        style={{
          background: "#111827",
          border: `1px solid ${colors.border}`,
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        <h3
          style={{
            color: "#FFFFFF",
            marginTop: 0,
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Previous Analysis
        </h3>

        {loading && (
          <p style={{ color: colors.textSecondary, textAlign: "center", fontSize: "13px" }}>
            Loading...
          </p>
        )}

        {!loading && previousAnalyses.length === 0 && (
          <p style={{ color: colors.textSecondary, textAlign: "center", fontSize: "13px" }}>
            {analyses.length === 0
              ? "Run your first analysis to see it here."
              : "No earlier analyses yet — this is your first one."}
          </p>
        )}

        {!loading &&
          previousAnalyses.map((a) => (
            <div
              key={a.id}
              style={{
                background: "#1A1F2E",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "10px",
              }}
            >
              <p style={{ color: "#FFFFFF", fontWeight: "700", marginBottom: "4px" }}>
                {a.body_shape || "Unknown shape"} · {a.skin_tone || "Unknown tone"}
              </p>
              <p style={{ color: colors.textSecondary, fontSize: "12px" }}>
                {formatDate(a.created_at)}
              </p>
            </div>
          ))}
      </div>

      {/* Recent Activity */}

      <div
        style={{
          background: "#111827",
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          padding: "20px",
        }}
      >
        <h3
          style={{
            color: "#FFFFFF",
            textAlign: "center",
            marginTop: 0,
            marginBottom: "18px",
          }}
        >
          Recent Activity
        </h3>

        {!loading && recentActivity.length === 0 && (
          <p style={{ color: colors.textSecondary, textAlign: "center", fontSize: "13px" }}>
            Nothing yet — your activity will show up here.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {recentActivity.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                color: "#FFFFFF",
              }}
            >
              <span>{item.label}</span>
              <span style={{ color: colors.textSecondary }}>{formatDate(item.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}