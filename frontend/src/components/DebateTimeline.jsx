import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Scale, 
  Layers, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  FastForward
} from "lucide-react";
import { 
  playClickSound, 
  playPopSound, 
  playTypingSound, 
  playAgentTurnSound 
} from "../utils/audioUtils";
import { speakPersonaText, stopSpeech } from "../utils/speechUtils";
import { useLanguage } from "../context/LanguageContext";

export const DebateTimeline = ({ debateTurns }) => {
  const { t } = useLanguage();
  const [selectedRound, setSelectedRound] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [typedChars, setTypedChars] = useState({}); // { [turnIndex]: charCount }
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 1.5x, 2x
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const activeCardRef = useRef(null);

  if (!debateTurns || debateTurns.length === 0) {
    return (
      <div className="glass-card" style={{ padding: "32px", textAlign: "center" }}>
        <MessageSquare size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
        <h4 style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
          {t("debate.empty", "No debate transcript available yet")}
        </h4>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {t("debate.empty_desc", "The multi-agent cross-examination will appear here after the board deliberates.")}
        </p>
      </div>
    );
  }

  const agentColors = {
    CEO: "#6366f1",
    CFO: "#10b981",
    CTO: "#06b6d4",
    "Risk Analyst": "#f43f5e",
    Mentor: "#a855f7",
    Chairman: "#f59e0b",
  };

  const turnIcons = {
    critique: Flame,
    defense: ShieldCheck,
    synthesis: Scale,
    statement: Layers,
  };

  const filteredTurns = selectedRound === "all" 
    ? debateTurns 
    : debateTurns.filter(t => t.round_number === parseInt(selectedRound));

  // Handle Play/Pause
  const togglePlay = () => {
    playClickSound();
    if (!isPlaying) {
      if (currentTurnIdx >= filteredTurns.length) {
        // Restart if at end
        setTypedChars({});
        setCurrentTurnIdx(0);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      stopSpeech();
    }
  };

  // Restart from beginning
  const handleRestart = () => {
    playClickSound();
    stopSpeech();
    setTypedChars({});
    setCurrentTurnIdx(0);
    setIsPlaying(true);
  };

  // Play advisor voice & entrance sound when turn changes
  useEffect(() => {
    if (isPlaying && filteredTurns[currentTurnIdx]) {
      const activeTurn = filteredTurns[currentTurnIdx];
      const speaker = activeTurn.speaker;
      
      if (soundEnabled) {
        playAgentTurnSound(speaker);
      }

      if (voiceEnabled && activeTurn.content) {
        speakPersonaText(activeTurn.content, speaker, {
          speedMultiplier,
          langCode: "en"
        });
      }

      // Auto-scroll active card smoothly into view
      setTimeout(() => {
        activeCardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }

    return () => {
      stopSpeech();
    };
  }, [currentTurnIdx, isPlaying, soundEnabled, voiceEnabled, speedMultiplier]);

  // Character-by-Character Typewriter Animation Loop
  useEffect(() => {
    if (!isPlaying) return;
    if (currentTurnIdx >= filteredTurns.length) {
      setIsPlaying(false);
      return;
    }

    const activeTurn = filteredTurns[currentTurnIdx];
    const fullText = activeTurn?.content || "";
    const currentCount = typedChars[currentTurnIdx] || 0;

    if (currentCount < fullText.length) {
      const baseDelay = 18 / speedMultiplier; // ~18ms per character
      const timer = setTimeout(() => {
        // Step forward 1-2 characters
        const nextCount = Math.min(fullText.length, currentCount + 1);
        setTypedChars(prev => ({ ...prev, [currentTurnIdx]: nextCount }));

        // Keystroke sound every few characters
        if (soundEnabled && nextCount % 3 === 0) {
          playTypingSound();
        }
      }, baseDelay);

      return () => clearTimeout(timer);
    } else {
      // Finished typing current dialogue! Pause briefly then proceed to next agent
      const finishTimer = setTimeout(() => {
        if (soundEnabled) playPopSound();
        setCurrentTurnIdx(prev => prev + 1);
      }, 850 / speedMultiplier);

      return () => clearTimeout(finishTimer);
    }
  }, [isPlaying, currentTurnIdx, typedChars, filteredTurns, speedMultiplier, soundEnabled]);

  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      {/* Header & Playback Control Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="#f59e0b" />
            <span>Boardroom Cross-Examination Debate</span>
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Real-time multi-agent dialectic where advisors challenge assumptions and stress-test trade-offs.
          </p>
        </div>

        {/* Action Controls Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="btn-primary"
            style={{ padding: "7px 16px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            {isPlaying ? (
              <>
                <Pause size={15} />
                <span>Pause Replay</span>
              </>
            ) : (
              <>
                <Play size={15} />
                <span>Play Live Replay</span>
              </>
            )}
          </button>

          {/* Replay From Start */}
          <button
            type="button"
            onClick={handleRestart}
            className="btn-secondary"
            title="Replay from beginning"
            style={{ padding: "7px 12px", fontSize: "0.82rem" }}
          >
            <RotateCcw size={14} />
          </button>

          {/* Speed Toggle (1x, 1.5x, 2x) */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setSpeedMultiplier(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1);
            }}
            className="btn-secondary"
            title="Change typing speed"
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

          {/* Sound Mute / Unmute */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setSoundEnabled(!soundEnabled);
            }}
            className="btn-secondary"
            title={soundEnabled ? "Mute SFX" : "Enable SFX"}
            style={{ padding: "7px 12px", fontSize: "0.82rem" }}
          >
            {soundEnabled ? <Volume2 size={15} color="#10b981" /> : <VolumeX size={15} color="var(--text-muted)" />}
          </button>

          {/* Round Filter Tabs */}
          <div style={{ display: "flex", gap: "3px", background: "rgba(255, 255, 255, 0.04)", padding: "3px", borderRadius: "8px" }}>
            <button
              onClick={() => {
                playClickSound();
                setSelectedRound("all");
              }}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                background: selectedRound === "all" ? "var(--accent-primary)" : "transparent",
                color: "#ffffff",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              All ({debateTurns.length})
            </button>
            <button
              onClick={() => {
                playClickSound();
                setSelectedRound("1");
              }}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                background: selectedRound === "1" ? "var(--accent-primary)" : "transparent",
                color: "#ffffff",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Round 1
            </button>
            <button
              onClick={() => {
                playClickSound();
                setSelectedRound("2");
              }}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                background: selectedRound === "2" ? "var(--accent-primary)" : "transparent",
                color: "#ffffff",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Round 2
            </button>
          </div>
        </div>
      </div>

      {/* Live Speaking Indicator Banner */}
      {isPlaying && filteredTurns[currentTurnIdx] && (
        <div style={{
          padding: "10px 16px",
          borderRadius: "10px",
          background: "rgba(10, 16, 30, 0.9)",
          border: `1px solid ${agentColors[filteredTurns[currentTurnIdx].speaker] || "#6366f1"}55`,
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: `0 0 20px ${agentColors[filteredTurns[currentTurnIdx].speaker] || "#6366f1"}22`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: agentColors[filteredTurns[currentTurnIdx].speaker] || "#6366f1",
              boxShadow: `0 0 10px ${agentColors[filteredTurns[currentTurnIdx].speaker] || "#6366f1"}`
            }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#ffffff" }}>
              {filteredTurns[currentTurnIdx].speaker} is speaking...
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "14px" }}>
            <div className="wave-bar-1" style={{ width: "3px", background: agentColors[filteredTurns[currentTurnIdx].speaker] || "#6366f1", borderRadius: "2px" }} />
            <div className="wave-bar-2" style={{ width: "3px", background: agentColors[filteredTurns[currentTurnIdx].speaker] || "#6366f1", borderRadius: "2px" }} />
            <div className="wave-bar-3" style={{ width: "3px", background: agentColors[filteredTurns[currentTurnIdx].speaker] || "#6366f1", borderRadius: "2px" }} />
          </div>
        </div>
      )}

      {/* Debate Exchange List with Animated Typewriter Dialogues */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredTurns.map((turn, idx) => {
          const speakerColor = agentColors[turn.speaker] || "#6366f1";
          const TurnIcon = turnIcons[turn.turn_type] || MessageSquare;
          const isCurrentlyTyping = isPlaying && currentTurnIdx === idx;
          const isPastTurn = currentTurnIdx > idx;
          const isFutureTurn = isPlaying && currentTurnIdx < idx;
          
          // Determine how much text to reveal
          const charLimit = !isPlaying 
            ? turn.content.length 
            : isPastTurn 
              ? turn.content.length 
              : isCurrentlyTyping 
                ? (typedChars[idx] || 0) 
                : 0;

          const displayText = turn.content.slice(0, charLimit);
          const isFinishedCurrent = isCurrentlyTyping && charLimit >= turn.content.length;

          // Only render visible or previously spoken turns during playback
          if (isPlaying && isFutureTurn && !typedChars[idx]) {
            return null; // Next turns will pop in sequentially!
          }

          return (
            <div
              key={idx}
              ref={isCurrentlyTyping ? activeCardRef : null}
              style={{
                display: "flex",
                gap: "16px",
                padding: "20px",
                borderRadius: "14px",
                background: isCurrentlyTyping ? "rgba(22, 33, 58, 0.95)" : "rgba(15, 23, 42, 0.65)",
                border: `1px solid ${isCurrentlyTyping ? speakerColor : "var(--border-subtle)"}`,
                borderLeft: `4px solid ${speakerColor}`,
                boxShadow: isCurrentlyTyping ? `0 0 30px ${speakerColor}35, inset 0 0 15px ${speakerColor}10` : "none",
                transition: "all 0.3s ease",
                animation: "fadeIn 0.3s ease-out"
              }}
            >
              {/* Speaker Avatar */}
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: `${speakerColor}25`,
                border: `1px solid ${speakerColor}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: speakerColor,
                fontSize: "0.95rem",
                flexShrink: 0,
                boxShadow: isCurrentlyTyping ? `0 0 15px ${speakerColor}66` : "none"
              }}>
                {turn.speaker.charAt(0)}
              </div>

              {/* Turn Content */}
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: "0.98rem", color: "#ffffff" }}>
                    {turn.speaker}
                  </span>

                  {turn.target_agent && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      <ArrowRight size={12} />
                      <span>addressing <strong style={{ color: "#e2e8f0" }}>{turn.target_agent}</strong></span>
                    </div>
                  )}

                  <span style={{
                    marginLeft: "auto",
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    background: `${speakerColor}18`,
                    color: speakerColor,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    border: `1px solid ${speakerColor}33`
                  }}>
                    <TurnIcon size={12} />
                    {turn.turn_type}
                  </span>
                </div>

                {/* Animated Typewriter Body Text */}
                <p style={{ fontSize: "0.94rem", color: "#f1f5f9", lineHeight: "1.65", position: "relative" }}>
                  {displayText}
                  {/* Blinking Cursor while actively typing */}
                  {isCurrentlyTyping && !isFinishedCurrent && (
                    <span style={{
                      display: "inline-block",
                      width: "2px",
                      height: "14px",
                      background: speakerColor,
                      marginLeft: "3px",
                      verticalAlign: "middle",
                      animation: "blink 0.8s infinite"
                    }} />
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};


