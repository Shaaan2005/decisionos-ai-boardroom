import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  DollarSign, 
  Cpu, 
  ShieldAlert, 
  HeartHandshake, 
  Gavel, 
  Sparkles,
  Radio,
  FileText,
  Printer,
  Download,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX
} from "lucide-react";
import { 
  playVerdictSound, 
  playClickSound, 
  playPopSound, 
  playTypingSound,
  playAgentTurnSound 
} from "../utils/audioUtils";
import { speakPersonaText, stopSpeech } from "../utils/speechUtils";
import { downloadDecisionMarkdown, exportDecisionToPDF } from "../utils/exportUtils";
import { useLanguage } from "../context/LanguageContext";
import { HolographicBoardroomTable } from "./HolographicBoardroomTable";

export const BoardroomView = ({ report, decision, isDeliberating }) => {
  const { t } = useLanguage();
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 1.5x, 2x
  const [currentConsensus, setCurrentConsensus] = useState(55);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [typedChars, setTypedChars] = useState({}); // { [agentIndex]: charCount }

  const agents = [
    {
      id: "CEO",
      name: "CEO Advisor",
      title: "Chief Executive Officer",
      role: "Strategy & Compounding Vision",
      icon: Briefcase,
      color: "#6366f1",
      glowColor: "rgba(99, 102, 241, 0.4)",
      badge: "High Growth",
      desc: "Maximizes compounding leverage, asymmetric upside & market positioning."
    },
    {
      id: "CFO",
      name: "CFO Advisor",
      title: "Chief Financial Officer",
      role: "Financial ROI & Runway Defense",
      icon: DollarSign,
      color: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.4)",
      badge: "Capital Discipline",
      desc: "Preserves liquid runway, stress-tests risk-adjusted compensation & downside burn."
    },
    {
      id: "CTO",
      name: "CTO Advisor",
      title: "Chief Technology Officer",
      role: "Architecture & Skills Velocity",
      icon: Cpu,
      color: "#06b6d4",
      glowColor: "rgba(6, 182, 212, 0.4)",
      badge: "Tech Velocity",
      desc: "Accelerates technical architecture mastery and prevents skill obsolescence."
    },
    {
      id: "Risk Analyst",
      name: "Risk Analyst",
      title: "Chief Risk Officer",
      role: "Pre-Mortem & Safeguards",
      icon: ShieldAlert,
      color: "#f43f5e",
      glowColor: "rgba(244, 63, 94, 0.4)",
      badge: "Downside Protection",
      desc: "Identifies systemic failure modes and installs mandatory 90-day execution tripwires."
    },
    {
      id: "Mentor",
      name: "Mentor Advisor",
      title: "Personal Life Mentor",
      role: "Authentic Values & Stamina",
      icon: HeartHandshake,
      color: "#a855f7",
      glowColor: "rgba(168, 85, 247, 0.4)",
      badge: "Values & Life",
      desc: "Anchors to authentic career principles, psychological stamina & past lessons."
    },
    {
      id: "Chairman",
      name: "Chairman of the Board",
      title: "Executive Arbiter",
      role: "Consensus & Binding Verdict",
      icon: Gavel,
      color: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.4)",
      badge: "Strategic Gavel",
      desc: "Reconciles conflicting perspectives and issues the unified board directive."
    }
  ];

  const finalConsensusScore = report?.consensus_score || 88;
  const activeAgent = agents[activeAgentIndex];

  const delibData = report?.deliberations?.find(
    (d) => (d?.agent_name || d?.role || "").toLowerCase().includes(activeAgent.id.toLowerCase())
  );

  const fullAnalysisText = delibData?.analysis || 
    "Evaluating strategic trade-offs, financial runway preservation, and long-term execution velocity across all board directives...";

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFinalVerdict, setShowFinalVerdict] = useState(false);

  // Play crisp entrance sound & voice when active agent changes
  useEffect(() => {
    if (voiceEnabled && fullAnalysisText) {
      setIsSpeaking(true);
      speakPersonaText(fullAnalysisText, activeAgent.id, {
        speedMultiplier,
        langCode: "en",
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    } else {
      setIsSpeaking(false);
    }

    if (soundEnabled && (isSimulating || isDeliberating)) {
      playAgentTurnSound(activeAgent.id);
    }

    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  }, [activeAgentIndex, isSimulating, isDeliberating, soundEnabled, voiceEnabled, speedMultiplier, fullAnalysisText, activeAgent.id]);

  // Turn-by-Turn Typewriter Loop for Spotlight Panel
  useEffect(() => {
    if (!isSimulating && !isDeliberating) return;

    const currentCount = typedChars[activeAgentIndex] || 0;

    if (currentCount < fullAnalysisText.length) {
      // Calculate delay: if voice is enabled, type at realistic speech cadence (~28ms/char); otherwise ~16ms/char
      const baseDelay = voiceEnabled ? 28 : 16;
      const charDelay = baseDelay / speedMultiplier;
      const timer = setTimeout(() => {
        const nextCount = Math.min(fullAnalysisText.length, currentCount + 2);
        setTypedChars(prev => ({ ...prev, [activeAgentIndex]: nextCount }));

        if (soundEnabled && nextCount % 6 === 0) {
          playTypingSound();
        }
      }, charDelay);

      return () => clearTimeout(timer);
    } else {
      // If voice is ON and advisor is still speaking, WAIT for speech to finish before advancing!
      if (voiceEnabled && isSpeaking) {
        return;
      }

      // Check if this was the final advisor (Chairman)
      if (activeAgentIndex >= agents.length - 1) {
        const finishTimer = setTimeout(() => {
          setIsSimulating(false);
          setShowFinalVerdict(true);
          setCurrentConsensus(finalConsensusScore);
          if (soundEnabled) {
            playVerdictSound();
          }
        }, 1200 / speedMultiplier);

        return () => clearTimeout(finishTimer);
      }

      // Transition to next agent with natural breathing pause
      const transitionTimer = setTimeout(() => {
        if (soundEnabled) playPopSound();

        // Increment consensus index
        setCurrentConsensus((prevCons) => {
          const step = Math.ceil((finalConsensusScore - prevCons) / (agents.length - activeAgentIndex + 1));
          return Math.min(finalConsensusScore, prevCons + Math.max(3, step));
        });

        setActiveAgentIndex((prev) => prev + 1);
      }, (voiceEnabled ? 1600 : 1200) / speedMultiplier);

      return () => clearTimeout(transitionTimer);
    }
  }, [isSimulating, isDeliberating, activeAgentIndex, typedChars, fullAnalysisText, speedMultiplier, soundEnabled, voiceEnabled, isSpeaking, agents.length, finalConsensusScore]);

  // Manual Trigger to Speak or Stop Current Advisor Analysis
  const toggleAdvisorVoice = () => {
    playClickSound();
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakPersonaText(fullAnalysisText, activeAgent.id, {
        speedMultiplier,
        langCode: "en",
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
  };

  // Toggle Live Simulation
  const toggleSimulation = () => {
    playClickSound();
    if (!isSimulating) {
      setTypedChars({});
      setActiveAgentIndex(0);
      setShowFinalVerdict(false);
      setCurrentConsensus(55);
      setIsSimulating(true);
    } else {
      setIsSimulating(false);
      // Notice: Do NOT abruptly stop speech if voiceEnabled is true so the user can continue listening while paused!
    }
  };

  // Restart Simulation
  const restartSimulation = () => {
    playClickSound();
    stopSpeech();
    setIsSpeaking(false);
    setTypedChars({});
    setActiveAgentIndex(0);
    setShowFinalVerdict(false);
    setCurrentConsensus(55);
    setIsSimulating(true);
  };


  // Play verdict gong on arrival
  const prevReportRef = useRef(null);
  useEffect(() => {
    if (report && !prevReportRef.current) {
      playVerdictSound();
    }
    prevReportRef.current = report;
  }, [report]);

  const displayedText = (isSimulating || isDeliberating)
    ? fullAnalysisText.slice(0, typedChars[activeAgentIndex] || 0)
    : fullAnalysisText;

  const isTyping = (isSimulating || isDeliberating) && (typedChars[activeAgentIndex] || 0) < fullAnalysisText.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-card" 
      style={{ padding: "32px", position: "relative", overflow: "hidden" }}
    >
      {/* Background Holographic Glow */}
      <div style={{
        position: "absolute",
        top: "-80px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "500px",
        height: "250px",
        background: `radial-gradient(ellipse, ${activeAgent.color}30 0%, transparent 70%)`,
        pointerEvents: "none",
        transition: "all 0.6s ease"
      }} />

      {/* 3D Holographic Radial Spatial Boardroom Chamber */}
      <HolographicBoardroomTable
        activeAdvisorIndex={activeAgentIndex}
        onSelectAdvisor={(idx) => handleManualSelect(idx)}
        isDeliberating={isSimulating || isDeliberating}
        consensusScore={currentConsensus}
        verdictTitle={report?.synthesis?.recommended_option_title || decision?.title}
      />

      {/* Top Header Row with Status & Action Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", position: "relative", zIndex: 2, flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            position: "relative",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: isDeliberating || isSimulating ? "#06b6d4" : "#10b981",
            boxShadow: isDeliberating || isSimulating ? "0 0 15px #06b6d4" : "0 0 15px #10b981",
          }}>
            <motion.div
              animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: isDeliberating || isSimulating ? "#06b6d4" : "#10b981",
              }}
            />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
              {isSimulating ? `Advisor Review: ${activeAgent.name}...` : isDeliberating ? t("board.live_session", "Six AI advisors are reviewing your decision...") : t("board.title", "AI Decision Review")}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {t("board.dialectic", "Comparing the benefits, risks, costs, and long-term effects")}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={toggleSimulation}
            className="btn-primary"
            style={{
              padding: "7px 16px",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {isSimulating ? (
              <>
                <Pause size={15} />
                <span>{t("board.pause_debate", "Pause Debate")}</span>
              </>
            ) : (
              <>
                <Play size={15} />
                <span>{t("board.play_debate", "Play Live Debate")}</span>
              </>
            )}
          </button>

          {/* Replay From Start */}
          <button
            type="button"
            onClick={restartSimulation}
            className="btn-secondary"
            title={t("board.restart", "Restart debate from CEO")}
            style={{ padding: "7px 12px", fontSize: "0.82rem" }}
          >
            <RotateCcw size={14} />
          </button>

          {/* Speed Multiplier (1x, 1.5x, 2x) */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setSpeedMultiplier(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1);
            }}
            className="btn-secondary"
            title="Change playback speed"
            style={{ padding: "7px 12px", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#f59e0b" }}
          >
            {speedMultiplier}x
          </button>

          {/* Voice Narrator Toggle */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              if (voiceEnabled) stopSpeech();
              setVoiceEnabled(!voiceEnabled);
            }}
            className="btn-secondary"
            title={voiceEnabled ? "Mute Voice Speech" : "Enable Multi-Voice TTS"}
            style={{ 
              padding: "7px 12px", 
              fontSize: "0.82rem",
              background: voiceEnabled ? "rgba(99, 102, 241, 0.18)" : "transparent",
              border: `1px solid ${voiceEnabled ? "rgba(99, 102, 241, 0.4)" : "var(--border-subtle)"}`,
              color: voiceEnabled ? "#a5b4fc" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span style={{ fontSize: "0.9rem" }}>🎙️</span>
            <span style={{ fontWeight: 700 }}>{voiceEnabled ? "Voice ON" : "Voice OFF"}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setSoundEnabled(!soundEnabled);
            }}
            className="btn-secondary"
            title={soundEnabled ? "Mute Board Audio" : "Enable Board Audio"}
            style={{ padding: "7px 12px", fontSize: "0.82rem" }}
          >
            {soundEnabled ? <Volume2 size={15} color="#10b981" /> : <VolumeX size={15} color="var(--text-muted)" />}
          </button>

          {/* Export Markdown Memo */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              downloadDecisionMarkdown(decision, report);
            }}
            className="btn-secondary"
            title="Download Decision Memo Markdown"
            style={{ padding: "7px 14px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={14} />
            <span>{t("board.memo_md", "Memo (.md)")}</span>
          </button>

          {/* Print/Export PDF Memo */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              exportDecisionToPDF(decision, report);
            }}
            className="btn-primary"
            title="Print or Save Executive PDF Decision Memo"
            style={{ padding: "7px 16px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Printer size={14} />
            <span>{t("board.export_pdf", "Export PDF")}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Consensus Gauge Meter */}
      <div style={{
        padding: "14px 18px",
        borderRadius: "12px",
        background: "rgba(10, 16, 30, 0.85)",
        border: "1px solid var(--border-subtle)",
        marginBottom: "24px",
        position: "relative",
        zIndex: 2
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.82rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
            <Sparkles size={16} color="#f59e0b" />
            <span>Boardroom Consensus Index</span>
          </div>
          <div style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: currentConsensus >= 80 ? "#10b981" : "#f59e0b" }}>
            {currentConsensus}% {currentConsensus >= 80 ? "GOOD AGREEMENT" : "COMPARING ADVICE"}
          </div>
        </div>

        <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "6px", overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${currentConsensus}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              height: "100%",
              background: currentConsensus >= 80 
                ? "linear-gradient(90deg, #10b981, #34d399)" 
                : "linear-gradient(90deg, #f59e0b, #ea580c)",
              boxShadow: currentConsensus >= 80 ? "0 0 12px #10b981" : "0 0 12px #f59e0b",
              borderRadius: "6px"
            }}
          />
        </div>
      </div>

      {/* Boardroom Pods Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
        gap: "14px",
        marginBottom: "28px",
        position: "relative",
        zIndex: 2
      }}>
        {agents.map((agent, idx) => {
          const isSpeaking = activeAgentIndex === idx;
          const AgentIcon = agent.icon;
          const agentDelib = report?.deliberations?.find(
            (d) => (d?.agent_name || d?.role || "").toLowerCase().includes(agent.id.toLowerCase())
          );

          return (
            <motion.div
              key={agent.id}
              onClick={() => {
                if (soundEnabled) playAgentTurnSound(agent.id);
                else playClickSound();
                setActiveAgentIndex(idx);
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              animate={isSpeaking ? {
                scale: 1.05,
                boxShadow: `0 0 35px ${agent.glowColor}, inset 0 0 18px ${agent.color}20`,
                borderColor: agent.color
              } : {
                scale: 1.0,
                boxShadow: "0 0 0px transparent",
                borderColor: "rgba(255, 255, 255, 0.08)"
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              style={{
                position: "relative",
                padding: "18px 16px",
                borderRadius: "16px",
                background: isSpeaking ? "rgba(22, 33, 58, 0.95)" : "rgba(13, 20, 36, 0.65)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
                overflow: "hidden"
              }}
            >
              {/* Top Neon Accent Beam */}
              {isSpeaking && (
                <motion.div 
                  layoutId="accent-beam"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "10%",
                    right: "10%",
                    height: "3px",
                    background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
                    boxShadow: `0 0 15px ${agent.color}`
                  }} 
                />
              )}
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <motion.div 
                  animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${agent.color}30, ${agent.color}55)`,
                    border: `1px solid ${agent.color}88`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isSpeaking ? `0 0 20px ${agent.color}66` : "none"
                  }}
                >
                  <AgentIcon size={22} color={agent.color} />
                </motion.div>

                {isSpeaking ? (
                  /* Live Equalizer Animation */
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "18px" }}>
                    <div className="wave-bar-1" style={{ width: "3px", background: agent.color, borderRadius: "2px" }} />
                    <div className="wave-bar-2" style={{ width: "3px", background: agent.color, borderRadius: "2px" }} />
                    <div className="wave-bar-3" style={{ width: "3px", background: agent.color, borderRadius: "2px" }} />
                  </div>
                ) : (
                  <span style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "var(--text-muted)"
                  }}>
                    {agent.badge}
                  </span>
                )}
              </div>

              <h4 style={{ fontSize: "0.98rem", fontWeight: 800, color: "#ffffff", marginBottom: "2px" }}>
                {agent.name}
              </h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                {agent.role}
              </p>

              {agentDelib ? (
                <div style={{
                  padding: "6px 8px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  fontSize: "0.74rem",
                  color: "#e2e8f0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  Votes: <strong style={{ color: agent.color }}>{agentDelib.recommended_option}</strong>
                </div>
              ) : (
                <div style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.02)",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  fontStyle: "italic"
                }}>
                  Analyzing parameters...
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Active Speaker Spotlight Panel with Character-by-Character Typewriter Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAgent.id}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            background: "rgba(10, 16, 30, 0.94)",
            border: `1px solid ${activeAgent.color}77`,
            borderRadius: "16px",
            padding: "26px",
            position: "relative",
            boxShadow: `0 12px 35px -10px ${activeAgent.glowColor}`,
            zIndex: 2
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: activeAgent.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px ${activeAgent.color}`
              }}>
                {React.createElement(activeAgent.icon, { size: 24, color: "#ffffff" })}
              </div>
              <div>
                <h4 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
                  {activeAgent.title} - Strategic Analysis
                </h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {activeAgent.desc}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={toggleAdvisorVoice}
                className="hover-lift"
                title={isSpeaking ? "Stop Voice Narration" : "Listen to this Advisor's analysis aloud"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 13px",
                  borderRadius: "20px",
                  background: isSpeaking ? "rgba(244, 63, 94, 0.22)" : `${activeAgent.color}22`,
                  border: `1px solid ${isSpeaking ? "#f43f5e" : `${activeAgent.color}66`}`,
                  color: isSpeaking ? "#fda4af" : activeAgent.color,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX size={14} color="#f43f5e" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={14} color={activeAgent.color} />
                    <span>Listen Aloud</span>
                  </>
                )}
              </button>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 14px",
                borderRadius: "20px",
                background: `${activeAgent.color}18`,
                border: `1px solid ${activeAgent.color}44`,
                color: activeAgent.color,
                fontSize: "0.78rem",
                fontWeight: 800,
                textTransform: "uppercase"
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: activeAgent.color, boxShadow: `0 0 8px ${activeAgent.color}` }} />
                <span>{isSpeaking ? "Speaking Now" : "Reviewing"}</span>
              </div>
            </div>

          </div>

          <div>
            {/* Animated Typewriter Statement */}
            <p style={{ fontSize: "1rem", color: "#f8fafc", lineHeight: "1.75", marginBottom: "16px", position: "relative" }}>
              {displayedText}
              {isTyping && (
                <span style={{
                  display: "inline-block",
                  width: "2px",
                  height: "16px",
                  background: activeAgent.color,
                  marginLeft: "4px",
                  verticalAlign: "middle",
                  animation: "blink 0.8s infinite"
                }} />
              )}
            </p>

            {/* Key Quotes Badges */}
            {delibData?.key_quotes && delibData.key_quotes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                {delibData.key_quotes.map((q, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    style={{
                      fontSize: "0.82rem",
                      fontStyle: "italic",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: `1px solid ${activeAgent.color}44`,
                      color: "#e2e8f0"
                    }}
                  >
                    "{q}"
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ─────────────────────────────────────────────
          FINAL BINDING VERDICT & SOLUTION BLUEPRINT
      ───────────────────────────────────────────── */}
      {(showFinalVerdict || (!isSimulating && report?.recommended_option)) && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          style={{
            marginTop: "24px",
            padding: "26px 28px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)",
            border: "2px solid #f59e0b",
            boxShadow: "0 0 35px rgba(245, 158, 11, 0.25)",
            position: "relative",
            zIndex: 2
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px #f59e0b"
              }}>
                <Gavel size={20} color="#0b0907" />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  FINAL BOARDROOM RESOLUTION & DIRECTIVE
                </span>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#ffffff" }}>
                  {report?.recommended_option || "Option A: Approved Directive"}
                </h3>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid #10b981",
              color: "#34d399",
              fontSize: "0.85rem",
              fontWeight: 800
            }}>
              <CheckCircle2 size={16} />
              <span>Consensus Score: {report?.consensus_score || 88}%</span>
            </div>
          </div>

          <p style={{ fontSize: "0.95rem", color: "#e2e8f0", lineHeight: "1.65", marginBottom: "16px" }}>
            {report?.strategic_verdict || report?.executive_summary || "The Personal Board of Directors has reached consensus on this strategic pathway."}
          </p>

          {/* Quick CTA to scroll to full blueprint */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Review complete • Advice from six advisors combined into an action plan
            </span>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                window.scrollTo({ top: window.scrollY + 450, behavior: "smooth" });
              }}
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: "0.82rem" }}
            >
              <span>Inspect Full Blueprint Below ↓</span>
            </button>
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
};





