import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { Compass, Sparkles, ArrowRight, Lock, Mail, Loader2 } from "lucide-react";
import { playLoginSound, playErrorSound, playClickSound } from "../utils/audioUtils";
import { useLanguage } from "../context/LanguageContext";

export const LoginPage = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      playErrorSound();
      setError(t("auth.fill_fields", "Please fill in both email and password."));
      return;
    }
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      playLoginSound();
    } catch (err) {
      playErrorSound();
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async () => {
    playClickSound();
    const demoEmail = "alex.mercer@decisionos.ai";
    const demoPass = "Password123!";
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError("");
    try {
      await login(demoEmail, demoPass);
      playLoginSound();
    } catch (err) {
      playErrorSound();
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div className="glass-card login-card" style={{
        width: "100%",
        maxWidth: "460px",
        padding: "40px",
        position: "relative"
      }}>
        {/* Logo Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "68px",
            height: "68px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(20, 16, 12, 0.95) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 35px rgba(245, 158, 11, 0.4)",
            overflow: "hidden"
          }}>
            <img 
              src="/decisionos-logo.png" 
              alt="DecisionOS Brand Logo" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Welcome to Decision<span style={{ color: "var(--accent-primary)" }}>OS</span>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "6px" }}>
            Your AI-Powered Personal Board of Directors
          </p>
        </div>

        {error && (
          <div role="alert" style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fda4af",
            fontSize: "0.85rem",
            marginBottom: "20px",
            lineHeight: 1.45
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label htmlFor="login-email" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
              {t("auth.email", "Work Email")}
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <input
                type="email"
                id="login-email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="executive@company.com"
                className="input-field"
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
              {t("auth.password", "Password")}
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <input
                type="password"
                id="login-password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field"
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t("auth.signing_in", "Authenticating...")}
              </>
            ) : (
              <>
                <span>{t("auth.sign_in", "Sign In to Executive Board")}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Quick Demo Fill */}
          <button
            type="button"
            onClick={handleDemoFill}
            disabled={loading}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px dashed var(--border-subtle)",
              color: "#a5b4fc",
              padding: "8px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <Sparkles size={14} />
            {t("auth.demo", "Auto-Fill Demo Credentials")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {t("auth.no_account", "Don't have an executive profile yet?")}{" "}
            <button
              onClick={() => {
                playClickSound();
                onSwitchToRegister();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent-primary)",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {t("auth.sign_up_link", "Initialize Board")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
