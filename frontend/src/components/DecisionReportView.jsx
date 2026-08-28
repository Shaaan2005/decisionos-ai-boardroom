import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  TrendingUp, 
  ListChecks, 
  HelpCircle,
  FileText,
  Download,
  Printer,
  Calendar,
  Zap
} from "lucide-react";
import { playClickSound, playPopSound } from "../utils/audioUtils";
import { downloadDecisionMarkdown, exportDecisionToPDF } from "../utils/exportUtils";
import { StrategicRadarChart } from "./StrategicRadarChart";
import { SensitivitySandbox } from "./SensitivitySandbox";
import { WeightedDecisionScorecard } from "./WeightedDecisionScorecard";
import { AudioExecutiveBriefing } from "./AudioExecutiveBriefing";
import { ScenarioDeltaMatrix } from "./ScenarioDeltaMatrix";
import { WarRoomCrisisSimulator } from "./WarRoomCrisisSimulator";
import { GuestAdvisorStudio } from "./GuestAdvisorStudio";
import { DecisionBlueprintCard } from "./DecisionBlueprintCard";

import { ArrowRight, Sparkles, Radio } from "lucide-react";

export const DecisionReportView = ({ report, decision, isExecutiveBrief = false, onExploreDeepDive }) => {
  const [completedTripwires, setCompletedTripwires] = useState({});

  if (!report) return null;

  const confidencePct = Math.round((report.confidence_score || 0.85) * 100);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const toggleTripwire = (index) => {
    playPopSound();
    setCompletedTripwires(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const exportTripwiresToCalendar = () => {
    playClickSound();
    const now = new Date();
    const reviewDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days out
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const title = `[DecisionOS] 90-Day Pre-Mortem Strategic Checkpoint: ${decision?.title || "Strategic Decision"}`;
    const desc = `DecisionOS 90-Day Executive Tripwire Review.\n\nRecommended Verdict: ${report.recommended_option}\n\nCritical Safeguards:\n` +
      (report.risk_factors || []).map((r, i) => `${i + 1}. ${r.risk} (Mitigation: ${r.mitigation})`).join("\n");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DecisionOS//AI Board//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:decisionos-${decision?.id || Date.now()}@decisionos.ai`,
      `DTSTAMP:${formatDate(now)}`,
      `DTSTART:${formatDate(reviewDate)}`,
      `DTEND:${formatDate(new Date(reviewDate.getTime() + 60 * 60 * 1000))}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc.replace(/\n/g, "\\n")}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT1440M",
      "ACTION:DISPLAY",
      "DESCRIPTION:DecisionOS 90-Day Strategic Checkpoint Tomorrow",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `decisionos-90day-checkpoint-${decision?.id || "review"}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // 1. EXECUTIVE BRIEF MODE (Clean, human-friendly 10-sec read)
  // =========================================================================
  if (isExecutiveBrief) {
    const topUpside = report.growth_opportunities?.[0] || report.key_agreements?.[0] || "Asymmetric upside potential with compounding enterprise leverage.";
    const topTradeoff = report.key_disagreements?.[0] || "Requires disciplined capital allocation and focused resource prioritization.";
    const topRisk = report.risk_factors?.[0] || { risk: "Execution velocity bottleneck", mitigation: "Establish weekly milestone reviews and clear team ownership." };

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* Compact 60-Second Audio Executive Briefing */}
        <AudioExecutiveBriefing report={report} decision={decision} />

        {/* Official Board Recommendation Banner */}
        <motion.div 
          variants={itemVariants}
          className="glass-card animate-pulse-glow" 
          style={{
            padding: "28px 32px",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
            <div style={{ maxWidth: "780px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Trophy size={18} color="#f59e0b" />
                <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, color: "#f59e0b" }}>
                  Official Board Recommendation
                </span>
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff", marginBottom: "10px" }}>
                {report.recommended_option}
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#cbd5e1", lineHeight: "1.6" }}>
                {report.strategic_verdict}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 20px",
                borderRadius: "14px",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                minWidth: "120px"
              }}>
                <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "#a5b4fc", fontWeight: 700 }}>
                  Quorum Score
                </span>
                <span style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ffffff" }}>
                  {confidencePct}%
                </span>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  exportDecisionToPDF(decision, report);
                }}
                className="btn-primary"
                style={{ padding: "7px 14px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Printer size={14} />
                <span>Export PDF Memo</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* 3-Pillar Clarity Grid (Upside, Friction, Risk Guardrail) */}
        <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {/* Pillar 1: Why This Wins */}
          <div className="glass-card" style={{ padding: "20px", borderTop: "3px solid #10b981" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <CheckCircle2 size={18} color="#10b981" />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
                1. The Compounding Upside
              </h4>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: "1.5" }}>
              {topUpside}
            </p>
          </div>

          {/* Pillar 2: The Hard Trade-Off */}
          <div className="glass-card" style={{ padding: "20px", borderTop: "3px solid #f59e0b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <XCircle size={18} color="#f59e0b" />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
                2. The Key Trade-Off
              </h4>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: "1.5" }}>
              {topTradeoff}
            </p>
          </div>

          {/* Pillar 3: Primary Guardrail */}
          <div className="glass-card" style={{ padding: "20px", borderTop: "3px solid #f43f5e" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <ShieldAlert size={18} color="#f43f5e" />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
                3. The #1 Risk & Safeguard
              </h4>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: "1.5" }}>
              <strong style={{ color: "#fda4af" }}>{topRisk.risk}</strong>: {topRisk.mitigation}
            </p>
          </div>
        </motion.div>

        {/* Immediate Action Roadmap */}
        {report.action_plan_steps && report.action_plan_steps.length > 0 && (
          <motion.div variants={itemVariants} className="glass-card" style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <ListChecks size={18} color="#10b981" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                Immediate Execution Steps (What to do This Week)
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {report.action_plan_steps.slice(0, 3).map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "var(--accent-primary)",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "#e2e8f0", lineHeight: "1.4", paddingTop: "2px" }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Progressive Disclosure CTA Banner */}
        {onExploreDeepDive && (
          <motion.div
            variants={itemVariants}
            onClick={onExploreDeepDive}
            whileHover={{ scale: 1.01, y: -2 }}
            style={{
              padding: "20px 24px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(99, 102, 241, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Radio size={20} color="#a5b4fc" />
              </div>
              <div>
                <h4 style={{ fontSize: "0.98rem", fontWeight: 800, color: "#ffffff", marginBottom: "2px" }}>
                  Explore Interactive Boardroom & Deep Dive Tools
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Inspect the 3D Holographic Chamber, McKinsey Delta Matrix, 5-Axis Radar, Sensitivity Sandbox & Black Swan War Room.
                </p>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "#a5b4fc"
            }}>
              <span>Open Deep Dive</span>
              <ArrowRight size={16} />
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // =========================================================================
  // 2. FULL DOSSIER MODE (Comprehensive C-Suite deep dive)
  // =========================================================================
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* 60-Second Executive Audio Podcast / Briefing */}
      <AudioExecutiveBriefing report={report} decision={decision} />

      {/* Executive Recommended Verdict Banner */}
      <motion.div 
        variants={itemVariants}
        className="glass-card animate-pulse-glow" 
        style={{
          padding: "32px",
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.4)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)"
        }} />

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Trophy size={20} color="#f59e0b" />
              <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, color: "#f59e0b" }}>
                Official Board Recommendation
              </span>
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ffffff", marginBottom: "10px" }}>
              {report.recommended_option}
            </h2>
            <p style={{ fontSize: "1rem", color: "#cbd5e1", maxWidth: "800px", lineHeight: "1.6" }}>
              {report.strategic_verdict}
            </p>
          </div>

          {/* Right Column: Confidence Score Pill & Export Memo Buttons */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 24px",
                borderRadius: "16px",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                minWidth: "140px"
              }}
            >
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#a5b4fc", fontWeight: 700 }}>
                Confidence Score
              </span>
              <motion.span 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                style={{ fontSize: "2.2rem", fontWeight: 900, color: "#ffffff" }}
              >
                {confidencePct}%
              </motion.span>
            </motion.div>

            {/* Export Actions Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  downloadDecisionMarkdown(report, decision);
                }}
                className="btn-secondary"
                title="Download Executive Memo Markdown"
                style={{ padding: "8px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Download size={14} />
                <span>Memo (.md)</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  exportDecisionToPDF(decision, report);
                }}
                className="btn-primary"
                title="Print or Save PDF"
                style={{ padding: "8px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Printer size={14} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <motion.div variants={itemVariants} className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <FileText size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
            Executive Synthesis & Strategic Thesis
          </h3>
        </div>
        <p style={{ fontSize: "0.95rem", color: "#cbd5e1", lineHeight: "1.7" }}>
          {report.executive_summary}
        </p>
      </motion.div>

      {/* Side-by-Side Scenario Delta Comparison Matrix */}
      <WeightedDecisionScorecard decision={decision} />
      <ScenarioDeltaMatrix report={report} decision={decision} />

      {/* Agreements vs Disagreements Grid */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Key Agreements */}
        <div className="glass-card" style={{ padding: "24px", borderTop: "3px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
              Unanimous Board Agreements
            </h4>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
            {report.key_agreements && report.key_agreements.map((item, idx) => (
              <motion.li 
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem", color: "#e2e8f0", lineHeight: "1.5" }}
              >
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Key Disagreements */}
        <div className="glass-card" style={{ padding: "24px", borderTop: "3px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <XCircle size={20} color="#f59e0b" />
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
              Debated Tensions & Trade-offs
            </h4>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
            {report.key_disagreements && report.key_disagreements.map((item, idx) => (
              <motion.li 
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem", color: "#e2e8f0", lineHeight: "1.5" }}
              >
                <span style={{ color: "#f59e0b", fontWeight: 700 }}>•</span>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Interactive 5-Axis Strategic Trade-Off Radar */}
      <motion.div variants={itemVariants}>
        <StrategicRadarChart report={report} decision={decision} />
      </motion.div>

      {/* Scenario Stress-Testing & Sensitivity Sandbox */}
      <motion.div variants={itemVariants}>
        <SensitivitySandbox report={report} decision={decision} />
      </motion.div>

      {/* 90-Day Pre-Mortem Tripwires & Calendar Milestone Exporter */}
      <motion.div variants={itemVariants} className="rzp-card" style={{ padding: "28px", border: "1px solid rgba(244, 63, 94, 0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(244, 63, 94, 0.18)",
              border: "1px solid rgba(244, 63, 94, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <ShieldAlert size={20} color="#f43f5e" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
                90-Day Pre-Mortem Tripwires & Safeguards
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Check off critical risk checkpoints or sync directly with your executive calendar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={exportTripwiresToCalendar}
            className="btn-secondary"
            style={{ padding: "8px 14px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px", color: "#a5b4fc" }}
          >
            <Calendar size={15} color="#a5b4fc" />
            <span>Sync 90-Day Review to Calendar (.ics)</span>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {report.risk_factors && report.risk_factors.map((riskItem, idx) => {
            const isChecked = Boolean(completedTripwires[idx]);
            return (
              <motion.div
                key={idx}
                whileHover={{ x: 4 }}
                onClick={() => toggleTripwire(idx)}
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: isChecked ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${isChecked ? "rgba(16, 185, 129, 0.4)" : "var(--border-subtle)"}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "6px",
                  border: `2px solid ${isChecked ? "#34d399" : "var(--border-subtle)"}`,
                  background: isChecked ? "#34d399" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px"
                }}>
                  {isChecked && <CheckCircle2 size={16} color="#0b0907" />}
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.92rem", color: isChecked ? "#34d399" : "#ffffff", textDecoration: isChecked ? "line-through" : "none" }}>
                      {riskItem.risk}
                    </span>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: riskItem.severity === "High" ? "rgba(244, 63, 94, 0.2)" : "rgba(245, 158, 11, 0.2)",
                      color: riskItem.severity === "High" ? "#fda4af" : "#fde68a"
                    }}>
                      {riskItem.severity || "Medium"} Severity
                    </span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                    Prescribed Mitigation: <strong style={{ color: "#cbd5e1" }}>{riskItem.mitigation}</strong>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Strategic Growth Opportunities */}
      {report.growth_opportunities && report.growth_opportunities.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <TrendingUp size={20} color="#06b6d4" />
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              Compounding Growth Opportunities Unlocked
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            {report.growth_opportunities.map((opp, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(6, 182, 212, 0.05)",
                  border: "1px solid rgba(6, 182, 212, 0.2)",
                  fontSize: "0.9rem",
                  color: "#e0f2fe",
                  lineHeight: "1.5"
                }}
              >
                {opp}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Roadmap */}
      {report.action_plan_steps && report.action_plan_steps.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <ListChecks size={20} color="#10b981" />
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              Actionable Execution Blueprint
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {report.action_plan_steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "14px 18px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--accent-primary)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <p style={{ fontSize: "0.92rem", color: "#e2e8f0", lineHeight: "1.5", paddingTop: "3px" }}>
                  {step}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Explainability Deep Dive */}
      {report.explainability_notes && (
        <motion.div variants={itemVariants} className="glass-card" style={{ padding: "28px", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <HelpCircle size={20} color="#a855f7" />
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              Explainability: Why Did the Board Decide This?
            </h3>
          </div>
          <p style={{ fontSize: "0.92rem", color: "#cbd5e1", lineHeight: "1.7" }}>
            {report.explainability_notes}
          </p>
        </motion.div>
      )}

      {/* ─── SUPER FEATURE SUITE ──────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Zap size={20} color="#f59e0b" />
          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
            Advanced Board Intelligence Suite
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Feature 1: War Room Crisis Simulator */}
          <WarRoomCrisisSimulator report={report} decision={decision} />
          {/* Feature 2: Guest Advisor Studio */}
          <GuestAdvisorStudio report={report} decision={decision} />
          {/* Feature 3: Decision Blueprint Shareable Card */}
          <DecisionBlueprintCard report={report} decision={decision} />
        </div>
      </motion.div>
    </motion.div>
  );
};
