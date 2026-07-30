import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "@fontsource/inter";
import { AuthProvider } from './auth/AuthContext.jsx'
import ResetPasswordScreen from './auth/ResetPasswordScreen.jsx'

const isResetPasswordPath = window.location.pathname === "/reset-password";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isResetPasswordPath ? (
      <ResetPasswordScreen onComplete={() => { window.location.href = "/"; }} />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </StrictMode>,
)