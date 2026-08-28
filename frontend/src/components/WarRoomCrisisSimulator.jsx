import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Zap,
  TrendingDown,
  UserX,
  Globe,
  Activity,
  ShieldOff,
  ChevronRight,
  X,
  RotateCcw,
  Radio,
} from "lucide-react";

// ─── Black Swan Event Catalogue ─────────────────────────────────────────────
const BLACK_SWAN_EVENTS = [
  {
    id: "competitor_raise",
    icon: TrendingDown,
    label: "Tier-1 Competitor Raises $50M",
    sub: "Cuts prices by 50% — market price war imminent",
    color: "#f43f5e",
    severity: "CRITICAL",
    impactVectors: [
      { label: "Revenue Runway", delta: -38, unit: "%" },
      { label: "CAC Impact", delta: +65, unit: "%" },
      { label: "Margin Pressure", delta: -28, unit: "pts" },
    ],
    advisorResponses: {
      CEO: "This is a forcing function. We must accelerate our unique differentiation wedge — commoditization players rarely win long-term. We pivot to a sticky vertical niche while they fight on price.",
      CFO: "Burn rate must be slashed by 30% immediately. A 12-month defensive runway is non-negotiable before any growth play. Renegotiate vendor contracts this week.",
      CTO: "Invest in technical moat now — API integrations, proprietary data pipelines. The competitor is buying time, not talent. We ship 3 enterprise differentiators in 60 days.",
      "Risk Analyst": "Immediate war-game: assume they capture 20% of our pipeline. Model the waterfall impact. Activate top-5 at-risk accounts with executive sponsor calls today.",
      Mentor: "Your team reads the market. Don't let external noise shake your north star. Founders who panic on competitor fundraises almost always make the wrong move. Breathe.",
      Chairman: "EMERGENCY DIRECTIVE: Hold firm on premium positioning. Do NOT enter a price war. Activate defensive moat strategy, protect top 10% of MRR, and accelerate Series A narrative.",
    },
  },
  {
    id: "market_freeze",
    icon: Globe,
    label: "Macro Venture Freeze",
    sub: "Valuations drop 40% — funding market effectively closed",
    color: "#f59e0b",
    severity: "HIGH",
    impactVectors: [
      { label: "Valuation Cap", delta: -40, unit: "%" },
      { label: "Fundraising Timeline", delta: +18, unit: " months" },
      { label: "Burn Urgency", delta: +75, unit: "%" },
    ],
    advisorResponses: {
      CEO: "Default-to-profitability is the only viable path now. Shut down all non-essential growth bets and focus 100% of energy on product-market fit metrics that drive organic growth.",
      CFO: "Cut burn to 18-month runway minimum. No exceptions. This means a 25-35% headcount rationalization. Revenue-based financing replaces vanity ARR.",
      CTO: "Go deep on what the top 10% of users love. Ship zero new features for 60 days unless directly tied to retention. Technical debt blitz to reduce infrastructure costs.",
      "Risk Analyst": "Model 3 scenarios: 18-month survival, 24-month bridge, 36-month default-to-profit. Execute the 18-month plan now and position for 36-month if traction proves.",
      Mentor: "Winter separates pretenders from founders. This is where character compounds. What you build in the downturn defines your leverage in the upturn.",
      Chairman: "EMERGENCY DIRECTIVE: Shift to capital efficiency mode immediately. Revenue is oxygen. Pipeline becomes pipeline-to-close within 30 days or is removed from forecast.",
    },
  },
  {
    id: "key_exec_resign",
    icon: UserX,
    label: "Core Architect Resigns",
    sub: "Lead technical architect and co-founder exits the company",
    color: "#a855f7",
    severity: "HIGH",
    impactVectors: [
      { label: "Engineering Velocity", delta: -55, unit: "%" },
      { label: "Technical Debt Risk", delta: +80, unit: "%" },
      { label: "Team Morale Index", delta: -42, unit: "pts" },
    ],
    advisorResponses: {
      CEO: "This is a leadership test. Communicate transparently with the team within 24 hours. Promote an internal architect and commit to a 90-day technical continuity plan in writing.",
      CFO: "Re-budget for a senior technical hire at 40% premium to market rate — this is not the moment to underpay. Model the 6-month productivity gap against revenue targets.",
      CTO: "Document all critical system knowledge immediately. Run a 48-hour architecture knowledge-transfer sprint. Freeze all new feature development until core infrastructure is documented.",
      "Risk Analyst": "Activate succession protocol. Identify the top 3 technical risks this creates in the product roadmap. Execute targeted retention bonuses for remaining senior engineers.",
      Mentor: "Your team is watching how you handle this. Resilience in adversity compounds trust. Own the narrative. Great companies survive key departures — it is how leaders respond that matters.",
      Chairman: "EMERGENCY DIRECTIVE: 72-hour stabilization protocol. All-hands technical audit. Promote internal leadership. Activate executive search immediately. Do NOT let this become a team-wide exodus.",
    },
  },
  {
    id: "security_breach",
    icon: ShieldOff,
    label: "Critical Security Breach",
    sub: "Customer data exposed — regulatory and reputational crisis",
    color: "#ef4444",
    severity: "CRITICAL",
    impactVectors: [
      { label: "Customer Churn Risk", delta: +60, unit: "%" },
      { label: "Regulatory Exposure", delta: +90, unit: "%" },
      { label: "Brand Trust Index", delta: -50, unit: "pts" },
    ],
    advisorResponses: {
      CEO: "Transparency is the only path to trust recovery. Notify affected customers within 24 hours with full disclosure. Hire a crisis communications firm this week.",
      CFO: "Provision for legal and regulatory costs immediately — minimum $500K reserve. Activate cyber insurance. This will affect Q4 revenue; model a 15-30% churn scenario.",
      CTO: "Isolate affected systems immediately. Full security audit within 48 hours. Bring in external penetration testing. Patch and re-deploy in hardened environment within 7 days.",
      "Risk Analyst": "GDPR/SOC2 compliance counsel on retainer immediately. Document every remediation step for regulators. This is now a board-level issue requiring weekly status reporting.",
      Mentor: "How you handle a crisis defines your company character permanently. Founders who own their mistakes transparently earn extraordinary long-term trust.",
      Chairman: "EMERGENCY DIRECTIVE: Crisis war room activated. CEO owns external communications. CTO owns technical remediation. Legal counsel on-site. Board briefed within 4 hours.",
    },
  },
  {
    id: "regulatory_ban",
    icon: Activity,
    label: "Regulatory Action",
    sub: "Core product feature banned in 3 primary markets",
    color: "#06b6d4",
    severity: "HIGH",
    impactVectors: [
      { label: "TAM Reduction", delta: -45, unit: "%" },
      { label: "Compliance Cost", delta: +120, unit: "%" },
      { label: "Revenue at Risk", delta: -35, unit: "%" },
    ],
    advisorResponses: {
      CEO: "Regulatory headwinds are a moat for compliant players who adapt first. Reframe this as a competitive advantage — build the compliance infrastructure that competitors cannot afford.",
      CFO: "Model the exact revenue impact market by market. Pivot resources to unregulated geographies immediately. Compliance budget must be treated as a growth investment, not a cost center.",
      CTO: "Build jurisdiction-aware feature flagging immediately. Architecture must be compliance-native going forward. This is a 60-day engineering sprint, not a product freeze.",
      "Risk Analyst": "Engage regulatory counsel in all 3 markets this week. File comments on rule-making where possible. Build a regulatory relationship strategy with trade associations.",
      Mentor: "Every constraint is a design constraint. The companies that master compliance in regulated markets become the default trusted choice. Lean into it.",
      Chairman: "EMERGENCY DIRECTIVE: Geo-pivot strategy activated. Focus 100% of growth resources on compliant markets. Compliance becomes core product narrative.",
    },
  },
];

