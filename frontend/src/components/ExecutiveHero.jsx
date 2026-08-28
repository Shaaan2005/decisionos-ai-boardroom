import React from "react";
import { motion } from "framer-motion";
import { PlusCircle, Sparkles, Shield, TrendingUp, Layers, ArrowRight, Zap, Users, ShieldAlert, HeartHandshake, Bot } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const ExecutiveHero = ({ onNewDecision, onScrollDown }) => {
  const { t } = useLanguage();

  const advisorsMini = [
    { role: "CEO", name: "Vision & Scale", color: "#6366f1", icon: TrendingUp },
    { role: "CFO", name: "Runway & ROI", color: "#10b981", icon: Shield },
    { role: "CTO", name: "Tech Mastery", color: "#06b6d4", icon: Zap },
    { role: "Risk", name: "Pre-Mortem", color: "#f43f5e", icon: ShieldAlert },
    { role: "Mentor", name: "Core Values", color: "#a855f7", icon: HeartHandshake },
  ];

  return (
    <div className="laser-shimmer-card" style={{ marginBottom: "28px", width: "100%" }}>
      <div className="hero-responsive-card" style={{
        position: "relative",
        width: "100%",
        borderRadius: "13px",
        overflow: "hidden",
        padding: "clamp(20px, 4vw, 44px) clamp(16px, 4vw, 40px)",
        background: "linear-gradient(135deg, #18140e 0%, #0d0b08 100%)",
        boxShadow: "0 20px 50px -15px rgba(0, 0, 0, 0.9)",
      }}>
        {/* Animated Radial Center Light Burst */}
        <div style={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "min(600px, 90vw)",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 60%)",
          filter: "blur(50px)",
          pointerEvents: "none"
        }} />

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          position: "relative",
          zIndex: 2,
          width: "100%"
        }}>
          {/* Left Hero Content */}
          <div style={{ flex: "1 1 100%", maxWidth: "720px", width: "100%" }}>
            {/* Pulsing Live Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "20px", background: "rgba(245, 158, 11, 0.16)", border: "1px solid rgba(245, 158, 11, 0.4)", marginBottom: "16px", maxWidth: "100%" }}
            >

              <span style={{ position: "relative", display: "flex", width: "8px", height: "8px" }}>
                <span className="animate-ping" style={{ position: "absolute", display: "inline-flex", height: "100%", width: "100%", borderRadius: "50%", background: "#f59e0b", opacity: 0.75 }} />
                <span style={{ position: "relative", display: "inline-flex", borderRadius: "50%", height: "8px", width: "8px", background: "#f59e0b" }} />
              </span>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#fef08a", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {t("hero.badge", "Multi-Agent Strategic Intelligence Engine")}
              </span>
            </motion.div>

            {/* Core Headline */}
            <h1 style={{
              fontSize: "clamp(2.3rem, 4.6vw, 3.5rem)",
              fontWeight: 900,
              lineHeight: "1.12",
              letterSpacing: "-0.03em",
              marginBottom: "16px",
              color: "#ffffff"
            }}>
              {t("hero.headline", "High-stakes decisions require")} <br />
              <span style={{
                color: "#f59e0b",
                opacity: 1,
                textShadow: "0 0 40px rgba(245, 158, 11, 0.3)"
              }}>
                {t("hero.headline_accent", "diverse perspectives.")}
              </span>
            </h1>

            {/* Description */}
            <p style={{
              fontSize: "1.05rem",
              color: "#cbd5e1",
              lineHeight: "1.6",
              marginBottom: "28px"
            }}>
              {t("hero.desc", "Instead of a single AI prompt, DecisionOS orchestrates 6 autonomous executive advisors (CEO, CFO, CTO, Risk Analyst, Mentor, Chairman) who independently analyze your dilemmas, debate trade-offs, and synthesize actionable roadmaps.")}
            </p>

            {/* Action CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px" }}>
              <button
                onClick={onNewDecision}
                className="btn-primary"
                style={{ padding: "13px 28px", fontSize: "0.98rem" }}
              >
                <PlusCircle size={18} />
                <span>{t("hero.btn_convene", "Start a New Decision Review")}</span>
              </button>

              <button
                onClick={() => window.dispatchEvent(new Event("decisionos_open_chatbot"))}
                className="btn-secondary"
                style={{
                  padding: "12px 22px",
                  fontSize: "0.94rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  color: "#fef08a",
                  boxShadow: "0 0 15px rgba(245, 158, 11, 0.2)"
                }}
              >
                <Bot size={17} color="#f59e0b" />
                <span>Ask the AI Assistant</span>
              </button>

              <button
                onClick={onScrollDown}
                className="btn-secondary"
                style={{ padding: "12px 24px", fontSize: "0.94rem" }}
              >
                <span>{t("hero.btn_explore", "Explore Active Deliberations")}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Pod: Interactive Live Board Seats */}
          <div style={{ flex: "1 1 320px", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              • AUTONOMOUS BOARD QUORUM
            </div>
            {advisorsMini.map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <motion.div
                  key={adv.role}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  whileHover={{ x: 6, scale: 1.02 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${adv.color}35`,
                    boxShadow: `0 4px 15px -3px ${adv.color}15`,
                    cursor: "default"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: `${adv.color}20`,
                      border: `1px solid ${adv.color}50`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <Icon size={16} color={adv.color} />
                    </div>
                    <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#ffffff" }}>
                      {adv.role} Advice
                    </span>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: adv.color, fontWeight: 700 }}>
                    {adv.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
