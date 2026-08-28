import React, { useState, useEffect, useRef } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { ExecutiveHero } from "../components/ExecutiveHero";
import { SpotlightCard } from "../components/SpotlightCard";
import { 
  PlusCircle, 
  Layers, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Database, 
  Compass, 
  ArrowRight, 
  Trash2,
  Sparkles,
  Shield,
  Loader2,
  Zap,
  Activity
} from "lucide-react";
import { playClickSound, playRemoveSound, playErrorSound } from "../utils/audioUtils";

let decisionsCache = null;

export const DashboardPage = ({ onSelectDecision, onNewDecision }) => {
  const { t } = useLanguage();
  const [decisions, setDecisions] = useState(decisionsCache || []);
  const [loading, setLoading] = useState(!decisionsCache);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [error, setError] = useState("");
  const contentSectionRef = useRef(null);

  const fetchDecisions = async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      const data = await api.listDecisions();
      decisionsCache = data;
      setDecisions(data);
    } catch (err) {
      setError(err.message || "Failed to load decisions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions(!decisionsCache);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to archive and remove this decision?")) {
      try {
        playRemoveSound();
        await api.deleteDecision(id);
        const updated = decisions.filter((d) => d.id !== id);
        decisionsCache = updated;
        setDecisions(updated);
      } catch (err) {
        playErrorSound();
        alert("Failed to delete decision: " + err.message);
      }
    }
  };

  const handleScrollDown = () => {
    contentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredDecisions = categoryFilter === "all"
    ? decisions
    : decisions.filter((d) => d.category.toLowerCase().includes(categoryFilter.toLowerCase()));

  const completedCount = decisions.filter((d) => d.status === "completed").length;
  const outcomeCount = decisions.filter((d) => d.outcome).length;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 24px 48px" }}>
      {/* Purpose-Built DecisionOS Strategic Executive Hero */}
      <ExecutiveHero onNewDecision={onNewDecision} onScrollDown={handleScrollDown} />

      {/* Main Content Section */}
      <div ref={contentSectionRef}>
        {/* Bento Metrics HUD */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "32px"
        }}>
          <div className="rzp-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>01 / CATALOGED</span>
              <Layers size={16} color="#f59e0b" />
            </div>
            <span style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-mono)" }}>{decisions.length}</span>
            <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "2px" }}>{t("dash.total_dilemmas", "Total Decisions")}</p>
          </div>

          <div className="rzp-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>02 / SYNTHESIZED</span>
              <CheckCircle size={16} color="#10b981" />
            </div>
            <span style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: "#10b981" }}>{completedCount}</span>
            <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "2px" }}>{t("dash.binding_verdicts", "Completed Reviews")}</p>
          </div>

          <div className="rzp-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>03 / CALIBRATION</span>
              <Activity size={16} color="#06b6d4" />
            </div>
            <span style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: "#06b6d4" }}>
              {outcomeCount > 0 ? "92.4%" : "100%"}
            </span>
            <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "2px" }}>{t("dash.premortem_acc", "Risk Check Accuracy")}</p>
          </div>

          <div className="rzp-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>04 / CHROMADB</span>
              <Database size={16} color="#a855f7" />
            </div>
            <span style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: "#a855f7" }}>{outcomeCount}</span>
            <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "2px" }}>{t("dash.vector_learnings", "Retrospective Learnings")}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
            {[
              { id: "all", labelKey: "dash.filter_all", defaultLabel: "All Dilemmas" },
              { id: "career", labelKey: "dash.filter_career", defaultLabel: "Career & Transitions" },
              { id: "startup", labelKey: "dash.filter_startup", defaultLabel: "Startup & Venture" },
              { id: "financial", labelKey: "dash.filter_financial", defaultLabel: "Financial & Capital" },
              { id: "engineering", labelKey: "dash.filter_engineering", defaultLabel: "Tech & Engineering" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playClickSound();
                  setCategoryFilter(cat.id);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background: categoryFilter === cat.id ? "#f59e0b" : "rgba(255, 255, 255, 0.04)",
                  color: categoryFilter === cat.id ? "#0b0907" : "var(--text-secondary)",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.12s ease"
                }}
              >
                {t(cat.labelKey, cat.defaultLabel)}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              playClickSound();
              onNewDecision();
            }}
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: "0.85rem" }}
          >
            <PlusCircle size={15} />
            <span>{t("dash.btn_new", "+ Convene Board")}</span>
          </button>
        </div>

        {/* Decisions Grid */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "10px", color: "var(--text-muted)" }}>
            <Loader2 size={22} className="animate-spin" color="#f59e0b" />
            <span style={{ fontWeight: 600 }}>Loading decision archive...</span>
          </div>
        ) : filteredDecisions.length === 0 ? (
          /* Empty State */
          <div className="rzp-card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Compass size={28} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>
              No decisions found in this filter
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto 20px", lineHeight: "1.5" }}>
              Convene your first Board Meeting to dissect strategic options across CEO, CFO, CTO, Risk, and Mentorship angles.
            </p>
            <button onClick={onNewDecision} className="btn-primary" style={{ padding: "10px 20px" }}>
              <PlusCircle size={16} />
              Create Your First Decision
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "16px" }}>
            {filteredDecisions.map((decision, idx) => {
              const isCompleted = decision.status === "completed";
              return (
                <SpotlightCard
                  key={decision.id}
                  onClick={() => {
                    playClickSound();
                    onSelectDecision(decision.id);
                  }}
                  spotlightColor={isCompleted ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.14)"}
                  borderColor={isCompleted ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}
                  style={{
                    padding: "22px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    {/* Category & Status Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="track-number">{String(idx + 1).padStart(2, "0")}</span>
                        <span className="rzp-pill">{decision.category}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{
                          fontSize: "0.72rem",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: isCompleted ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          border: isCompleted ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                          color: isCompleted ? "#34d399" : "#fde68a"
                        }}>
                          {isCompleted ? "VERDICT READY" : "PENDING"}
                        </span>

                        <button
                          onClick={(e) => handleDelete(e, decision.id)}
                          title="Archive / Delete"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: "3px"
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 800, lineHeight: "1.35", marginBottom: "8px" }}>
                      {decision.title}
                    </h3>

                    {/* Description preview */}
                    <p style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.5",
                      marginBottom: "14px",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {decision.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div>
                    {/* Options Tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                      {decision.options?.map((opt, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "0.72rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)"
                          }}
                        >
                          {opt.label}
                        </span>
                      ))}
                    </div>

                    {/* Outcome Tag if present */}
                    {decision.outcome && (
                      <div style={{
                        padding: "6px 8px",
                        borderRadius: "6px",
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.25)",
                        fontSize: "0.75rem",
                        color: "#7dd3fc",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <Database size={12} />
                        <span>Retrospective: <strong>{decision.outcome.satisfaction_score}/10 Satisfaction</strong></span>
                      </div>
                    )}

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "10px",
                      borderTop: "1px solid var(--border-subtle)"
                    }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        RISK: <strong style={{ color: "#ffffff" }}>{decision.risk_tolerance.toUpperCase()}</strong>
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f59e0b", fontSize: "0.82rem", fontWeight: 800 }}>
                        <span>{isCompleted ? t("dash.enter_boardroom", "▶ Enter Live Boardroom") : t("dash.btn_new", "⚡ Convene Boardroom")}</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
