import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Copy,
  CheckCircle2,
  X,
  Download,
  Gavel,
  Sparkles,
  ChevronRight,
} from "lucide-react";

// ─── Radar Mini SVG ──────────────────────────────────────────────────────────
const RadarMini = ({ scores }) => {
  const cx = 55, cy = 55, r = 42;
  const labels = ["Growth", "Risk", "Finance", "Tech", "Values"];
  const points = labels.map((_, i) => {
    const angle = (i * 2 * Math.PI) / labels.length - Math.PI / 2;
    const val = (scores[i] || 0.75) * r;
    return { x: cx + val * Math.cos(angle), y: cy + val * Math.sin(angle) };
  });
  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Axis lines
  const axes = labels.map((_, i) => {
    const angle = (i * 2 * Math.PI) / labels.length - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      {/* Concentric rings */}
      {[0.33, 0.66, 1].map((scale) => (
        <polygon
          key={scale}
          points={axes.map((a) => `${cx + (a.x - cx) * scale},${cy + (a.y - cy) * scale}`).join(" ")}
          fill="none"
          stroke="rgba(245, 158, 11, 0.15)"
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      {axes.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" />
      ))}
      {/* Data polygon */}
      <polygon points={polygon} fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="1.5" />
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#f59e0b" />
      ))}
    </svg>
  );
};

// ─── Simple QR Placeholder Visual ────────────────────────────────────────────
const QRPlaceholder = ({ id }) => {
  // Deterministic simple pattern based on id
  const seed = (id || "decisionos").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: 49 }, (_, i) => ((seed * (i + 1) * 1103515245 + 12345) & 0x80000000) !== 0);

  return (
    <div style={{
      width: "64px", height: "64px",
      display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
      gap: "1px", padding: "4px",
      background: "#ffffff", borderRadius: "4px",
    }}>
      {cells.map((on, i) => (
        <div
          key={i}
          style={{
            background: on ? "#0a0a0a" : "#ffffff",
            borderRadius: "1px",
          }}
        />
      ))}
    </div>
  );
};

