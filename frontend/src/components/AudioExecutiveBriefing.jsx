import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX, Shield, Briefcase, DollarSign, Gavel } from "lucide-react";
import { AudioSpectrumVisualizer } from "./AudioSpectrumVisualizer";
import { playClickSound, playPopSound, playVerdictSound } from "../utils/audioUtils";
import { speakPersonaText, stopSpeech } from "../utils/speechUtils";

/**
 * 60-Second Executive Audio Podcast / Briefing
 * Plays a continuous, multi-advisor audio briefing summarizing the core dilemma, trade-offs, and final Chairman verdict.
 */
export const AudioExecutiveBriefing = ({ report, decision }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const recommendedOption = report?.recommended_option || report?.synthesis?.recommended_option_title || decision?.options?.[0]?.title || decision?.options?.[0]?.label || "Option A";
  const chairmanSummary = report?.executive_summary || report?.synthesis?.executive_summary || "Based on full boardroom deliberation, the optimal path aligns compounding upside with downside safeguards.";
  
  const ceoDelib = report?.deliberations?.find(d => (d?.agent_name || d?.role || "").toUpperCase().includes("CEO"));
  const cfoDelib = report?.deliberations?.find(d => (d?.agent_name || d?.role || "").toUpperCase().includes("CFO"));
  const riskDelib = report?.deliberations?.find(d => (d?.agent_name || d?.role || "").toUpperCase().includes("RISK"));

  const segments = [
    {
      speaker: "Chairman",
      role: "Board Overview",
      color: "#f59e0b",
      icon: Gavel,
      text: `Convening executive briefing for: ${decision?.title || "Strategic Dilemma"}. The Board has completed cross-examination.`
    },
    {
      speaker: "CEO",
      role: "Vision & Scale",
      color: "#6366f1",
      icon: Briefcase,
      text: (ceoDelib?.analysis || ceoDelib?.argument || "The CEO emphasizes capturing maximum asymmetric market leverage and long-term equity compounding.").slice(0, 140)
    },
    {
      speaker: "CFO",
      role: "Runway & ROI",
      color: "#10b981",
      icon: DollarSign,
      text: (cfoDelib?.analysis || cfoDelib?.argument || "The CFO advises protecting cash runway, risk-adjusted returns, and maintaining capital discipline.").slice(0, 140)
    },
    {
      speaker: "Risk Analyst",
      role: "Safeguards",
      color: "#f43f5e",
      icon: Shield,
      text: (riskDelib?.analysis || riskDelib?.argument || "The Risk team mandates 90-day pre-mortem tripwires to contain downside exposure.").slice(0, 140)
    },
    {
      speaker: "Chairman",
      role: "Binding Verdict",
      color: "#f59e0b",
      icon: Gavel,
      text: `Official Consensus: Recommend ${recommendedOption}. ${chairmanSummary.slice(0, 120)}`
    }
  ];

  const currentSegment = segments[currentSegmentIndex] || segments[0];
  const CurrentIcon = currentSegment.icon;

  const playSegment = (index) => {
    if (index >= segments.length) {
      setIsPlaying(false);
      setCurrentSegmentIndex(0);
      setProgress(100);
      playVerdictSound();
      return;
    }

    setCurrentSegmentIndex(index);
    setProgress(Math.round(((index + 1) / segments.length) * 100));

    const seg = segments[index];
    speakPersonaText(seg.speaker, seg.text, {
      onEnd: () => {
        if (isPlaying) {
          playSegment(index + 1);
        }
      }
    });
  };

  const handleToggle = () => {
    playPopSound();
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playSegment(currentSegmentIndex);
    }
  };

  const handleReset = () => {
    playClickSound();
    stopSpeech();
    setIsPlaying(false);
    setCurrentSegmentIndex(0);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(30, 24, 16, 0.95) 0%, rgba(13, 10, 7, 0.98) 100%)",
      border: "1px solid rgba(245, 158, 11, 0.35)",
      borderRadius: "14px",
      padding: "20px 24px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
      marginBottom: "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(245, 158, 11, 0.2)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Headphones size={18} color="#f59e0b" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
                60-Second Executive Audio Briefing
              </h4>
              <span className="cyber-badge" style={{ fontSize: "0.65rem" }}>
                PODCAST MEMO
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1px" }}>
              Multi-voice synthesized C-suite debrief (Chairman, CEO, CFO, Risk)
            </p>
          </div>
        </div>

        {/* Audio Visualizer + Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AudioSpectrumVisualizer isPlaying={isPlaying} color={currentSegment.color} barCount={12} />
          
          <button
            type="button"
            onClick={handleToggle}
            className="btn-primary"
            style={{
              padding: "7px 16px",
              fontSize: "0.82rem",
              background: isPlaying ? "#f43f5e" : "#f59e0b"
            }}
          >
            {isPlaying ? (
              <>
                <Pause size={14} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>{currentSegmentIndex > 0 ? "Resume Memo" : "Listen to Briefing"}</span>
              </>
            )}
          </button>

          {currentSegmentIndex > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              title="Restart from beginning"
              style={{ padding: "7px 10px" }}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Active Speaker Dialogue Bar */}
      <div style={{
        padding: "12px 16px",
        borderRadius: "10px",
        background: "rgba(0, 0, 0, 0.4)",
        border: `1px solid ${currentSegment.color}35`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "14px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: `${currentSegment.color}25`,
            border: `1px solid ${currentSegment.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <CurrentIcon size={16} color={currentSegment.color} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: currentSegment.color, textTransform: "uppercase" }}>
              {currentSegment.speaker} ({currentSegment.role})
            </div>
            <p style={{ fontSize: "0.84rem", color: "#f1f5f9", marginTop: "2px", lineHeight: "1.4" }}>
              "{currentSegment.text}"
            </p>
          </div>
        </div>

        <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", flexShrink: 0 }}>
          {currentSegmentIndex + 1} / {segments.length}
        </span>
      </div>

      {/* Progress Track */}
      <div style={{
        marginTop: "10px",
        height: "3px",
        borderRadius: "2px",
        background: "rgba(255, 255, 255, 0.08)",
        overflow: "hidden"
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #6366f1, #10b981, #f59e0b)",
          transition: "width 0.3s ease"
        }} />
      </div>
    </div>
  );
};
