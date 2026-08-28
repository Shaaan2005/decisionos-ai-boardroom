import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { Compass, ArrowRight, Lock, Mail, User, Briefcase, Target, Loader2 } from "lucide-react";
import { playLoginSound, playErrorSound, playClickSound } from "../utils/audioUtils";
import { useLanguage } from "../context/LanguageContext";

export const RegisterPage = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentRole, setCurrentRole] = useState("Staff Software Engineer");
  const [careerGoals, setCareerGoals] = useState("Scale an AI company from 0 to 1 as technical leader or founder.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      playErrorSound();
      setError("Please complete all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await register({
        full_name: fullName,
        email,
        password,
        current_role: currentRole,
        career_goals: careerGoals,
      });
      playLoginSound();
    } catch (err) {
      playErrorSound();
      setError(err.message || "Failed to register account");
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
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "520px",
        padding: "40px",
        position: "relative"
      }}>
        {/* Logo Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            boxShadow: "0 0 25px rgba(99, 102, 241, 0.5)"
          }}>
            <Compass size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 800 }}>
            {t("auth.register_title", "Initialize Your Personal Board")}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {t("auth.register_subtitle", "Configure your AI advisors (CEO, CFO, CTO, Risk Analyst, Mentor, Chairman)")}
          </p>
        </div>

        {error && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fda4af",
            fontSize: "0.85rem",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
              {t("auth.full_name", "Full Name")} *
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                className="input-field"
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
              {t("auth.email", "Work Email")} *
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.mercer@decisionos.ai"
                className="input-field"
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
              {t("auth.password", "Password")} *
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field"
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
              Current Role / Background
            </label>
            <div style={{ position: "relative" }}>
              <Briefcase size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="Senior Engineering Lead / Product Director"
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
              Primary Career / Life Horizon Goal
            </label>
            <div style={{ position: "relative" }}>
              <Target size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <input
                type="text"
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="Scale an AI startup or achieve executive autonomy"
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "10px" }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t("auth.creating", "Chartering Boardroom...")}
              </>
            ) : (
              <>
                <span>{t("auth.create_account", "Charter Personal Board of Directors")}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Already chartered your board?{" "}
            <button
              onClick={() => {
                playClickSound();
                onSwitchToLogin();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent-primary)",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
