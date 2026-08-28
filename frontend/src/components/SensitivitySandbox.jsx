import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sliders, 
  ShieldAlert, 
  TrendingDown, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Activity,
  Award
} from "lucide-react";
import { playClickSound, playPopSound } from "../utils/audioUtils";

/**
 * Interactive What-If Scenario Stress-Testing Sandbox
 * Allows executives to live-adjust external conditions (market shock, runway compression, risk tolerance)
 * and see real-time sensitivity impacts on Board Consensus, Advisor Stances, and Failure Probability.
 */
export const SensitivitySandbox = ({ report, decision }) => {
  // Baseline initial state
  const baseConsensus = report?.consensus_score || 82;
  
  const [runwayMonths, setRunwayMonths] = useState(12);
  const [downsideShock, setDownsideShock] = useState(0); // 0% to -50% shock
  const [riskAversion, setRiskAversion] = useState(50); // 0 (aggressive) to 100 (conservative)
  const [marketVelocity, setMarketVelocity] = useState(70); // 0 to 100

  // Calculate dynamic consensus score based on sliders
  const calculateDynamicScore = () => {
    let score = baseConsensus;

    // Runway impact
    if (runwayMonths < 6) {
      score -= (6 - runwayMonths) * 5; // harsh penalty for low runway
    } else if (runwayMonths > 12) {
      score += Math.min(6, (runwayMonths - 12) * 0.8);
    }

    // Downside shock impact
    score -= Math.round(downsideShock * 0.45);

    // Risk aversion tension
    if (riskAversion > 70) {
      score -= Math.round((riskAversion - 70) * 0.35);
    }

    // Market velocity boost
    if (marketVelocity > 70) {
      score += Math.round((marketVelocity - 70) * 0.2);
    }

    return Math.max(20, Math.min(98, Math.round(score)));
  };

  const dynamicScore = calculateDynamicScore();
  const scoreDelta = dynamicScore - baseConsensus;

  // Reset to default
  const handleReset = () => {
    playClickSound();
    setRunwayMonths(12);
    setDownsideShock(0);
    setRiskAversion(50);
    setMarketVelocity(70);
  };

  // Determine advisor buy-in status
  const getAdvisorStatus = (advisorName) => {
    switch (advisorName) {
      case "CFO":
        if (runwayMonths < 6 || downsideShock > 25) return { status: "Dissenting", color: "#f43f5e", msg: "Runway compressed beyond safe buffer." };
        if (runwayMonths >= 12) return { status: "Strong Support", color: "#10b981", msg: "Robust liquid reserve validated." };
        return { status: "Conditional", color: "#f59e0b", msg: "Manageable with expense caps." };

      case "CEO":
        if (marketVelocity > 60 && downsideShock < 35) return { status: "Strong Support", color: "#6366f1", msg: "Market tailwinds favor aggressive capture." };
        return { status: "Cautious", color: "#f59e0b", msg: "Lower velocity reduces upside." };

      case "Risk Analyst":
        if (downsideShock > 30 || riskAversion > 75) return { status: "Veto Warning", color: "#f43f5e", msg: "High probability of stress-induced failure." };
        return { status: "Acceptable", color: "#10b981", msg: "Within modeled pre-mortem bounds." };

      default:
        return { status: "Aligned", color: "#34d399", msg: "Core strategy resilient." };
    }
  };

  return (
    <div className="rzp-card" style={{ padding: "28px", marginTop: "24px", border: "1px solid rgba(245, 158, 11, 0.35)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(245, 158, 11, 0.18)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Sliders size={20} color="#f59e0b" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
              Scenario Stress-Testing & Sensitivity Sandbox
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Live-simulate downside shocks, runway changes, and market volatility to test decision robustness
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="btn-secondary"
          style={{ padding: "6px 12px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <RotateCcw size={14} />
          <span>Reset Baseline</span>
        </button>
      </div>

      {/* Dynamic Gauge Banner */}
      <div style={{
        padding: "18px 24px",
        borderRadius: "12px",
        background: "rgba(10, 16, 30, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            fontSize: "2rem",
            fontWeight: 900,
            fontFamily: "var(--font-mono)",
            color: dynamicScore >= 75 ? "#34d399" : dynamicScore >= 55 ? "#f59e0b" : "#f43f5e"
          }}>
            {dynamicScore}%
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#ffffff" }}>
              Dynamic Board Consensus Index
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Baseline was <strong>{baseConsensus}%</strong> (
              <span style={{ color: scoreDelta >= 0 ? "#34d399" : "#f43f5e", fontWeight: 700 }}>
                {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`}
              </span>{" "}
              under this simulated scenario)
            </div>
          </div>
        </div>

        {/* Robustness Tag */}
        <div style={{
          padding: "6px 14px",
          borderRadius: "8px",
          background: dynamicScore >= 75 ? "rgba(16, 185, 129, 0.15)" : dynamicScore >= 55 ? "rgba(245, 158, 11, 0.15)" : "rgba(244, 63, 94, 0.15)",
          border: `1px solid ${dynamicScore >= 75 ? "rgba(16, 185, 129, 0.4)" : dynamicScore >= 55 ? "rgba(245, 158, 11, 0.4)" : "rgba(244, 63, 94, 0.4)"}`,
          color: dynamicScore >= 75 ? "#34d399" : dynamicScore >= 55 ? "#fbbf24" : "#fda4af",
          fontSize: "0.82rem",
          fontWeight: 800
        }}>
          {dynamicScore >= 75 ? "🛡️ Highly Resilient Strategy" : dynamicScore >= 55 ? "⚠️ Vulnerable to Tail Risks" : "🚨 Fragile Under Stress"}
        </div>
      </div>

      {/* 4 Interactive Sliders Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        {/* Slider 1: Financial Runway */}
        <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
              💵 Cash Runway Buffer
            </label>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }}>
              {runwayMonths} Months
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="24"
            step="1"
            value={runwayMonths}
            onChange={(e) => {
              playPopSound();
              setRunwayMonths(parseInt(e.target.value));
            }}
            style={{ width: "100%", accentColor: "#10b981" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
            <span>3 mo (Burnout risk)</span>
            <span>24 mo (High buffer)</span>
          </div>
        </div>

        {/* Slider 2: Downside Revenue Shock */}
        <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
              📉 Market Downside Shock
            </label>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#f43f5e", fontFamily: "var(--font-mono)" }}>
              -{downsideShock}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={downsideShock}
            onChange={(e) => {
              playPopSound();
              setDownsideShock(parseInt(e.target.value));
            }}
            style={{ width: "100%", accentColor: "#f43f5e" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
            <span>0% (Expected case)</span>
            <span>-50% (Black swan shock)</span>
          </div>
        </div>

        {/* Slider 3: Personal Risk Aversion */}
        <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
              🎯 Personal Risk Posture
            </label>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#a855f7", fontFamily: "var(--font-mono)" }}>
              {riskAversion > 65 ? "Conservative" : riskAversion > 35 ? "Moderate" : "Aggressive"}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={riskAversion}
            onChange={(e) => {
              playPopSound();
              setRiskAversion(parseInt(e.target.value));
            }}
            style={{ width: "100%", accentColor: "#a855f7" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
            <span>Venture-Scale</span>
            <span>Capital Preservation</span>
          </div>
        </div>

        {/* Slider 4: Tech & Industry Velocity */}
        <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
              ⚡ Industry Tech Velocity
            </label>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#06b6d4", fontFamily: "var(--font-mono)" }}>
              {marketVelocity}%
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={marketVelocity}
            onChange={(e) => {
              playPopSound();
              setMarketVelocity(parseInt(e.target.value));
            }}
            style={{ width: "100%", accentColor: "#06b6d4" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
            <span>Stagnant market</span>
            <span>Hyper-growth inflection</span>
          </div>
        </div>
      </div>

      {/* Real-time Advisor Stance Feedbacks */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
        {["CFO", "CEO", "Risk Analyst"].map((advisor) => {
          const info = getAdvisorStatus(advisor);
          return (
            <div
              key={advisor}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: "rgba(20, 24, 38, 0.5)",
                border: `1px solid ${info.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff" }}>
                  {advisor} Advisor
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                  {info.msg}
                </div>
              </div>
              <span style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                padding: "3px 8px",
                borderRadius: "5px",
                background: `${info.color}20`,
                color: info.color,
                border: `1px solid ${info.color}40`
              }}>
                {info.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
