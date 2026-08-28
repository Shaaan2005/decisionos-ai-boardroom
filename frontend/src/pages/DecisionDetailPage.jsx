import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { BoardroomView } from "../components/BoardroomView";
import { AgentCard } from "../components/AgentCard";
import { DebateTimeline } from "../components/DebateTimeline";
import { DecisionReportView } from "../components/DecisionReportView";
import { InteractiveChat } from "../components/InteractiveChat";
import { OutcomeLoggerModal } from "../components/OutcomeLoggerModal";
import { DevilsAdvocateChallenge } from "../components/DevilsAdvocateChallenge";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  MessageSquare, 
  Award, 
  FileText, 
  Users, 
  Bot, 
  CheckCircle, 
  ShieldAlert,
  Loader2,
  Calendar,
  Zap,
  Flame,
  Radio
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const DecisionDetailPage = ({ decisionId, onBack }) => {
  const { t } = useLanguage();
  const [decision, setDecision] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliberating, setDeliberating] = useState(false);
  const [activeTab, setActiveTab] = useState("report");
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const dec = await api.getDecision(decisionId);
      setDecision(dec);
      if (dec.status === "completed") {
        try {
          const rep = await api.getDecisionReport(decisionId);
          setReport(rep);
        } catch (e) {
          console.log("No report found yet");
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load decision");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [decisionId]);

  const handleStartDeliberation = async () => {
    setDeliberating(true);
    setError("");
    try {
      const rep = await api.deliberateDecision(decisionId);
      setReport(rep);
      setDecision((prev) => ({ ...prev, status: "completed" }));
      setActiveTab("report");
    } catch (err) {
      setError(err.message || "Deliberation failed");
    } finally {
      setDeliberating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "14px", color: "var(--text-muted)" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={24} color="var(--accent-primary)" className="animate-spin" />
        </div>
        <span style={{ fontSize: "0.95rem", color: "#cbd5e1", fontWeight: 600 }}>
          {t("detail.loading", "Summoning Personal Board of Directors Briefing...")}
        </span>
      </div>
    );
  }

  if (!decision) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>{t("detail.not_found", "Decision not found.")}</p>
        <button onClick={onBack} className="btn-secondary" style={{ marginTop: "16px" }}>{t("detail.back_dash", "Back to Dashboard")}</button>
      </div>
    );
  }

  const isCompleted = decision.status === "completed" && report;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.92rem",
            fontWeight: 700
          }}
        >
          <ArrowLeft size={18} />
          {t("detail.back", "Back to Executive Dashboard")}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isCompleted && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowOutcomeModal(true)}
              className="btn-secondary"
              style={{ padding: "9px 16px", fontSize: "0.88rem" }}
            >
              <Award size={17} color="#f59e0b" />
              <span>{decision.outcome ? t("detail.update_retro", "Update Retrospective") : t("detail.log_retro", "Log Retrospective Outcome")}</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartDeliberation}
            disabled={deliberating}
            className="btn-primary"
            style={{ padding: "9px 20px", fontSize: "0.88rem" }}
          >
            {deliberating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t("detail.deliberating", "Advisors Are Reviewing...")}</span>
              </>
            ) : isCompleted ? (
              <>
                <Sparkles size={16} />
                <span>{t("detail.reconvene", "Re-Convene Board")}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{t("detail.convene_boardroom", "Convene Boardroom")}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "10px",
          background: "rgba(244, 63, 94, 0.15)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          color: "#fda4af",
          fontSize: "0.9rem",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      {/* Mode Switcher: Executive Summary vs Interactive Deep Dive */}
      {isCompleted && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          padding: "8px 12px",
          borderRadius: "14px",
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => setActiveTab("executive-brief")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "executive-brief" ? "var(--accent-primary)" : "transparent",
                color: activeTab === "executive-brief" ? "#ffffff" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: activeTab === "executive-brief" ? "0 0 15px rgba(99, 102, 241, 0.4)" : "none"
              }}
            >
              <FileText size={16} />
              <span>Executive Brief (10-Sec Read)</span>
            </button>

            <button
              onClick={() => setActiveTab("boardroom-deepdive")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "10px",
                background: activeTab === "boardroom-deepdive" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                border: activeTab === "boardroom-deepdive" ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent",
                color: activeTab === "boardroom-deepdive" ? "#a5b4fc" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <Radio size={16} color={activeTab === "boardroom-deepdive" ? "#a5b4fc" : "var(--text-muted)"} />
              <span>Interactive Boardroom & Deep Dive</span>
            </button>
          </div>

          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            <span>6 AI Advisors Synchronized</span>
          </div>
        </div>
      )}

      {/* Decision Summary Card */}
      <div className="glass-card" style={{ padding: "24px 28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "0.74rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "3px 8px",
            borderRadius: "6px",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "var(--accent-primary)"
          }}>
            {decision.category}
          </span>

          <span style={{
            fontSize: "0.74rem",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "6px",
            background: isCompleted ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
            border: `1px solid ${isCompleted ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
            color: isCompleted ? "#34d399" : "#fbbf24"
          }}>
            {isCompleted ? t("detail.verdict_rendered", "Recommendation Ready") : t("detail.awaiting", "Waiting for Advice")}
          </span>

          <span style={{
            fontSize: "0.74rem",
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: "6px",
            background: "rgba(255, 255, 255, 0.04)",
            color: "var(--text-muted)"
          }}>
            {t("detail.urgency", "Urgency")}: <strong style={{ color: "#ffffff" }}>{decision.urgency}</strong>
          </span>

          <span style={{
            fontSize: "0.74rem",
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: "6px",
            background: "rgba(255, 255, 255, 0.04)",
            color: "var(--text-muted)"
          }}>
            {t("detail.risk_profile", "Risk Profile")}: <strong style={{ color: "#ffffff" }}>{decision.risk_tolerance}</strong>
          </span>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px", letterSpacing: "-0.02em" }}>
          {decision.title}
        </h1>

        <p style={{ fontSize: "0.92rem", color: "#94a3b8", lineHeight: "1.5", marginBottom: "16px" }}>
          {decision.description}
        </p>

        {/* Options Compact Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
          {decision.options?.map((opt, idx) => (
            <div
              key={opt.id || idx}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(10, 16, 30, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.06)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <span style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "var(--accent-primary)",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                  {opt.title || opt.label || `Option ${String.fromCharCode(65 + idx)}`}
                </h4>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.3" }}>
                {opt.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main View Container */}
      {isCompleted ? (
        activeTab === "executive-brief" ? (
          /* ============================================================
             1. EXECUTIVE BRIEF MODE (Clean, human-friendly 10-sec read)
             ============================================================ */
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <DecisionReportView report={report} decision={decision} isExecutiveBrief={true} onExploreDeepDive={() => setActiveTab("boardroom-deepdive")} />
          </div>
        ) : (
          /* ============================================================
             2. INTERACTIVE BOARDROOM & DEEP DIVE MODE
             ============================================================ */
          <div>
            {/* Boardroom Session Arena with Live Debate Simulation */}
            <div style={{ marginBottom: "24px" }}>
              <BoardroomView report={report} decision={decision} isDeliberating={deliberating} />
            </div>

            {/* Deep Dive Sub-Tabs Navigation */}
            <div style={{
              display: "flex",
              gap: "8px",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "12px",
              marginBottom: "24px",
              overflowX: "auto"
            }}>
              {[
                { id: "full-report", label: "Full Decision Dossier", icon: FileText },
                { id: "opinions", label: t("detail.tab_opinions", "Individual Advisor Scorecards"), icon: Users },
                { id: "debate", label: t("detail.tab_debate", "Advisor Discussion"), icon: MessageSquare },
                { id: "redteam", label: "Devil's Advocate Red-Team", icon: Flame },
                { id: "chat", label: t("detail.tab_chat", "Debrief The Board (Q&A)"), icon: Bot },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = (activeTab === tab.id) || (activeTab === "boardroom-deepdive" && tab.id === "full-report");
                const isRedTeam = tab.id === "redteam";
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "none",
                      background: "transparent",
                      color: isActive ? "#ffffff" : "var(--text-secondary)",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      position: "relative",
                      zIndex: 2,
                      transition: "color 0.15s ease"
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="detail-tab-pill-deep"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "10px",
                          background: isRedTeam ? "rgba(244, 63, 94, 0.2)" : "rgba(99, 102, 241, 0.2)",
                          border: `1px solid ${isRedTeam ? "rgba(244, 63, 94, 0.5)" : "rgba(99, 102, 241, 0.45)"}`,
                          boxShadow: `0 0 15px ${isRedTeam ? "rgba(244, 63, 94, 0.3)" : "rgba(99, 102, 241, 0.3)"}`,
                          zIndex: -1
                        }}
                      />
                    )}
                    <TabIcon size={16} color={isActive ? (isRedTeam ? "#f43f5e" : "#a5b4fc") : "var(--text-muted)"} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Deep Dive Sub-Panes */}
            {(activeTab === "full-report" || activeTab === "boardroom-deepdive") && (
              <DecisionReportView report={report} decision={decision} isExecutiveBrief={false} />
            )}

            {activeTab === "opinions" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
                {report.deliberations?.map((delib) => (
                  <AgentCard key={delib.id} deliberation={delib} />
                ))}
              </div>
            )}

            {activeTab === "debate" && (
              <DebateTimeline debateTurns={report.debate_turns} />
            )}

            {activeTab === "redteam" && (
              <DevilsAdvocateChallenge decision={decision} report={report} />
            )}

            {activeTab === "chat" && (
              <InteractiveChat decisionId={decision.id} />
            )}
          </div>
        )
      ) : (
        /* Not deliberated yet banner */
        <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center", border: "1px solid rgba(99, 102, 241, 0.4)" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 30px rgba(99, 102, 241, 0.6)"
          }}>
            <Sparkles size={32} color="#ffffff" />
          </div>
          
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "8px" }}>
            {t("detail.board_standby", "The Board of Directors is Standing By")}
          </h3>
          <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", maxWidth: "560px", margin: "0 auto 24px", lineHeight: "1.6" }}>
            {t("detail.board_standby_desc", "Start the review to see how the CEO, CFO, CTO, Risk Analyst, Mentor, and Chairman look at your decision and compare the choices.")}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartDeliberation}
            disabled={deliberating}
            className="btn-primary"
            style={{ padding: "14px 32px", fontSize: "1rem" }}
          >
            {deliberating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t("detail.deliberating_6", "Six AI advisors are reviewing your choices...")}
              </>
            ) : (
              <>
                <Zap size={18} />
                {t("detail.convene_now", "Convene AI Board Meeting Now")}
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Outcome Logger Modal */}
      {showOutcomeModal && (
        <OutcomeLoggerModal
          decision={decision}
          onClose={() => setShowOutcomeModal(false)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
};

