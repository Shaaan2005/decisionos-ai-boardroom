import React, { useState } from "react";
import { api } from "../api/client";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { X, Award, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { playSubmitSound, playErrorSound, playClickSound } from "../utils/audioUtils";
import { useLanguage } from "../context/LanguageContext";

export const OutcomeLoggerModal = ({ decision, onClose, onSaved }) => {
  const { t } = useLanguage();
  const [actualChoice, setActualChoice] = useState(
    decision.outcome?.actual_choice || decision.options?.[0]?.label || ""
  );
  const [followUpPeriod, setFollowUpPeriod] = useState(decision.outcome?.follow_up_period || "3_months");
  const [satisfactionScore, setSatisfactionScore] = useState(decision.outcome?.satisfaction_score || 8);
  const [actualOutcome, setActualOutcome] = useState(decision.outcome?.actual_outcome_description || "");
  const [lessonsLearned, setLessonsLearned] = useState(decision.outcome?.lessons_learned || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actualOutcome.trim() || !lessonsLearned.trim()) {
      playErrorSound();
      setError("Please describe the realized outcome and lessons learned.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const outcomeData = {
        actual_choice: actualChoice,
        follow_up_period: followUpPeriod,
        satisfaction_score: parseInt(satisfactionScore),
        actual_outcome_description: actualOutcome,
        lessons_learned: lessonsLearned,
      };

      await api.recordOutcome(decision.id, outcomeData);
      playSubmitSound();

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      playErrorSound();
      setError(err.message || "Failed to record outcome");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="glass-card" 
        style={{
          width: "100%",
          maxWidth: "620px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "36px",
          background: "rgba(10, 16, 30, 0.96)",
          border: "1px solid rgba(99, 102, 241, 0.45)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(99, 102, 241, 0.3)"
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)"
            }}>
              <Award size={24} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
                {t("outcome.title", "Log Real-World Outcome")}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {t("outcome.subtitle", "Index lessons into ChromaDB Vector Memory")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "6px"
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: "1.5", marginBottom: "22px" }}>
          Recording retrospective reflections teaches your AI Board of Directors your authentic life patterns to elevate future strategic counsel.
        </p>

        {error && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fda4af",
            fontSize: "0.85rem",
            marginBottom: "18px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Chosen Option */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
              {t("outcome.choice_label", "Path / Option Actually Executed:")}
            </label>
            <select
              value={actualChoice}
              onChange={(e) => setActualChoice(e.target.value)}
              className="input-field"
            >
              {decision.options?.map((opt) => (
                <option key={opt.id} value={opt.label}>
                  {opt.label}
                </option>
              ))}
              <option value="Custom Alternative">Custom Alternative Path</option>
            </select>
          </div>

          {/* Follow-up Period & Satisfaction Score Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                {t("outcome.period_label", "Evaluation Horizon:")}
              </label>
              <select
                value={followUpPeriod}
                onChange={(e) => setFollowUpPeriod(e.target.value)}
                className="input-field"
              >
                <option value="1_month">1 Month Later</option>
                <option value="3_months">3 Months Later</option>
                <option value="6_months">6 Months Later</option>
                <option value="1_year">1 Year Later</option>
              </select>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                  {t("outcome.satisfaction_label", "Satisfaction Score:")}
                </label>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#f59e0b" }}>
                  {satisfactionScore}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={satisfactionScore}
                onChange={(e) => setSatisfactionScore(e.target.value)}
                style={{ width: "100%", marginTop: "8px", accentColor: "#f59e0b" }}
              />
            </div>
          </div>

          {/* Actual Outcome */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
              {t("outcome.outcome_label", "What Actually Happened? (Realized Outcomes & Results)")}
            </label>
            <textarea
              rows={3}
              value={actualOutcome}
              onChange={(e) => setActualOutcome(e.target.value)}
              placeholder="e.g. Onboarded smoothly, closed initial contracts, but base cash flow was tight for 2 months..."
              className="input-field"
            />
          </div>

          {/* Core Lessons Learned */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
              {t("outcome.lesson_label", "Core Takeaway for Future Board Meetings:")}
            </label>
            <textarea
              rows={3}
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              placeholder="e.g. High ownership always compounds skills faster, but negotiating an upfront cash bonus is non-negotiable..."
              className="input-field"
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              {t("outcome.close", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: "12px 24px" }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t("outcome.saving", "Embedding to Memory...")}
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{t("outcome.save", "Save & Index to Vector Memory")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