const AGENT_COLORS = {
  CEO: "#6366f1",
  CFO: "#10b981",
  CTO: "#06b6d4",
  "Risk Analyst": "#f43f5e",
  Mentor: "#a855f7",
  Chairman: "#f59e0b",
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const WarRoomCrisisSimulator = ({ report, decision }) => {
  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentAdvisorIdx, setCurrentAdvisorIdx] = useState(0);
  const [revealedAdvisors, setRevealedAdvisors] = useState([]);
  const [emergencyPhase, setEmergencyPhase] = useState("idle");
  const [typedText, setTypedText] = useState("");
  const timerRef = useRef(null);
  const advisorKeys = Object.keys(AGENT_COLORS);

  const injectCrisis = (event) => {
    setSelectedEvent(event);
    setIsSimulating(false);
    setCurrentAdvisorIdx(0);
    setRevealedAdvisors([]);
    setTypedText("");
    setEmergencyPhase("alert");
    setTimeout(() => {
      setEmergencyPhase("briefing");
      setIsSimulating(true);
    }, 2200);
  };

  useEffect(() => {
    if (!isSimulating || emergencyPhase !== "briefing" || !selectedEvent) return;
    const advisorId = advisorKeys[currentAdvisorIdx];
    const fullText = selectedEvent.advisorResponses[advisorId] || "";
    let charIndex = 0;
    setTypedText("");

    const typeChar = () => {
      charIndex += 3;
      setTypedText(fullText.slice(0, charIndex));
      if (charIndex < fullText.length) {
        timerRef.current = setTimeout(typeChar, 22);
      } else {
        timerRef.current = setTimeout(() => {
          if (currentAdvisorIdx < advisorKeys.length - 1) {
            setRevealedAdvisors((prev) => [...prev, advisorId]);
            setCurrentAdvisorIdx((prev) => prev + 1);
          } else {
            setRevealedAdvisors(advisorKeys);
            setIsSimulating(false);
            setEmergencyPhase("resolved");
          }
        }, 1200);
      }
    };
    timerRef.current = setTimeout(typeChar, 300);
    return () => clearTimeout(timerRef.current);
  }, [isSimulating, currentAdvisorIdx, selectedEvent, emergencyPhase]);

  const reset = () => {
    clearTimeout(timerRef.current);
    setSelectedEvent(null);
    setIsSimulating(false);
    setCurrentAdvisorIdx(0);
    setRevealedAdvisors([]);
    setTypedText("");
    setEmergencyPhase("idle");
  };

  const currentAdvisorId = advisorKeys[currentAdvisorIdx];
  const currentColor = AGENT_COLORS[currentAdvisorId] || "#f59e0b";
  const eventColor = selectedEvent?.color || "#f43f5e";

  return (
    <>
      <motion.button
        onClick={() => setIsWarRoomOpen(true)}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        style={{
          width: "100%",
          padding: "20px 24px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%)",
          border: "1px solid rgba(244, 63, 94, 0.35)",
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
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 20% 50%, rgba(244, 63, 94, 0.15), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{
          width: "50px", height: "50px", borderRadius: "12px",
          background: "rgba(244, 63, 94, 0.18)", border: "1px solid rgba(244, 63, 94, 0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Zap size={24} color="#f43f5e" />
        </div>
        <div style={{ flexGrow: 1, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{
              fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.12em", color: "#f43f5e",
              background: "rgba(244, 63, 94, 0.15)", padding: "2px 8px",
              borderRadius: "4px", border: "1px solid rgba(244, 63, 94, 0.3)",
            }}>
              ⚠ War Room Protocol
            </span>
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "3px" }}>
            Inject Black Swan Event
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
            Stress-test your decision against extreme market shocks — instant board re-deliberation in Emergency Quorum Mode
          </p>
        </div>
        <ChevronRight size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
      </motion.button>

      <AnimatePresence>
        {isWarRoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0, 0, 0, 0.88)",
              backdropFilter: "blur(12px)",
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
                width: "100%", maxWidth: "900px",
                borderRadius: "20px",
                background: "linear-gradient(145deg, #0d1117 0%, #0b0e14 100%)",
                border: emergencyPhase === "alert" ? "2px solid #f43f5e" : "1px solid rgba(244, 63, 94, 0.4)",
                boxShadow: "0 40px 100px -20px rgba(244, 63, 94, 0.3), 0 0 0 1px rgba(255,255,255,0.04)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <AnimatePresence>
                {emergencyPhase === "alert" && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                      position: "absolute", inset: 0,
                      background: "rgba(244, 63, 94, 0.08)",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      zIndex: 100, gap: "16px",
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                    >
                      <AlertTriangle size={64} color="#f43f5e" />
                    </motion.div>
                    <div style={{
                      fontSize: "1.6rem", fontWeight: 900, color: "#f43f5e",
                      textTransform: "uppercase", letterSpacing: "0.15em",
                      fontFamily: "var(--font-mono)",
                    }}>
                      ⚠ EMERGENCY QUORUM ACTIVATED
                    </div>
                    <div style={{ fontSize: "1rem", color: "#fda4af", fontWeight: 600 }}>
                      {selectedEvent?.label}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                      Convening all 6 advisors for crisis re-deliberation...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div style={{
                padding: "24px 28px",
                borderBottom: "1px solid rgba(244, 63, 94, 0.25)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: emergencyPhase !== "idle" ? "linear-gradient(90deg, rgba(244, 63, 94, 0.1), transparent)" : "transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: "rgba(244, 63, 94, 0.18)", border: "1px solid rgba(244, 63, 94, 0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {emergencyPhase !== "idle" ? <Radio size={20} color="#f43f5e" /> : <AlertTriangle size={20} color="#f43f5e" />}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
                      War Room Crisis Simulator
                    </h2>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                      {emergencyPhase === "idle" ? "SELECT A BLACK SWAN EVENT TO INJECT"
                        : emergencyPhase === "alert" ? "⚡ EMERGENCY QUORUM ACTIVATING..."
                        : emergencyPhase === "briefing" ? `🔴 LIVE RE-DELIBERATION — ${currentAdvisorId} SPEAKING`
                        : "✅ CRISIS RESPONSE COMPLETE — BOARD DIRECTIVE ISSUED"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {emergencyPhase !== "idle" && (
                    <button onClick={reset} style={{
                      padding: "7px 14px", borderRadius: "8px",
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}>
                      <RotateCcw size={13} /> New Event
                    </button>
                  )}
                  <button
                    onClick={() => { reset(); setIsWarRoomOpen(false); }}
                    style={{
                      width: "34px", height: "34px", borderRadius: "8px",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#94a3b8", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div style={{ padding: "28px" }}>
                {emergencyPhase === "idle" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "20px" }}>
                      Select a catastrophic market event to stress-test how your board decision holds up under extreme pressure:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "14px" }}>
                      {BLACK_SWAN_EVENTS.map((event) => {
                        const Icon = event.icon;
                        return (
                          <motion.button
                            key={event.id}
                            onClick={() => injectCrisis(event)}
                            whileHover={{ scale: 1.03, y: -3 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                              padding: "18px", borderRadius: "12px",
                              background: `linear-gradient(135deg, ${event.color}14 0%, rgba(0,0,0,0) 100%)`,
                              border: `1px solid ${event.color}44`,
                              cursor: "pointer", textAlign: "left",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                              <div style={{
                                width: "38px", height: "38px", borderRadius: "9px",
                                background: `${event.color}22`, border: `1px solid ${event.color}55`,
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                              }}>
                                <Icon size={18} color={event.color} />
                              </div>
                              <div>
                                <span style={{
                                  fontSize: "0.62rem", fontWeight: 800,
                                  textTransform: "uppercase", color: event.color, letterSpacing: "0.08em",
                                }}>
                                  {event.severity}
                                </span>
                                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>
                                  {event.label}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "3px" }}>
                                  {event.sub}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {(emergencyPhase === "briefing" || emergencyPhase === "resolved") && selectedEvent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{
                      padding: "14px 18px", borderRadius: "10px",
                      background: `linear-gradient(135deg, ${eventColor}15, rgba(0,0,0,0))`,
                      border: `1px solid ${eventColor}44`,
                      marginBottom: "24px",
                      display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap",
                    }}>
                      {(() => { const Icon = selectedEvent.icon; return <Icon size={22} color={eventColor} />; })()}
                      <div>
                        <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.95rem" }}>{selectedEvent.label}</div>
                        <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{selectedEvent.sub}</div>
                      </div>
                      <div style={{ marginLeft: "auto", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {selectedEvent.impactVectors.map((v) => (
                          <div key={v.label} style={{
                            padding: "4px 10px", borderRadius: "6px",
                            background: "rgba(0,0,0,0.4)", border: `1px solid ${eventColor}33`,
                            fontSize: "0.72rem", color: "#e2e8f0",
                          }}>
                            <span style={{ color: "#94a3b8" }}>{v.label}: </span>
                            <span style={{ fontWeight: 800, color: v.delta < 0 ? "#f43f5e" : "#10b981", fontFamily: "var(--font-mono)" }}>
                              {v.delta > 0 ? "+" : ""}{v.delta}{v.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {emergencyPhase === "briefing" && (
                      <div style={{
                        padding: "22px", borderRadius: "12px",
                        background: `linear-gradient(135deg, ${currentColor}10 0%, rgba(0,0,0,0) 100%)`,
                        border: `1px solid ${currentColor}44`,
                        marginBottom: "20px", minHeight: "120px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                          <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 8px #f43f5e" }}
                          />
                          <span style={{
                            fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase",
                            color: currentColor, fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
                          }}>
                            {currentAdvisorId} — Crisis Response
                          </span>
                          <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: "2px", height: "14px" }}>
                            {[0.4, 1, 0.6, 0.8, 0.3].map((h, i) => (
                              <motion.div
                                key={i}
                                animate={{ scaleY: [h, 1, h * 0.5, 1, h] }}
                                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                                style={{ width: "3px", height: "14px", background: currentColor, borderRadius: "2px", transformOrigin: "bottom" }}
                              />
                            ))}
                          </div>
                        </div>
                        <p style={{ fontSize: "0.9rem", color: "#e2e8f0", lineHeight: "1.7", fontFamily: "var(--font-mono)" }}>
                          {typedText}
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            style={{ display: "inline-block", width: "2px", height: "14px", background: currentColor, marginLeft: "2px", verticalAlign: "middle" }}
                          />
                        </p>
                      </div>
                    )}

                    {revealedAdvisors.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                        {revealedAdvisors.map((advisorId) => {
                          const color = AGENT_COLORS[advisorId];
                          return (
                            <motion.div
                              key={advisorId}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              style={{
                                padding: "14px", borderRadius: "10px",
                                background: `${color}0e`, border: `1px solid ${color}33`,
                              }}
                            >
                              <div style={{ fontSize: "0.7rem", fontWeight: 800, color, textTransform: "uppercase", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
                                ✓ {advisorId}
                              </div>
                              <p style={{ fontSize: "0.78rem", color: "#cbd5e1", lineHeight: "1.5" }}>
                                {selectedEvent.advisorResponses[advisorId]}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {emergencyPhase === "resolved" && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: "18px 22px", borderRadius: "12px",
                          background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)",
                          display: "flex", alignItems: "center", gap: "14px",
                        }}
                      >
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "10px",
                          background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <Activity size={20} color="#10b981" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: "#34d399", marginBottom: "3px" }}>
                            Board Crisis Response Complete
                          </div>
                          <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                            All 6 advisors have issued emergency directives. Your decision was stress-tested against{" "}
                            <strong style={{ color: "#e2e8f0" }}>{selectedEvent.label}</strong>.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
