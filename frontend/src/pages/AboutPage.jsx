import React, { useState } from "react";
import { 
  Compass, 
  Briefcase, 
  DollarSign, 
  Cpu, 
  ShieldAlert, 
  HeartHandshake, 
  Gavel, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle2, 
  Database, 
  Layers, 
  Target, 
  ChevronDown, 
  ChevronUp,
  PlusCircle,
  Activity
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const AboutPage = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const { t } = useLanguage();

  const steps = [
    {
      num: "01",
      title: t("about.step1_title", "Frame Your Strategic Dilemma"),
      desc: t("about.step1_desc", "Define the fork in the road. Specify constraints such as cash runway, risk tolerance, goals, and the competing paths under consideration."),
      tag: t("about.step1_tag", "Input Stage")
    },
    {
      num: "02",
      title: t("about.step2_title", "Convene the Autonomous Board"),
      desc: t("about.step2_desc", "The Decision Analyzer triggers 5 specialized AI advisors in parallel. Each advisor applies a rigorous mental model."),
      tag: t("about.step2_tag", "Parallel Deliberation")
    },
    {
      num: "03",
      title: t("about.step3_title", "Cross-Examination & Chairman Verdict"),
      desc: t("about.step3_desc", "Advisors challenge each other's assumptions. The Chairman synthesizes a binding strategic verdict, confidence score, and execution blueprint."),
      tag: t("about.step3_tag", "Synthesis")
    },
    {
      num: "04",
      title: t("about.step4_title", "Log Outcomes to Vector Memory"),
      desc: t("about.step4_desc", "Log what actually happened. Realized outcomes are embedded into ChromaDB Vector Memory, making future board meetings smarter."),
      tag: t("about.step4_tag", "Continuous Learning")
    }
  ];

  const advisors = [
    {
      role: "CEO Advisor",
      title: "Chief Executive Officer",
      focus: "Asymmetric Upside & Vision",
      icon: Briefcase,
      color: "#f59e0b",
      motto: "Maximizes compounding leverage, strategic market positioning, and career equity.",
      whenToListen: "When evaluating 5-year growth trajectories and high-upside opportunities."
    },
    {
      role: "CFO Advisor",
      title: "Chief Financial Officer",
      focus: "Capital Runway & ROI Discipline",
      icon: DollarSign,
      color: "#10b981",
      motto: "Stress-tests cash flow, risk-adjusted compensation, and liquid buffer requirements.",
      whenToListen: "When evaluating unvested equity vs liquid salary, burn rates, and financial safety."
    },
    {
      role: "CTO Advisor",
      title: "Chief Technology Officer",
      focus: "Skills Mastery & Tech Velocity",
      icon: Cpu,
      color: "#06b6d4",
      motto: "Accelerates technical architecture mastery and prevents skill obsolescence.",
      whenToListen: "When evaluating technology stacks, engineering velocity, and learning curve moats."
    },
    {
      role: "Risk Analyst",
      title: "Chief Risk Officer",
      focus: "Pre-Mortem & Downside Defense",
      icon: ShieldAlert,
      color: "#f43f5e",
      motto: "Identifies systemic failure modes and installs non-negotiable 90-day tripwires.",
      whenToListen: "Before executing irreversible transitions to protect against worst-case scenarios."
    },
    {
      role: "Mentor Advisor",
      title: "Personal Life Mentor",
      focus: "Core Values & Fulfillment",
      icon: HeartHandshake,
      color: "#a855f7",
      motto: "Anchors decisions to authentic personal values, psychological stamina, and fulfillment.",
      whenToListen: "When balancing intense ambition with family life, personal energy, and long-term peace."
    },
    {
      role: "Chairman",
      title: "Chairman of the Board",
      focus: "Consensus & Binding Verdict",
      icon: Gavel,
      color: "#ff6a00",
      motto: "Reconciles conflicting perspectives and issues the final strategic execution blueprint.",
      whenToListen: "When you need a single, clear, decisive synthesis with an action roadmap."
    }
  ];

  const faqs = [
    {
      q: "How is DecisionOS different from asking ChatGPT or Claude directly?",
      a: "Standard chatbots generate a single, generalized response that often averages out contradictory opinions. DecisionOS simulates an executive board where specialized agents debate each other (e.g. CFO advocates for cash safety while CEO pushes for aggressive upside), surfacing hidden trade-offs and pre-mortem risks that single prompts miss."
    },
    {
      q: "How does the ChromaDB Long-Term Memory work?",
      a: "When you log retrospective outcomes months after making a decision (e.g. 'I took the startup offer; ownership was great, but runway was tighter than expected'), DecisionOS embeds that reflection into a local vector database. When you face future decisions, relevant past lessons are retrieved automatically and injected into the board's context."
    },
    {
      q: "What types of decisions can I bring to the board?",
      a: "DecisionOS is designed for high-stakes, multi-variable decisions: career forks (e.g. startup vs corporate), founder pivots, fund-raising timing, major relocations, capital allocations, and executive team hiring."
    },
    {
      q: "Can I connect my own local LLMs (Ollama) or OpenAI API key?",
      a: "Yes! DecisionOS has built-in support for simulated mode (zero API keys required), local Ollama instances (e.g. Llama 3, Mistral), and OpenAI (GPT-4o). You can configure your provider in the backend .env configuration."
    }
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 24px 64px" }}>
      {/* Top Editorial Banner */}
      <div style={{
        padding: "40px 36px",
        background: "#15120d",
        border: "1px solid var(--border-medium)",
        borderRadius: "16px",
        marginBottom: "44px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #f59e0b, transparent)"
        }} />

        <div style={{ maxWidth: "800px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "20px", background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", marginBottom: "16px" }}>
            <Compass size={14} color="#f59e0b" />
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#f59e0b", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              How It Works & Guide
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)", fontWeight: 900, lineHeight: "1.15", letterSpacing: "-0.03em", marginBottom: "16px" }}>
            How DecisionOS Powers <br />
            <span className="gradient-text-amber">Clear Advice for Important Decisions</span>
          </h1>

          <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            DecisionOS gives you six AI advisors to help with important life and business decisions. They compare your choices, explain the risks, and help you decide what to do next.
          </p>
        </div>
      </div>

      {/* 4-Step Walkthrough Section */}
      <div style={{ marginBottom: "56px" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="track-number">WORKFLOW</span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
              • 4-STEP STRATEGIC LIFECYCLE
            </span>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
            How to Use DecisionOS in 4 Simple Steps
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {steps.map((step) => (
            <div
              key={step.num}
              className="rzp-card"
              style={{ padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span className="track-number">{step.num}</span>
                  <span className="rzp-pill">{step.tag}</span>
                </div>

                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "10px", color: "#ffffff" }}>
                  {step.title}
                </h3>

                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The 6 Board Members Roster */}
      <div style={{ marginBottom: "56px" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="track-number">THE ROSTER</span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
              • 6 SPECIALIZED LENSES
            </span>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
            Meet Your Board of Directors
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Each advisor looks at your decision from a different point of view.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "18px" }}>
          {advisors.map((advisor, idx) => {
            const AdvisorIcon = advisor.icon;

            return (
              <div
                key={advisor.role}
                className="rzp-card"
                style={{ padding: "24px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <div style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: `${advisor.color}18`,
                    border: `1px solid ${advisor.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <AdvisorIcon size={22} color={advisor.color} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.08rem", fontWeight: 800, color: "#ffffff" }}>
                      {advisor.role}
                    </h4>
                    <p style={{ fontSize: "0.78rem", color: advisor.color, fontWeight: 700 }}>
                      {advisor.focus}
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: "0.88rem", color: "#f1ede7", lineHeight: "1.5", marginBottom: "14px" }}>
                  {advisor.motto}
                </p>

                <div style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)"
                }}>
                  <strong style={{ color: "#ffffff" }}>When to prioritize:</strong> {advisor.whenToListen}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div style={{ marginBottom: "56px" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="track-number">FAQ</span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
              • FREQUENTLY ASKED QUESTIONS
            </span>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
            Understanding the Platform
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <div
                key={idx}
                className="rzp-card"
                style={{ padding: "18px 22px", cursor: "pointer" }}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: isOpen ? "#f59e0b" : "#ffffff" }}>
                    {faq.q}
                  </h4>
                  {isOpen ? <ChevronUp size={18} color="#f59e0b" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>

                {isOpen && (
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Creator & Lead Architect Profile (Utkarsh Rai) */}
      <div style={{
        padding: "28px 32px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        marginBottom: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #6366f1 0%, #f59e0b 100%)",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: "1.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 25px rgba(99, 102, 241, 0.4)",
            flexShrink: 0
          }}>
            UR
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#ffffff" }}>
                Utkarsh Rai
              </h3>
              <span style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                padding: "2px 10px",
                borderRadius: "6px",
                background: "rgba(99, 102, 241, 0.2)",
                color: "#a5b4fc",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.06em"
              }}>
                Creator & Lead Architect
              </span>
            </div>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.5", maxWidth: "560px" }}>
              DecisionOS was built to bring six different AI viewpoints together and turn them into clear, practical advice.
            </p>
          </div>
        </div>

        {/* Contact Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <a
            href="https://www.linkedin.com/in/utkarsh-rai-3236281b4/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "10px",
              background: "rgba(10, 102, 194, 0.2)",
              border: "1px solid rgba(10, 102, 194, 0.5)",
              color: "#38bdf8",
              fontSize: "0.85rem",
              fontWeight: 800,
              textDecoration: "none"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span>LinkedIn Profile</span>
          </a>

          <a
            href="https://github.com/Shaaan2005"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 800,
              textDecoration: "none"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>GitHub (@Shaaan2005)</span>
          </a>

          <a
            href="tel:+918287350252"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.5)",
              color: "#34d399",
              fontSize: "0.85rem",
              fontWeight: 800,
              textDecoration: "none"
            }}
          >
            <span>📞 +91 8287350252</span>
          </a>

          <a
            href="mailto:utkarsh23101@iiitnr.edu.in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.18)",
              border: "1px solid rgba(245, 158, 11, 0.5)",
              color: "#fbbf24",
              fontSize: "0.85rem",
              fontWeight: 800,
              textDecoration: "none"
            }}
          >
            <span>✉️ utkarsh23101@iiitnr.edu.in</span>
          </a>

          <a
            href="mailto:utbalbharati@gmail.com"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#e2e8f0",
              fontSize: "0.85rem",
              fontWeight: 800,
              textDecoration: "none"
            }}
          >
            <span>✉️ utbalbharati@gmail.com</span>
          </a>
        </div>
      </div>




      {/* Ready to Convene CTA Banner */}
      <div style={{
        padding: "36px",
        background: "linear-gradient(135deg, #1c1812 0%, #15120d 100%)",
        border: "1px solid var(--border-amber)",
        borderRadius: "14px",
        textAlign: "center"
      }}>
        <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff", marginBottom: "10px" }}>
          Ready to Stress-Test Your Next Big Decision?
        </h3>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "580px", margin: "0 auto 24px", lineHeight: "1.6" }}>
          Describe your decision in 60 seconds and get advice from six AI advisors.
        </p>
        <button
          onClick={onGetStarted}
          className="btn-primary"
          style={{ padding: "12px 28px", fontSize: "1rem" }}
        >
          <PlusCircle size={18} />
          <span>Convene Your Board Meeting Now</span>
        </button>
      </div>
    </div>
  );
};

