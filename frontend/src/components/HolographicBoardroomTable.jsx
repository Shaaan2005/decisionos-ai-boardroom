import React from "react";
import { 
  Briefcase, 
  DollarSign, 
  Cpu, 
  ShieldAlert, 
  HeartHandshake, 
  Gavel, 
  Radio
} from "lucide-react";
import { AudioSpectrumVisualizer } from "./AudioSpectrumVisualizer";
import { playPopSound } from "../utils/audioUtils";

/**
 * 3D Holographic Boardroom Table
 * Pure CSS positioning to guarantee 100% rock-solid stability on hover with zero flickering/disappearing.
 */
export const HolographicBoardroomTable = ({ 
  activeAdvisorIndex = 0, 
  onSelectAdvisor, 
  isDeliberating = false,
  consensusScore = 85
}) => {
  const advisors = [
    { id: "CEO", name: "CEO", role: "Vision & Upside", icon: Briefcase, color: "#6366f1", angle: 0 },
    { id: "CFO", name: "CFO", role: "Capital & Runway", icon: DollarSign, color: "#10b981", angle: 60 },
    { id: "CTO", name: "CTO", role: "Tech Velocity", icon: Cpu, color: "#06b6d4", angle: 120 },
    { id: "Risk", name: "Risk", role: "Pre-Mortem", icon: ShieldAlert, color: "#f43f5e", angle: 180 },
    { id: "Mentor", name: "Mentor", role: "Core Values", icon: HeartHandshake, color: "#a855f7", angle: 240 },
    { id: "Chairman", name: "Chairman", role: "Consensus Verdict", icon: Gavel, color: "#f59e0b", angle: 300 },
  ];

  return (
    <div style={{
      position: "relative",
      width: "100%",
      padding: "24px 20px",
      background: "radial-gradient(ellipse at center, #17120c 0%, #0c0906 100%)",
      borderRadius: "16px",
      border: "1px solid rgba(245, 158, 11, 0.3)",
      boxShadow: "0 20px 50px -15px rgba(0, 0, 0, 0.9)",
      overflow: "hidden",
      marginBottom: "28px"
    }}>
      {/* Background Orbital Rings */}
      <div style={{
        position: "absolute",
        top: "55%",
        left: "50%",
        transform: "translate(-50%, -50%) perspective(800px) rotateX(55deg)",
        width: "660px",
        height: "420px",
        borderRadius: "50%",
        border: "1px dashed rgba(245, 158, 11, 0.2)",
        pointerEvents: "none"
      }} />

      {/* Top Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
        position: "relative",
        zIndex: 10,
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Radio size={16} color="#f59e0b" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
              Holographic Boardroom Chamber
            </h3>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              SPATIAL 3D QUORUM • 6 EXECUTIVE AGENTS
            </p>
          </div>
        </div>

        {/* Live Audio Frequency Spectrum */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(0,0,0,0.6)",
          padding: "4px 10px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <span style={{ fontSize: "0.68rem", color: "#a5b4fc", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
            NEURAL SPECTRUM:
          </span>
          <AudioSpectrumVisualizer isPlaying={isDeliberating || true} color="#f59e0b" barCount={10} />
        </div>
      </div>

      {/* 3D Chamber Arena */}
      <div style={{
        position: "relative",
        height: "360px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {/* Central Verdict Fusion Core */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #21190f 0%, #0d0a07 100%)",
            border: "2px solid rgba(245, 158, 11, 0.6)",
            boxShadow: "0 0 30px rgba(245, 158, 11, 0.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "10px"
          }}
        >
          <div style={{
            fontSize: "0.62rem",
            fontWeight: 800,
            color: "#f59e0b",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
            marginBottom: "2px"
          }}>
            CONSENSUS CORE
          </div>
          <div style={{
            fontSize: "1.7rem",
            fontWeight: 900,
            color: "#ffffff",
            fontFamily: "var(--font-mono)",
            lineHeight: 1
          }}>
            {consensusScore}%
          </div>
          <div style={{
            fontSize: "0.65rem",
            color: "#34d399",
            fontWeight: 700,
            marginTop: "3px"
          }}>
            ● QUORUM ACTIVE
          </div>
        </div>

        {/* Global SVG Laser Telemetry Connectors */}
        <svg style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 4
        }}>
          {advisors.map((adv, idx) => {
            const isSelected = activeAdvisorIndex === idx;
            const angleRad = (adv.angle * Math.PI) / 180;
            return (
              <line
                key={`laser-${adv.id}`}
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${Math.cos(angleRad) * 230}px)`}
                y2={`calc(50% + ${Math.sin(angleRad) * 135}px)`}
                stroke={isSelected ? adv.color : "rgba(255, 255, 255, 0.08)"}
                strokeWidth={isSelected ? "2" : "1"}
                strokeDasharray={isSelected ? "none" : "4,4"}
              />
            );
          })}
        </svg>

        {/* 6 Orbiting Advisor Seat Pods (Stable Top/Left Positioning) */}
        {advisors.map((adv, idx) => {
          const isSelected = activeAdvisorIndex === idx;
          const Icon = adv.icon;

          const angleRad = (adv.angle * Math.PI) / 180;
          const offsetX = Math.cos(angleRad) * 230;
          const offsetY = Math.sin(angleRad) * 135;

          return (
            <div
              key={adv.id}
              onClick={() => {
                playPopSound();
                if (onSelectAdvisor) onSelectAdvisor(idx);
              }}
              style={{
                position: "absolute",
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: "translate(-50%, -50%)",
                zIndex: isSelected ? 25 : 15,
                cursor: "pointer",
                transition: "transform 0.15s ease"
              }}
              className="hover-scale"
            >
              <div style={{
                padding: "8px 14px",
                borderRadius: "10px",
                background: isSelected ? `${adv.color}25` : "#14100b",
                border: `1.5px solid ${isSelected ? adv.color : "rgba(255, 255, 255, 0.12)"}`,
                boxShadow: isSelected ? `0 0 20px ${adv.color}40` : "0 4px 15px rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "125px",
                transition: "all 0.15s ease"
              }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: `${adv.color}25`,
                  border: `1px solid ${adv.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Icon size={14} color={adv.color} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap" }}>
                    {adv.name}
                  </div>
                  <div style={{ fontSize: "0.66rem", color: adv.color, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {adv.role}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
