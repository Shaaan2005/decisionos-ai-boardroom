import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const BuildathonPreloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [scrambleText, setScrambleText] = useState("a8x9q2k0");
  const [timeStr, setTimeStr] = useState("18:55");

  // Live time
  useEffect(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    setTimeStr(`${h}:${m}`);
  }, []);

  // Hash scrambling effect
  useEffect(() => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const scrambleInterval = setInterval(() => {
      let result = "";
      for (let i = 0; i < 9; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setScrambleText(result);
    }, 60);

    return () => clearInterval(scrambleInterval);
  }, []);

  // Progress counter from 000% to 100%
  useEffect(() => {
    const duration = 1800; // 1.8 seconds total
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0a0806",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "36px 48px",
        color: "#f5f0e8",
        fontFamily: "'JetBrains Mono', 'Satoshi', monospace",
        userSelect: "none"
      }}
    >
      {/* Top Spacer */}
      <div />

      {/* Center Scramble / Boot Console */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px"
        }}>
          <span style={{ color: "#ffffff" }}>decisionos</span>
          <span style={{ color: "#f59e0b" }}>/</span>
          <span style={{ color: "#d97706", fontFamily: "var(--font-mono)" }}>
            {progress >= 90 ? "boardroom" : scrambleText}
          </span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ color: "#786f65", marginLeft: "2px", fontWeight: 300 }}
          >
            |
          </motion.span>
        </div>

        {/* Sub-label Tailored to DecisionOS */}
        <p style={{
          fontSize: "0.76rem",
          letterSpacing: "0.22em",
          color: "#786f65",
          marginTop: "16px",
          textTransform: "uppercase",
          fontWeight: 600
        }}>
          E X E C U T I V E &nbsp; B O A R D R O O M &nbsp; · &nbsp; {timeStr}
        </p>
      </div>

      {/* Bottom Row with 037% Counter */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        fontSize: "0.85rem",
        fontFamily: "var(--font-mono)",
        color: "#786f65",
        fontWeight: 600,
        letterSpacing: "0.05em"
      }}>
        <span>{String(progress).padStart(3, "0")}%</span>
      </div>
    </motion.div>
  );
};
