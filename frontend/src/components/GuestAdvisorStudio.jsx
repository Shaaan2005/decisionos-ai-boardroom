import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Sparkles, ChevronRight, RotateCcw } from "lucide-react";

// ─── Iconic Guest Advisor Profiles ──────────────────────────────────────────
const GUEST_ADVISORS = [
  {
    id: "first_principles",
    emoji: "🚀",
    name: "The First-Principles Engineer",
    persona: "Elon Musk Archetype",
    tagline: "Question every requirement. Remove all that is unnecessary.",
    color: "#6366f1",
    glowColor: "rgba(99, 102, 241, 0.4)",
    philosophy: "10x thinking, vertical integration, aggressive timeline compression",
    badge: "Velocity",
    traits: ["First-principles reasoning", "Extreme ownership", "Remove unnecessary steps", "Hardware-software convergence"],
    deliberate: (decisionTitle, options) => [
      `The stated requirements for "${decisionTitle}" are almost certainly wrong. Start from physics. What is the ideal outcome if cost, time, and personnel were infinite? Now work backwards.`,
      `Option analysis: "${options[0] || "Option A"}" has at least 3 unnecessary steps that exist only because "that's how it's always been done." Remove them. The correct path is ${Math.floor(Math.random() * 40 + 30)}% faster than what's currently on the table.`,
      `DIRECTIVE: Pick the option that compresses timeline by 10x. If neither does, redesign the options. Build the rocket yourself if you have to. Most people dramatically underestimate what a focused team can accomplish in 90 days.`,
    ],
  },
  {
    id: "value_allocator",
    emoji: "📈",
    name: "The Value & Moat Allocator",
    persona: "Warren Buffett / Charlie Munger Archetype",
    tagline: "Buy wonderful at fair. Never buy fair at any price.",
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.4)",
    philosophy: "Durable competitive moats, margin of safety, long-term compounding",
    badge: "Compounding",
    traits: ["Economic moat identification", "Margin of safety", "Circle of competence", "Inversion thinking"],
    deliberate: (decisionTitle, options) => [
      `Charlie and I always ask: "What are the five ways this can go catastrophically wrong?" For "${decisionTitle}", the biggest risk is not the downside scenario — it's not having the optionality to recover from it.`,
      `On the options: What's the durable competitive advantage each creates 10 years from now? Temporary advantages are noise. We want moats — network effects, switching costs, intangible assets, or cost advantages that compound silently.`,
      `DIRECTIVE: Choose the option with the largest margin of safety and longest compounding runway. Invert: which option, if chosen wrongly, is most recoverable from? That's your answer. Never bet the enterprise on an irreversible decision without 90% conviction.`,
    ],
  },
  {
    id: "leverage_thinker",
    emoji: "🧘",
    name: "The Philosophical Leverage Thinker",
    persona: "Naval Ravikant Archetype",
    tagline: "Specific knowledge + leverage + accountability = wealth without selling time.",
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.4)",
    philosophy: "Permissionless leverage, specific knowledge, code and capital not labor",
    badge: "Leverage",
    traits: ["Permissionless leverage", "Specific knowledge", "Long-term games", "Equity not salary"],
    deliberate: (decisionTitle, options) => [
      `The key question for "${decisionTitle}" is not which option maximizes short-term output — it's which option builds the most specific, irreplaceable knowledge and leverage over time. Knowledge that cannot be taught, only earned.`,
      `Most people optimize for money. The enlightened optimize for equity, optionality, and leverage. "${options[0] || "Option A"}" or "${options[1] || "Option B"}" — which one gives you code, media, or capital leverage that scales without you? That's the one.`,
      `DIRECTIVE: Choose the option that creates the most asymmetric upside — where your downside is bounded but your upside is uncapped. Play long-term games with long-term people. The compounding of reputation and relationships dwarfs any short-term financial gain.`,
    ],
  },
  {
    id: "product_visionary",
    emoji: "🎨",
    name: "The Obsessive Product Visionary",
    persona: "Steve Jobs Archetype",
    tagline: "Design is not what it looks like. It's how it works.",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.4)",
    philosophy: "Taste, elegance, user delight, simplicity as the ultimate sophistication",
    badge: "Taste",
    traits: ["User obsession", "Radical simplicity", "Taste-driven design", "Say no to 1000 things"],
    deliberate: (decisionTitle, options) => [
      `People don't know what they want until you show it to them. For "${decisionTitle}", the right answer is not the one that checks the most boxes — it's the one that creates a product experience so perfectly considered that customers feel it was made specifically for them.`,
      `Looking at the options: we must ask — which is the most elegant? Not pretty. Elegant. Which one, when stripped of all the feature bloat and edge cases, creates an experience that makes someone say "of course, why would it ever be any other way?"`,
      `DIRECTIVE: Say no to 1000 things. The option that simplifies, that creates one magical moment of delight, that respects the customer's intelligence — that's the only option worth choosing. Focus is the most powerful creative act. Build it, then make it insanely great.`,
    ],
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export const GuestAdvisorStudio = ({ report, decision }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [deliberationLines, setDeliberationLines] = useState([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef(null);

  const decisionTitle = decision?.title || "your strategic decision";
  const options = report?.options_analyzed || ["Option A", "Option B"];

  const startDeliberation = (advisor) => {
    setSelectedAdvisor(advisor);
    const lines = advisor.deliberate(decisionTitle, options);
    setDeliberationLines(lines);
    setCurrentLineIdx(0);
    setTypedText("");
    setIsDone(false);
    setIsSimulating(true);
  };

  useEffect(() => {
    if (!isSimulating || !deliberationLines.length) return;
    const fullText = deliberationLines[currentLineIdx] || "";
    let charIndex = 0;
    setTypedText("");

    const typeChar = () => {
      charIndex += 4;
      setTypedText(fullText.slice(0, charIndex));
      if (charIndex < fullText.length) {
        timerRef.current = setTimeout(typeChar, 18);
      } else {
        timerRef.current = setTimeout(() => {
          if (currentLineIdx < deliberationLines.length - 1) {
            setCurrentLineIdx((prev) => prev + 1);
          } else {
            setIsSimulating(false);
            setIsDone(true);
          }
        }, 1400);
      }
    };
    timerRef.current = setTimeout(typeChar, 400);
    return () => clearTimeout(timerRef.current);
  }, [isSimulating, currentLineIdx, deliberationLines]);

  const reset = () => {
    clearTimeout(timerRef.current);
    setSelectedAdvisor(null);
    setDeliberationLines([]);
    setCurrentLineIdx(0);
    setTypedText("");
    setIsSimulating(false);
    setIsDone(false);
  };

  const color = selectedAdvisor?.color || "#6366f1";

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
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.06) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.35)",
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
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 25% 50%, rgba(99, 102, 241, 0.15), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{
          width: "50px", height: "50px", borderRadius: "12px",
          background: "rgba(99, 102, 241, 0.18)", border: "1px solid rgba(99, 102, 241, 0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          fontSize: "1.5rem",
        }}>
          👥
        </div>
        <div style={{ flexGrow: 1, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{
              fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.12em", color: "#a5b4fc",
              background: "rgba(99, 102, 241, 0.15)", padding: "2px 8px",
              borderRadius: "4px", border: "1px solid rgba(99, 102, 241, 0.3)",
            }}>
              ✦ Guest Advisor Studio
            </span>
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "3px" }}>
            Summon Iconic AI Board Members
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
            Get a live deliberation from legendary archetypes — First-Principles Engineer, Value Allocator, Leverage Thinker, Product Visionary
          </p>
        </div>
        <ChevronRight size={18} color="#a5b4fc" style={{ flexShrink: 0 }} />
      </motion.button>

      {/* Studio Modal */}
      <AnimatePresence>
        {isOpen && (
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
                width: "100%", maxWidth: "860px",
                borderRadius: "20px",
                background: "linear-gradient(145deg, #0d1117 0%, #0b0e14 100%)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                boxShadow: "0 40px 100px -20px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(255,255,255,0.04)",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div style={{
                padding: "24px 28px",
                borderBottom: "1px solid rgba(99, 102, 241, 0.18)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "linear-gradient(90deg, rgba(99, 102, 241, 0.08), transparent)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: "rgba(99, 102, 241, 0.18)", border: "1px solid rgba(99, 102, 241, 0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.2rem",
                  }}>
                    👥
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
                      Guest Advisor Studio
                    </h2>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                      {!selectedAdvisor
                        ? "CHOOSE AN ICONIC ARCHETYPE TO SUMMON"
                        : isSimulating
                        ? `🔴 LIVE — ${selectedAdvisor.name.toUpperCase()} DELIBERATING`
                        : isDone
                        ? "✅ GUEST DELIBERATION COMPLETE"
                        : "READY"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {selectedAdvisor && (
                    <button onClick={reset} style={{
                      padding: "7px 14px", borderRadius: "8px",
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}>
                      <RotateCcw size={13} /> Choose Different
                    </button>
                  )}
                  <button
                    onClick={() => { reset(); setIsOpen(false); }}
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
                {/* Advisor Selection Grid */}
                {!selectedAdvisor && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "20px" }}>
                      Each legendary archetype brings a distinct mental model and decision-making philosophy to your dilemma:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                      {GUEST_ADVISORS.map((advisor) => (
                        <motion.button
                          key={advisor.id}
                          onClick={() => startDeliberation(advisor)}
                          whileHover={{ scale: 1.03, y: -4 }}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            padding: "22px",
                            borderRadius: "14px",
                            background: `linear-gradient(135deg, ${advisor.color}12 0%, rgba(0,0,0,0) 100%)`,
                            border: `1px solid ${advisor.color}44`,
                            cursor: "pointer",
                            textAlign: "left",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <motion.div
                            animate={{ opacity: [0.04, 0.12, 0.04] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{
                              position: "absolute", inset: 0,
                              background: `radial-gradient(circle at 30% 30%, ${advisor.color}20, transparent 65%)`,
                              pointerEvents: "none",
                            }}
                          />
                          <div style={{ position: "relative", zIndex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                              <div style={{
                                width: "46px", height: "46px", borderRadius: "12px",
                                background: `${advisor.color}22`, border: `1px solid ${advisor.color}55`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.6rem", flexShrink: 0,
                              }}>
                                {advisor.emoji}
                              </div>
                              <div>
                                <div style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", color: advisor.color, letterSpacing: "0.08em" }}>
                                  {advisor.badge} • {advisor.persona}
                                </div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>
                                  {advisor.name}
                                </div>
                              </div>
                            </div>
                            <p style={{ fontSize: "0.78rem", color: "#94a3b8", fontStyle: "italic", marginBottom: "12px", lineHeight: "1.5" }}>
                              "{advisor.tagline}"
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                              {advisor.traits.map((t) => (
                                <span key={t} style={{
                                  fontSize: "0.62rem", fontWeight: 700,
                                  padding: "2px 8px", borderRadius: "4px",
                                  background: `${advisor.color}18`, color: advisor.color,
                                  border: `1px solid ${advisor.color}33`,
                                }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Deliberation Panel */}
                {selectedAdvisor && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Advisor Banner */}
                    <div style={{
                      padding: "16px 20px", borderRadius: "12px",
                      background: `linear-gradient(135deg, ${color}14, rgba(0,0,0,0))`,
                      border: `1px solid ${color}44`,
                      marginBottom: "24px",
                      display: "flex", alignItems: "center", gap: "14px",
                    }}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "12px",
                        background: `${color}22`, border: `1px solid ${color}55`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.7rem", flexShrink: 0,
                      }}>
                        {selectedAdvisor.emoji}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "1rem" }}>{selectedAdvisor.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{selectedAdvisor.persona}</div>
                      </div>
                      <div style={{ marginLeft: "auto" }}>
                        <span style={{
                          fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase",
                          padding: "4px 10px", borderRadius: "6px",
                          background: `${color}18`, color: color,
                          border: `1px solid ${color}44`, letterSpacing: "0.08em",
                        }}>
                          {selectedAdvisor.badge} Mindset
                        </span>
                      </div>
                    </div>

                    {/* Completed lines */}
                    {deliberationLines.slice(0, currentLineIdx).map((line, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: "16px 20px", borderRadius: "10px",
                          background: `${color}0c`, border: `1px solid ${color}22`,
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: `${color}cc`, textTransform: "uppercase", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
                          Point {idx + 1}
                        </div>
                        <p style={{ fontSize: "0.88rem", color: "#e2e8f0", lineHeight: "1.7" }}>{line}</p>
                      </motion.div>
                    ))}

                    {/* Current typing line */}
                    {isSimulating && (
                      <div style={{
                        padding: "20px", borderRadius: "12px",
                        background: `linear-gradient(135deg, ${color}15 0%, rgba(0,0,0,0) 100%)`,
                        border: `1px solid ${color}55`,
                        marginBottom: "12px",
                        boxShadow: `0 0 20px ${color}15`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                          <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 8px #f43f5e" }}
                          />
                          <span style={{
                            fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase",
                            color, fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
                          }}>
                            Point {currentLineIdx + 1} of {deliberationLines.length}
                          </span>
                          <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: "2px", height: "14px" }}>
                            {[0.5, 0.9, 0.6, 1, 0.4, 0.7].map((h, i) => (
                              <motion.div
                                key={i}
                                animate={{ scaleY: [h, 1, h * 0.4, 0.8, h] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                style={{ width: "3px", height: "14px", background: color, borderRadius: "2px", transformOrigin: "bottom" }}
                              />
                            ))}
                          </div>
                        </div>
                        <p style={{ fontSize: "0.9rem", color: "#e2e8f0", lineHeight: "1.7" }}>
                          {typedText}
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            style={{ display: "inline-block", width: "2px", height: "15px", background: color, marginLeft: "2px", verticalAlign: "middle" }}
                          />
                        </p>
                      </div>
                    )}

                    {/* Done State */}
                    {isDone && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: "18px 22px", borderRadius: "12px",
                          background: `linear-gradient(135deg, ${color}10, rgba(0,0,0,0))`,
                          border: `1px solid ${color}44`,
                          display: "flex", alignItems: "center", gap: "14px",
                        }}
                      >
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "10px",
                          background: `${color}20`, border: `1px solid ${color}55`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "1.4rem", flexShrink: 0,
                        }}>
                          {selectedAdvisor.emoji}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color, marginBottom: "3px" }}>
                            {selectedAdvisor.name} — Deliberation Complete
                          </div>
                          <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                            You've heard the {selectedAdvisor.persona}'s perspective through the lens of <strong style={{ color: "#e2e8f0" }}>{selectedAdvisor.philosophy}</strong>. Add this to your board's consideration.
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