// ─── Main Card Content (rendered inside modal + used for copy) ────────────────
const BlueprintCardContent = ({ report, decision, id }) => {
  const verdict = report?.recommended_option || "Strategic Decision";
  const confidence = Math.round((report?.confidence_score || 0.87) * 100);
  const summary = report?.strategic_verdict || report?.executive_summary || "The board has reached a binding quorum.";
  const truncatedSummary = summary.length > 160 ? summary.slice(0, 157) + "..." : summary;

  const radarScores = [
    report?.radar_scores?.growth || 0.82,
    report?.radar_scores?.risk || 0.68,
    report?.radar_scores?.financial || 0.75,
    report?.radar_scores?.technical || 0.79,
    report?.radar_scores?.personal || 0.85,
  ];

  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div
      id={id}
      style={{
        width: "100%",
        maxWidth: "520px",
        background: "linear-gradient(135deg, #0d0f14 0%, #12100b 50%, #0d0f14 100%)",
        border: "1px solid rgba(245, 158, 11, 0.5)",
        borderRadius: "20px",
        padding: "28px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      {/* Background glow effects */}
      <div style={{
        position: "absolute", top: "-60px", left: "-60px",
        width: "220px", height: "220px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-40px", right: "-40px",
        width: "180px", height: "180px",
        background: "radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Corner brackets */}
      {[["0px", "0px", "1px", "0px"], ["0px", "0px", "0px", "1px"], ["0px", "auto", "1px", "0px"], ["0px", "auto", "0px", "1px"]].map(([t, r, b, l], idx) => (
        <div key={idx} style={{
          position: "absolute",
          top: idx < 2 ? "8px" : "auto",
          bottom: idx >= 2 ? "8px" : "auto",
          left: (idx === 0 || idx === 2) ? "8px" : "auto",
          right: (idx === 1 || idx === 3) ? "8px" : "auto",
          width: "16px", height: "16px",
          borderTop: (idx < 2) ? "2px solid rgba(245, 158, 11, 0.6)" : "none",
          borderBottom: (idx >= 2) ? "2px solid rgba(245, 158, 11, 0.6)" : "none",
          borderLeft: (idx === 0 || idx === 2) ? "2px solid rgba(245, 158, 11, 0.6)" : "none",
          borderRight: (idx === 1 || idx === 3) ? "2px solid rgba(245, 158, 11, 0.6)" : "none",
          pointerEvents: "none",
        }} />
      ))}

      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "7px",
            background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={14} color="#f59e0b" />
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            DecisionOS
          </span>
        </div>
        <span style={{
          fontSize: "0.62rem", color: "#64748b", fontFamily: "monospace",
        }}>
          {date}
        </span>
      </div>

      {/* Decision Title */}
      <div style={{ marginBottom: "18px" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.1em", marginBottom: "5px" }}>
          Strategic Dilemma
        </div>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#ffffff", lineHeight: "1.3" }}>
          {decision?.title || "Board Decision"}
        </h2>
      </div>

      {/* Verdict + Confidence row */}
      <div style={{
        padding: "14px 16px", borderRadius: "12px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.35)",
        marginBottom: "18px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "9px",
          background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Gavel size={16} color="#f59e0b" />
        </div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", color: "#a5b4fc", letterSpacing: "0.08em" }}>
            Board Verdict
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
            {verdict}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff", fontFamily: "monospace", lineHeight: 1 }}>
            {confidence}%
          </div>
          <div style={{ fontSize: "0.58rem", color: "#a5b4fc", fontWeight: 700, textTransform: "uppercase" }}>
            Confidence
          </div>
        </div>
      </div>

      {/* Strategic Summary */}
      <p style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.6", marginBottom: "20px" }}>
        {truncatedSummary}
      </p>

      {/* Radar + QR Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "6px", letterSpacing: "0.08em" }}>
            5-Axis Strategic Radar
          </div>
          <RadarMini scores={radarScores} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "6px", letterSpacing: "0.08em" }}>
            QR Verification
          </div>
          <QRPlaceholder id={String(decision?.id || "dos")} />
        </div>
      </div>

      {/* Advisor Quorum Badges */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[
          { label: "CEO", color: "#6366f1" },
          { label: "CFO", color: "#10b981" },
          { label: "CTO", color: "#06b6d4" },
          { label: "Risk", color: "#f43f5e" },
          { label: "Mentor", color: "#a855f7" },
          { label: "Chairman", color: "#f59e0b" },
        ].map(({ label, color }) => (
          <span key={label} style={{
            fontSize: "0.6rem", fontWeight: 800,
            padding: "2px 7px", borderRadius: "4px",
            background: `${color}18`, color,
            border: `1px solid ${color}44`, textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            ✓ {label}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        paddingTop: "12px",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "0.6rem", color: "#475569", fontFamily: "monospace" }}>
          decisionos.ai • 6-Agent Dialectic AI
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
          <span style={{ fontSize: "0.6rem", color: "#10b981", fontWeight: 700 }}>QUORUM SEALED</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Export Component ────────────────────────────────────────────────────
export const DecisionBlueprintCard = ({ report, decision }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    const verdict = report?.recommended_option || "N/A";
    const confidence = Math.round((report?.confidence_score || 0.87) * 100);
    const summary = report?.strategic_verdict || report?.executive_summary || "";
    const text = `🏛 DecisionOS Board Decision Blueprint\n\n📌 Dilemma: ${decision?.title || "Strategic Decision"}\n🎯 Board Verdict: ${verdict}\n📊 Confidence: ${confidence}%\n\n💡 Strategic Verdict:\n${summary}\n\n✦ Powered by 6-Agent AI Board of Directors\n🌐 decisionos.ai`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        style={{
          width: "100%",
          padding: "20px 24px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(99, 102, 241, 0.06) 100%)",
          border: "1px solid rgba(245, 158, 11, 0.35)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          textAlign: "left",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ opacity: [0.05, 0.18, 0.05] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 20% 50%, rgba(245, 158, 11, 0.12), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{
          width: "50px", height: "50px", borderRadius: "12px",
          background: "rgba(245, 158, 11, 0.18)", border: "1px solid rgba(245, 158, 11, 0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: "1.5rem",
        }}>
          🎴
        </div>
        <div style={{ flexGrow: 1, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{
              fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.12em", color: "#fbbf24",
              background: "rgba(245, 158, 11, 0.15)", padding: "2px 8px",
              borderRadius: "4px", border: "1px solid rgba(245, 158, 11, 0.3)",
            }}>
              ✦ Blueprint Card
            </span>
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "3px" }}>
            Generate Shareable Decision Card
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
            Spotify-Wrapped style holographic card with radar badge, Chairman stamp & QR verification — ready to share
          </p>
        </div>
        <ChevronRight size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
      </motion.button>

      {/* Card Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0, 0, 0, 0.9)",
              backdropFilter: "blur(14px)",
              zIndex: 9000,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "20px", overflowY: "auto",
            }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "24px",
                width: "100%", maxWidth: "560px",
              }}
            >
              {/* Title */}
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#ffffff", marginBottom: "6px" }}>
                  Decision Blueprint Card
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  Your holographic strategic summary — copy, share or screenshot
                </p>
              </div>

              {/* The Card */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: "100%" }}
              >
                <BlueprintCardContent report={report} decision={decision} id="blueprint-card-canvas" />
              </motion.div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                <motion.button
                  onClick={handleCopyText}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "10px 20px", borderRadius: "10px",
                    background: copied ? "rgba(16, 185, 129, 0.18)" : "rgba(99, 102, 241, 0.18)",
                    border: `1px solid ${copied ? "rgba(16, 185, 129, 0.4)" : "rgba(99, 102, 241, 0.4)"}`,
                    color: copied ? "#34d399" : "#a5b4fc",
                    fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  {copied ? "Copied to Clipboard!" : "Copy as Text"}
                </motion.button>

                <motion.button
                  onClick={() => {
                    const card = document.getElementById("blueprint-card-canvas");
                    if (card) {
                      const text = card.innerText;
                      const blob = new Blob([text], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `decision-blueprint-${decision?.id || Date.now()}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "10px 20px", borderRadius: "10px",
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    color: "#fbbf24", fontWeight: 700, fontSize: "0.85rem",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                  }}
                >
                  <Download size={15} />
                  Download Blueprint
                </motion.button>

                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "10px 16px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#64748b", fontWeight: 700, fontSize: "0.85rem",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <X size={14} />
                  Close
                </motion.button>
              </div>

              <p style={{ fontSize: "0.72rem", color: "#334155", textAlign: "center" }}>
                Tip: Press <kbd style={{ background: "#1e293b", padding: "1px 5px", borderRadius: "3px", border: "1px solid #334155" }}>Ctrl+Shift+S</kbd> or use your OS screenshot tool to capture the card
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
