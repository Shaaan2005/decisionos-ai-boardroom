import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  ShieldAlert, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Award,
  Zap,
  Loader2,
  RefreshCw
} from "lucide-react";
import { playSubmitSound, playPopSound, playClickSound, playErrorSound } from "../utils/audioUtils";

/**
 * Devil's Advocate Red-Team Interrogation Engine
 * Puts user assumptions on trial by asking tough trade-off challenges and evaluating executive resolve.
 */
export const DevilsAdvocateChallenge = ({ decision, report }) => {
  const defaultQuestions = [
    {
      id: 1,
      tag: "Financial Runway Stress-Test",
      question: `If your capital runway drops 40% faster than projected under '${report?.recommended_option || "your choice"}', at what exact milestone do you trigger an exit or pivot?`,
      advisor: "CFO & Risk Analyst"
    },
    {
      id: 2,
      tag: "Pre-Mortem Failure Scenario",
      question: "Imagine it is 12 months from today and this decision completely failed. What was the single blind spot that everyone overlooked?",
      advisor: "Risk Analyst"
    },
    {
      id: 3,
      tag: "Opportunity Cost & Energy Burn",
      question: "What asymmetric growth opportunity or personal peace are you permanently forfeiting by committing to this path?",
      advisor: "CEO & Mentor"
    }
  ];

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputAnswer, setInputAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState({});
  const [completed, setCompleted] = useState(false);

  const currentQ = defaultQuestions[currentQIndex];

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!inputAnswer.trim() || evaluating) return;

    playClickSound();
    setEvaluating(true);

    const qId = currentQ.id;
    const ansText = inputAnswer;

    // Simulate smart Red-Team critique evaluation
    setTimeout(() => {
      playSubmitSound();
      const score = Math.min(96, Math.max(68, 70 + Math.round(ansText.length / 5)));
      
      const critique = ansText.length > 80
        ? "Robust defense. You have addressed the downside risk with measurable operational controls."
        : "Moderate defense. Ensure you establish hard numeric tripwires rather than relying on optimism.";

      setAnswers(prev => ({ ...prev, [qId]: ansText }));
      setEvaluations(prev => ({
        ...prev,
        [qId]: { score, critique }
      }));

      setInputAnswer("");
      setEvaluating(false);

      if (currentQIndex < defaultQuestions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        setCompleted(true);
      }
    }, 1000);
  };

  const handleReset = () => {
    playClickSound();
    setCurrentQIndex(0);
    setAnswers({});
    setEvaluations({});
    setInputAnswer("");
    setCompleted(false);
  };

  const averageResilience = Object.values(evaluations).length > 0
    ? Math.round(Object.values(evaluations).reduce((acc, curr) => acc + curr.score, 0) / Object.values(evaluations).length)
    : 85;

  return (
    <div className="rzp-card" style={{ padding: "32px", border: "1px solid rgba(244, 63, 94, 0.4)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "rgba(244, 63, 94, 0.2)",
            border: "1px solid rgba(244, 63, 94, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Flame size={24} color="#f43f5e" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>
              Devil's Advocate Red-Team Interrogation
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              High-pressure stress-testing to eliminate confirmation bias and validate decision conviction
            </p>
          </div>
        </div>

        {completed && (
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
            style={{ padding: "6px 14px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} />
            <span>Retake Interrogation</span>
          </button>
        )}
      </div>

      {!completed ? (
        <div>
          {/* Progress Tracker */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#f43f5e", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Challenge {currentQIndex + 1} of {defaultQuestions.length} • {currentQ.tag}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Question {currentQIndex + 1}/{defaultQuestions.length}
            </span>
          </div>

          {/* Question Box */}
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "24px",
              borderRadius: "12px",
              background: "rgba(244, 63, 94, 0.06)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              marginBottom: "20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <ShieldAlert size={18} color="#f43f5e" />
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#fda4af" }}>
                Interrogated by {currentQ.advisor}
              </span>
            </div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", lineHeight: "1.5" }}>
              "{currentQ.question}"
            </h4>
          </motion.div>

          {/* Input Response Form */}
          <form onSubmit={handleAnswerSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <textarea
              rows={4}
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              placeholder="State your mitigation strategy and contingency logic..."
              className="input-field"
              style={{ fontSize: "0.9rem", lineHeight: "1.5" }}
              required
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="submit"
                disabled={!inputAnswer.trim() || evaluating}
                className="btn-primary"
                style={{ padding: "10px 24px", fontSize: "0.9rem", background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)" }}
              >
                {evaluating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Red-Team Analyzing Resolve...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>Submit Defense & Next Challenge ➔</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Completed Summary Badge */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: "28px",
            borderRadius: "14px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            textAlign: "center"
          }}
        >
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Award size={28} color="#ffffff" />
          </div>

          <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#ffffff", marginBottom: "6px" }}>
            Red-Team Interrogation Survived!
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#e2e8f0", maxWidth: "600px", margin: "0 auto 18px", lineHeight: "1.5" }}>
            You have successfully defended your strategic rationale across all 3 adversarial failure modes.
          </p>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 20px",
            borderRadius: "10px",
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(16, 185, 129, 0.5)"
          }}>
            <span style={{ fontSize: "0.85rem", color: "#a7f3d0", fontWeight: 700 }}>Executive Resilience Score:</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#34d399", fontFamily: "var(--font-mono)" }}>
              {averageResilience}%
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
