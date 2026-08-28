import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Power } from "lucide-react";
import { playBootSound, playProgressTick, playProgressCompleteSound, unlockAudio } from "../utils/audioUtils";

export const DecisionOSBootLoader = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrambleHash, setScrambleHash] = useState("x8k2m9v4");
  const [activeStep, setActiveStep] = useState("INITIALIZING MULTI-AGENT ADVISORY KERNEL");
  const [isReady, setIsReady] = useState(false);
  const completedRef = useRef(false);

  const completeBoot = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    playBootSound();
    if (onComplete) onComplete();
  };

  const bootStages = [
    { threshold: 0, text: "INITIALIZING MULTI-AGENT ADVISORY KERNEL" },
    { threshold: 20, text: "MOUNTING PERSONA: CEO STRATEGY ENGINE" },
    { threshold: 38, text: "CALIBRATING CFO FINANCIAL RUNWAY MODEL" },
    { threshold: 55, text: "SYNCING CTO TECH VELOCITY ARCHITECTURE" },
    { threshold: 88, text: "CONNECTING CHROMADB VECTOR MEMORY VAULT" },
    { threshold: 96, text: "SUMMONING CHAIRMAN OF THE BOARD" }
  ];

  // Start 0->100 sequence when triggered with audio
  const startBootSequence = () => {
    if (hasStarted) return;
    unlockAudio();
    setHasStarted(true);
  };

  // Initial Key / Click listener to start calibration with audio
  useEffect(() => {
    if (hasStarted) return;

    const handleInitialTrigger = () => {
      startBootSequence();
    };

    window.addEventListener("keydown", handleInitialTrigger);
    window.addEventListener("click", handleInitialTrigger);
    window.addEventListener("touchstart", handleInitialTrigger);

    return () => {
      window.removeEventListener("keydown", handleInitialTrigger);
      window.removeEventListener("click", handleInitialTrigger);
      window.removeEventListener("touchstart", handleInitialTrigger);
    };
  }, [hasStarted]);

  // Short calibration keeps the branded entry without delaying access.
  useEffect(() => {
    if (!hasStarted) return;
    unlockAudio();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const totalDuration = prefersReducedMotion ? 0 : 1600;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = totalDuration === 0 ? 1 : Math.min(1, elapsed / totalDuration);
      
      let easePct;
      if (rawPct < 0.3) {
        easePct = (rawPct / 0.3) * 0.35;
      } else if (rawPct < 0.7) {
        easePct = 0.35 + ((rawPct - 0.3) / 0.4) * 0.45;
      } else {
        easePct = 0.80 + ((rawPct - 0.7) / 0.3) * 0.20;
      }

      const currentInt = Math.min(100, Math.floor(easePct * 100));
      setProgress(currentInt);
      playProgressTick(currentInt);

      const currentStage = [...bootStages].reverse().find(s => currentInt >= s.threshold);
      if (currentStage) {
        setActiveStep(currentStage.text);
      }

      if (rawPct >= 1) {
        clearInterval(interval);
        playProgressCompleteSound();
        setProgress(100);
        completeBoot();
      }
    }, 20);

    return () => clearInterval(interval);
  }, [hasStarted]);

  // Final "Press Any Key to Begin" Event Listeners once ready
  useEffect(() => {
    if (!isReady) return;

    const handleBegin = () => {
      completeBoot();
    };

    window.addEventListener("keydown", handleBegin);
    window.addEventListener("click", handleBegin);
    window.addEventListener("touchstart", handleBegin);

    return () => {
      window.removeEventListener("keydown", handleBegin);
      window.removeEventListener("click", handleBegin);
      window.removeEventListener("touchstart", handleBegin);
    };
  }, [isReady, onComplete]);

  // Rapid Hashing Scramble Loop
  useEffect(() => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
    const scrambleInterval = setInterval(() => {
      let result = "";
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setScrambleHash(result);
    }, 45);

    return () => clearInterval(scrambleInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(4px)", transition: { duration: 0.35, ease: "easeOut" } }}
      onClick={() => {
        if (!hasStarted) {
          startBootSequence();
        } else {
          completeBoot();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#080604",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "36px 48px",
        color: "#f5f0e8",
        fontFamily: "'JetBrains Mono', 'Satoshi', monospace",
        userSelect: "none",
        cursor: isReady ? "pointer" : "default",
        overflow: "hidden"
      }}
    >
      {/* Background Ambient Glow */}
      <motion.div
        animate={{
          opacity: isReady ? [0.28, 0.5, 0.28] : hasStarted ? [0.22, 0.4, 0.22] : [0.15, 0.3, 0.15],
          scale: isReady ? [1, 1.12, 1] : [0.95, 1.05, 0.95]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(245, 158, 11, 0.22) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(50px)"
        }}
      />

      {/* Top Header Row */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.76rem",
        color: "var(--text-muted)",
        letterSpacing: "0.1em"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isReady ? "#10b981" : hasStarted ? "#f59e0b" : "#786f65",
            boxShadow: isReady ? "0 0 12px #10b981" : hasStarted ? "0 0 10px #f59e0b" : "none",
            transition: "all 0.3s ease"
          }} />
          <span style={{ color: "#b5aba1", fontWeight: 700 }}>
            {isReady ? "SYS.STATUS: QUORUM_ACTIVE" : hasStarted ? "SYS.BOOT_SEQUENCE // V1.0" : "SYS.STANDBY // V1.0"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontFamily: "var(--font-mono)" }}>
          <span>MEMORY_VAULT: CHROMADB</span>
          <button
            type="button"
            aria-label="Skip system boot sequence"
            onClick={(e) => {
              e.stopPropagation();
              playBootSound();
              if (onComplete) onComplete();
            }}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#fbbf24",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Skip ➔
          </button>
        </div>
      </div>

      {/* Center Console */}
      <div style={{
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {/* Main Title Wordmark */}
        <div style={{
          fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          marginBottom: "10px"
        }}>
          <span style={{ color: "#ffffff" }}>decisionos</span>
          <span style={{ color: "#f59e0b", padding: "0 2px" }}>/</span>
          <span style={{
            color: isReady ? "#f59e0b" : hasStarted ? "#f59e0b" : "#ea580c",
            transition: "color 0.2s ease"
          }}>
            {isReady ? "boardroom" : hasStarted ? scrambleHash : "standby"}
          </span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ color: "#f59e0b", marginLeft: "4px", fontWeight: 400 }}
          >
            _
          </motion.span>
        </div>

        {/* State 1: Prompt to Initialize */}
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ marginTop: "24px" }}
          >
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7], y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 28px",
                borderRadius: "8px",
                background: "rgba(245, 158, 11, 0.16)",
                border: "1px solid rgba(245, 158, 11, 0.5)",
                color: "#fef08a",
                fontSize: "0.92rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                boxShadow: "0 0 30px rgba(245, 158, 11, 0.3)"
              }}
            >
              <Power size={18} color="#f59e0b" />
              <button
                type="button"
                aria-label="Start DecisionOS boot sequence"
                onMouseDown={(event) => {
                  event.stopPropagation();
                  startBootSequence();
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  startBootSequence();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  startBootSequence();
                }}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "inherit",
                  font: "inherit",
                  cursor: "pointer",
                  padding: 0,
                  position: "relative",
                  zIndex: 10,
                  pointerEvents: "auto"
                }}
              >
                CLICK OR PRESS ANY KEY TO INITIALIZE
              </button>
              <ArrowRight size={18} color="#f59e0b" />
            </motion.div>
          </motion.div>
        )}

        {/* State 2 & 3: Loading Progress & Animated Yellow Smiley + Press Any Key to Begin */}
        {hasStarted && (
          <div>
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                fontSize: "0.82rem",
                letterSpacing: "0.18em",
                color: "#b5aba1",
                textTransform: "uppercase",
                fontWeight: 700,
                marginTop: "12px",
                minHeight: "22px"
              }}
            >
              {isReady ? "QUORUM CONVENED // ALL ADVISORS READY" : activeStep}
            </motion.div>

            {/* Progress Bar */}
            {!isReady && (
              <div style={{
                width: "280px",
                height: "4px",
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "4px",
                margin: "24px auto 0",
                overflow: "hidden"
              }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #ea580c, #f59e0b)",
                    boxShadow: "0 0 14px #f59e0b",
                    borderRadius: "4px",
                    transition: "width 0.05s linear"
                  }}
                />
              </div>
            )}

            {/* Animated Yellow Smile + PRESS ANY KEY TO BEGIN */}
            <AnimatePresence>
              {isReady && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, y: 12 }}
                  animate={{ opacity: 1, scale: [0.6, 1.12, 1], y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "20px"
                  }}
                >
                  <svg
                    width="68"
                    height="68"
                    viewBox="0 0 68 68"
                    fill="none"
                    style={{
                      filter: "drop-shadow(0 0 18px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 32px rgba(245, 158, 11, 0.55))"
                    }}
                  >
                    {/* Glowing Face Circle Outline */}
                    <motion.circle
                      cx="34"
                      cy="34"
                      r="30"
                      stroke="#fbbf24"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, rotate: -90 }}
                      animate={{ pathLength: 1, rotate: 0 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                    />

                    {/* Left Eye */}
                    <motion.circle
                      cx="23"
                      cy="26"
                      r="3.5"
                      fill="#fbbf24"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      transition={{ delay: 0.15, duration: 0.25 }}
                    />

                    {/* Right Eye (Playful Wink / Blink) */}
                    <motion.path
                      d="M41 26 Q45 22 49 26"
                      stroke="#fbbf24"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.2, duration: 0.25 }}
                    />

                    {/* Animated Warm Smile Arc */}
                    <motion.path
                      d="M20 38 Q34 52 48 38"
                      stroke="#f59e0b"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.25, duration: 0.35, ease: "easeOut" }}
                    />
                  </svg>

                  {/* Pulsing "PRESS ANY KEY TO BEGIN" Prompt */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                    style={{ marginTop: "16px" }}
                  >
                    <motion.div
                      animate={{ opacity: [0.75, 1, 0.75], scale: [0.98, 1.02, 0.98] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 24px",
                        borderRadius: "8px",
                        background: "rgba(245, 158, 11, 0.18)",
                        border: "1px solid rgba(245, 158, 11, 0.6)",
                        color: "#fef08a",
                        fontSize: "0.9rem",
                        fontWeight: 900,
                        letterSpacing: "0.14em",
                        boxShadow: "0 0 28px rgba(245, 158, 11, 0.35)"
                      }}
                    >
                      <Sparkles size={16} color="#f59e0b" />
                      <button
                        type="button"
                        aria-label="Open DecisionOS boardroom"
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          completeBoot();
                        }}
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          completeBoot();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          completeBoot();
                        }}
                        style={{
                          border: 0,
                          background: "transparent",
                          color: "inherit",
                          font: "inherit",
                          cursor: "pointer",
                          padding: 0,
                          position: "relative",
                          zIndex: 10,
                          pointerEvents: "auto"
                        }}
                      >
                        PRESS ANY KEY TO BEGIN
                      </button>
                      <ArrowRight size={16} color="#f59e0b" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {( !hasStarted || isReady) && (
        <button
          type="button"
          aria-label={isReady ? "Open DecisionOS boardroom" : "Start DecisionOS boot sequence"}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (isReady) completeBoot();
            else startBootSequence();
          }}
          onClick={() => (isReady ? completeBoot() : startBootSequence())}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "420px",
            maxWidth: "80vw",
            height: "90px",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            border: 0,
            background: "transparent",
            cursor: "pointer"
          }}
        />
      )}

      {/* Bottom Footer Row */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.88rem",
        fontFamily: "var(--font-mono)",
        color: "#786f65",
        fontWeight: 700
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span>6 ADVISORS CONVENED</span>
          <span>•</span>
          <span style={{ color: isReady ? "#10b981" : hasStarted ? "#f59e0b" : "#786f65" }}>
            {isReady ? "SYSTEM READY" : hasStarted ? "CALIBRATING" : "STANDBY"}
          </span>
        </div>

        {/* Counter */}
        <div style={{
          fontSize: "1.15rem",
          color: isReady ? "#10b981" : hasStarted ? "#f59e0b" : "#b5aba1",
          fontWeight: 800,
          letterSpacing: "0.05em"
        }}>
          <span>{String(progress).padStart(3, "0")}%</span>
        </div>
      </div>
    </motion.div>
  );
};
