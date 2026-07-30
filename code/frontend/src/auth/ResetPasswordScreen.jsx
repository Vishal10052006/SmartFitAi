import { useState } from "react";
import { colors } from "../design-system/colors";
import { getSupabaseBrowserClient } from "./supabaseBrowserClient";

// See note below this file — you need a browser-side Supabase client
// for this screen specifically, separate from your backend's client.

function ResetPasswordScreen({ onComplete }) {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // Supabase's client library automatically picks up the recovery
      // token from the URL fragment when this page loads — we just
      // need to call updateUser with the new password.
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: colors.background, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ textAlign: "center", maxWidth: "380px" }}>
          <p style={{ color: colors.success, fontSize: "18px", fontWeight: "700", marginBottom: "12px" }}>
            ✓ Password Updated
          </p>
          <p style={{ color: colors.textSecondary, marginBottom: "24px" }}>
            Your password has been changed. You can now log in with your new password.
          </p>
          <button
            onClick={onComplete}
            style={{ background: colors.primary, color: "#fff", border: "none", padding: "14px 24px", borderRadius: "16px", fontWeight: "700", cursor: "pointer" }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.background, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <h2 style={{ color: colors.text, textAlign: "center", marginBottom: "24px" }}>
          Set New Password
        </h2>

        {error && (
          <div style={{ background: "#2A0F0F", border: "1px solid #CC3333", borderRadius: 16, padding: "14px", marginBottom: "20px" }}>
            <p style={{ color: "#FF6B6B", fontSize: "13px", margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 24, padding: "24px" }}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 8 characters)"
            minLength={8}
            required
            style={{ width: "100%", padding: "12px", borderRadius: "12px", border: `1px solid ${colors.border}`, background: colors.background, color: colors.text, boxSizing: "border-box", marginBottom: "20px" }}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", background: colors.primary, color: "#fff", border: "none", padding: "14px", borderRadius: "16px", fontWeight: "700", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordScreen;