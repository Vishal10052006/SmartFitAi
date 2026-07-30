import { useState } from "react";
import { colors } from "../design-system/colors";
import { useAuth } from "./AuthContext";

function AuthScreen() {
  const { login, signup } = useAuth();
  const { loginWithGoogle } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);


  async function handleGoogleLogin() {
    setError(null);
    try {
      await loginWithGoogle();
      // No further code runs here — browser navigates away to Google
    } catch (err) {
      setError(err.message || "Google login failed");
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email above first, then click 'Forgot password?'");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();

      setConfirmationMessage(data.message);
    } catch {
      setError("Something went wrong sending the reset email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setConfirmationMessage(null);

    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        // On success, AuthContext flips isAuthenticated — App.jsx re-renders
      } else {
        const result = await signup(email, password);

        if (result.pendingConfirmation) {
          setConfirmationMessage(
            `Account created for ${result.email}. Check your email to confirm before logging in.`
          );
          setMode("login");
        }
        // If not pending, signup() already set auth state — user is in
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "800",
              color: colors.text,
              margin: 0,
              marginBottom: "8px",
            }}
          >
            SmartFit{" "}
            <span style={{ color: colors.primary }}>AI</span>
          </h1>
          <p
            style={{
              color: colors.textSecondary,
              fontSize: "14px",
              margin: 0,
            }}
          >
            {mode === "login"
              ? "Welcome back — log in to continue"
              : "Create your account"}
          </p>
        </div>

        {/* Confirmation message (after signup requiring email verify) */}
        {confirmationMessage && (
          <div
            style={{
              background: "rgba(0,194,168,0.12)",
              border: `1px solid ${colors.success}`,
              borderRadius: 16,
              padding: "14px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                color: colors.success,
                fontSize: "13px",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              ✓ {confirmationMessage}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#2A0F0F",
              border: "1px solid #CC3333",
              borderRadius: 16,
              padding: "14px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                color: "#FF6B6B",
                fontSize: "13px",
                margin: 0,
              }}
            >
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Form */}
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 24,
            padding: "24px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                color: colors.textSecondary,
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
                background: colors.background,
                color: colors.text,
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: colors.textSecondary,
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
                background: colors.background,
                color: colors.text,
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              background: colors.primary,
              color: "#FFFFFF",
              border: "none",
              padding: "14px",
              borderRadius: "16px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Log In"
              : "Sign Up"}
          </button>
        </div>

        {mode === "login" && (
          <p
            onClick={handleForgotPassword}
            style={{
              textAlign: "center",
              marginTop: "14px",
              color: colors.primary,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Forgot password?
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: colors.border }} />
          <span style={{ color: colors.textSecondary, fontSize: "12px" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: colors.border }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            background: colors.card,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            padding: "14px",
            borderRadius: "16px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>

        {/* Toggle mode */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: colors.textSecondary,
            fontSize: "13px",
          }}
        >
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <span
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setConfirmationMessage(null);
            }}
            style={{
              color: colors.primary,
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthScreen;