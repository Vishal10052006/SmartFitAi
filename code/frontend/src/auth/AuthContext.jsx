import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseBrowser = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
// WHY CONTEXT INSTEAD OF PROP DRILLING:
// Auth state (token, user) is needed in App.jsx (to gate the whole app)
// AND deep in any component that calls a protected endpoint. Passing it
// as props through every screen would mean touching every component file
// every time we add a new protected route. Context avoids that.

const AuthContext = createContext(null);

const STORAGE_KEY = "smartfit-auth";

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Corrupted localStorage value — treat as logged out rather than crash
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth);

  // Keep localStorage in sync whenever auth state changes
  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  async function signup(email, password) {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/signup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Sign up failed");
    }

    // Supabase email confirmation is ON (per T1.2) — signup succeeds
    // but returns no token until the user confirms via email.
    if (data.status === "pending_confirmation") {
      return { pendingConfirmation: true, email: data.email };
    }

    setAuth({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      email: data.email,
      userId: data.user_id,
    });

    return { pendingConfirmation: false };
  }

  async function login(email, password) {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Login failed");
    }

    setAuth({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      email: data.email,
      userId: data.user_id,
    });
  }

  function logout() {
    setAuth(null);
  }

  // Supabase's browser client automatically detects and exchanges the
  // OAuth code in the URL on page load (detectSessionInUrl: true by
  // default). We don't need to do that exchange manually — we just
  // need to listen for the session it produces and sync it into our
  // own auth state.
  useEffect(() => {
    // Check if Supabase already has a session (covers page load after redirect)
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setAuth({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          email: data.session.user?.email || null,
          userId: data.session.user?.id || null,
        });
        window.history.replaceState(null, "", window.location.pathname);
      }
    });

    // Also listen for future auth state changes (login, logout, token refresh)
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setAuth({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            email: session.user?.email || null,
            userId: session.user?.id || null,
          });
        }
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  async function loginWithGoogle() {
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  const value = {
    isAuthenticated: !!auth?.accessToken,
    accessToken: auth?.accessToken || null,
    email: auth?.email || null,
    userId: auth?.userId || null,
    signup,
    login,
    logout,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}