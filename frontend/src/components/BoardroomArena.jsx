import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  DollarSign, 
  Cpu, 
  ShieldAlert, 
  HeartHandshake, 
  Gavel, 
  Sparkles,
  Zap,
  Layers,
  Radio,
  Compass,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export const BoardroomArena = ({ report, isDeliberating }) => {
  const [activeSeat, setActiveSeat] = useState(0);

  const tracks = [
    {
      num: "01",
      id: "CEO",
      title: "AI Growth & Strategy",
      persona: "CEO Advisor",
      role: "Strategic Vision & Upside",
      icon: Briefcase,
      color: "#f59e0b",
      theBar: "Show asymmetric upside, compounding market leverage & executive brand equity.",
      whyNow: "Playing safe during structural market shifts is the greatest silent failure mode."
    },
    {
      num: "02",
      id: "CFO",
      title: "Runway & ROI Discipline",
      persona: "CFO Advisor",
      role: "Financial Risk & Liquidity",
      icon: DollarSign,
      color: "#10b981",
      theBar: "Audit 6-month liquid runway buffers and discount unvested equity by 80%.",
      whyNow: "Paper wealth does not pay mortgages. Protect liquid cash reserves first."
    },
    {
      num: "03",
      id: "CTO",
      title: "Tech Velocity & Mastery",
      persona: "CTO Advisor",
      role: "Architecture & Learning Speed",
      icon: Cpu,
      color: "#06b6d4",
      theBar: "Accelerate architecture ownership and eliminate technology obsolescence.",
      whyNow: "Learning velocity is your only durable individual moat."
    },
    {
      num: "04",
      id: "Risk Analyst",
      title: "Pre-Mortem & Safeguards",
      persona: "Chief Risk Officer",
      role: "Downside Protection",
      icon: ShieldAlert,
      color: "#f43f5e",
      theBar: "Establish non-negotiable 90-day tripwires before executing transitions.",
      whyNow: "Unmitigated tail-risks turn reversible decisions into permanent setbacks."
    },
    {
      num: "05",
      id: "Mentor",
      title: "Life Strategy & Fulfillment",
      persona: "Personal Life Mentor",
      role: "Core Values & Stamina",
      icon: HeartHandshake,
      color: "#a855f7",
      theBar: "Align with long-term fulfillment, energy stamina & past retrospective lessons.",
      whyNow: "Burnout is expensive. Ensure your daily work compounds authentic satisfaction."
    },
    {
      num: "06",
      id: "Chairman",
      title: "Consensus & Final Verdict",
      persona: "Chairman of the Board",
      role: "Executive Arbiter",
      icon: Gavel,
      color: "#ff6a00",
      theBar: "Reconcile opposing dialectics and issue a binding strategic blueprint.",
      whyNow: "Action requires decisive clarity. Synthesize all trade-offs into an execution plan."
    }
  ];

  const activeTrack = tracks[activeSeat];
  const delibData = report?.deliberations?.find(
    (d) => d.agent_name.toLowerCase().includes(activeTrack.id.toLowerCase())
  );

  return (
    <div className="rzp-card" style={{ padding: "28px", border: "1px solid var(--border-medium)" }}>
      {/* Top Header - Razorpay Buildathon Vibe */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "18px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span className="track-number">TRACKS</span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
              {isDeliberating ? "• LIVE MULTI-AGENT IN-SESSION" : "• 6 AUTONOMOUS ADVISORS CONVENED"}
            </span>
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800 }}>
            Executive Boardroom Deliberation
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Select an advisor track below to inspect their specialized analysis, priorities, and debate position.
          </p>
        </div>

        <div className="rzp-pill" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Radio size={14} color="#f59e0b" />
          <span style={{ color: "#f59e0b", fontWeight: 700 }}>6 PERSPECTIVES ASSEMBLED</span>
        </div>
      </div>

      {/* Tracks Grid (Razorpay Buildathon Track Cards) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "12px",
        marginBottom: "24px"
      }}>
        {tracks.map((track, idx) => {
          const isSelected = activeSeat === idx;
          const TrackIcon = track.icon;
          const agentDelib = report?.deliberations?.find(
            (d) => d.agent_name.toLowerCase().includes(track.id.toLowerCase())
          );

          return (
            <div
              key={track.num}
              onClick={() => setActiveSeat(idx)}
              style={{
                padding: "16px",
                borderRadius: "10px",
                background: isSelected ? "#1c1812" : "#13100c",
                border: isSelected ? "1px solid #f59e0b" : "1px solid var(--border-subtle)",
                cursor: "pointer",
                transition: "all 0.12s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span className="track-number">{track.num}</span>
                <TrackIcon size={18} color={isSelected ? track.color : "var(--text-muted)"} />
              </div>

              <h4 style={{ fontSize: "0.92rem", fontWeight: 800, color: isSelected ? "#ffffff" : "var(--text-primary)", marginBottom: "3px" }}>
                {track.persona}
              </h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                {track.role}
              </p>

              {agentDelib ? (
                <div style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  fontSize: "0.72rem",
                  color: "var(--text-secondary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  Votes: <strong style={{ color: track.color }}>{agentDelib.recommended_option}</strong>
                </div>
              ) : (
                <div style={{
                  padding: "3px 6px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  fontStyle: "italic"
                }}>
                  Standing by
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Track Detail Box - Razorpay Buildathon Track Deep Dive */}
      <div style={{
        background: "#120f0b",
        border: "1px solid var(--border-medium)",
        borderRadius: "10px",
        padding: "24px",
        position: "relative"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="track-number">{activeTrack.num}</span>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
                {activeTrack.persona} — {activeTrack.title}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Core Strategic Focus & Diagnostic Lens
              </p>
            </div>
          </div>

          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            padding: "4px 10px",
            borderRadius: "4px",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#f59e0b",
            fontWeight: 700
          }}>
            PERSPECTIVE {activeTrack.num}/06
          </div>
        </div>

        {/* The Bar & Why Now Callout Boxes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", marginBottom: "18px" }}>
          <div style={{ padding: "12px 14px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "#f59e0b", fontWeight: 800, textTransform: "uppercase" }}>
              The Bar:
            </span>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "3px", lineHeight: "1.5" }}>
              {activeTrack.theBar}
            </p>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "#38bdf8", fontWeight: 800, textTransform: "uppercase" }}>
              Why Now:
            </span>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "3px", lineHeight: "1.5" }}>
              {activeTrack.whyNow}
            </p>
          </div>
        </div>

        {/* Live Analysis Content */}
        {delibData ? (
          <div>
            <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Official Perspective Analysis:
            </span>
            <p style={{ fontSize: "0.92rem", color: "#fdfdfd", lineHeight: "1.6", marginTop: "6px", marginBottom: "14px" }}>
              {delibData.analysis}
            </p>
            {delibData.key_quotes && delibData.key_quotes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {delibData.key_quotes.map((q, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: "0.8rem",
                      fontStyle: "italic",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                      color: "#e2e8f0"
                    }}
                  >
                    "{q}"
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            Click "Convene Boardroom Meeting" above to execute the LangGraph multi-agent simulation for this track.
          </p>
        )}
      </div>
    </div>
  );
};
