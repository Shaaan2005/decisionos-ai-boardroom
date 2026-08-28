import React from "react";
import { 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Cpu, 
  LayoutDashboard, 
  PlusCircle, 
  User, 
  HelpCircle, 
  Command,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const Footer = ({ onNavigate, onOpenPalette }) => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: "linear-gradient(180deg, rgba(19, 15, 11, 0.9) 0%, rgba(8, 6, 4, 0.99) 100%)",
      borderTop: "1px solid rgba(255, 255, 255, 0.12)",
      padding: "56px 24px 32px",
      marginTop: "80px",
      position: "relative",
      zIndex: 10
    }}>
      {/* Crisp Glowing Amber/Indigo Horizon Divider Line */}
      <div style={{
        position: "absolute",
        top: "-1px",
        left: "5%",
        right: "5%",
        height: "2px",
        background: "linear-gradient(90deg, transparent 0%, #f59e0b 35%, #6366f1 65%, transparent 100%)",
        boxShadow: "0 0 15px rgba(245, 158, 11, 0.6), 0 0 30px rgba(99, 102, 241, 0.4)"
      }} />

      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "36px",
        marginBottom: "40px"
      }}>
        {/* Column 1: Brand & Mission */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(245, 158, 11, 0.4)"
            }}>
              <Compass size={18} color="#0b0907" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: "1.2rem", fontWeight: 900, letterSpacing: "-0.03em" }}>
              Decision<span style={{ color: "#f59e0b" }}>OS</span>
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "16px", maxWidth: "320px" }}>
            Autonomous AI Personal Board of Directors. Powered by multi-agent dialectic consensus to help founders and executives navigate high-stakes dilemmas.
          </p>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 10px",
            borderRadius: "20px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            fontSize: "0.74rem",
            color: "#34d399",
            fontWeight: 700
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span>All 6 Advisory Nodes Operational</span>
          </div>
        </div>

        {/* Column 2: Platform Navigation */}
        <div>
          <h4 style={{ fontSize: "0.88rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ffffff", marginBottom: "16px" }}>
            Platform Navigation
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { id: "dashboard", label: "Executive Cockpit", icon: LayoutDashboard },
              { id: "new-decision", label: "New Dilemma (+)", icon: PlusCircle },
              { id: "memory-vault", label: "Memory Vault (ChromaDB)", icon: Database },
              { id: "about", label: "How It Works & Guide", icon: HelpCircle },
              { id: "profile", label: "Profile & Values", icon: User },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate && onNavigate(item.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "color 0.15s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  <item.icon size={14} color="var(--accent-primary)" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: The 6 AI Executive Advisors */}
        <div>
          <h4 style={{ fontSize: "0.88rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ffffff", marginBottom: "16px" }}>
            Advisory Quorum
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { name: "CEO Advisor", focus: "Strategy & 10x Scale", color: "#6366f1" },
              { name: "CFO Advisor", focus: "Capital & Runway Defense", color: "#10b981" },
              { name: "CTO Advisor", focus: "Tech Velocity & Architecture", color: "#06b6d4" },
              { name: "Risk Analyst", focus: "Pre-Mortem Safeguards", color: "#f43f5e" },
              { name: "Mentor Advisor", focus: "Core Values & Stamina", color: "#a855f7" },
              { name: "Chairman", focus: "Binding Verdict Arbiter", color: "#f59e0b" },
            ].map((adv) => (
              <div key={adv.name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: adv.color }} />
                <strong style={{ color: "#e2e8f0" }}>{adv.name}</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.74rem" }}>• {adv.focus}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: Security & Shortcuts */}
        <div>
          <h4 style={{ fontSize: "0.88rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ffffff", marginBottom: "16px" }}>
            Security & Controls
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={16} color="#10b981" />
              <span>Zero Model Retraining on User Data</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Database size={16} color="#06b6d4" />
              <span>AES-GCM-256 Vector Vault Privacy</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Cpu size={16} color="#a855f7" />
              <span>LangGraph v2.4 Orchestration Engine</span>
            </div>

            {onOpenPalette && (
              <button
                onClick={onOpenPalette}
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "#cbd5e1",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Command size={13} color="#f59e0b" />
                  <span>Quick Action Palette</span>
                </div>
                <kbd style={{
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: "rgba(0, 0, 0, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "#f59e0b"
                }}>
                  ⌘K / Ctrl+K
                </kbd>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Creator & Architect Banner (Utkarsh Rai) */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto 24px",
        padding: "16px 22px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1 0%, #f59e0b 100%)",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)"
          }}>
            UR
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#ffffff" }}>
                Crafted & Engineered by Utkarsh Rai
              </span>
              <span style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
                background: "rgba(99, 102, 241, 0.2)",
                color: "#a5b4fc",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                textTransform: "uppercase"
              }}>
                Lead Architect
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
              AI Systems Engineer & Full-Stack Architect • Open for opportunities & collaborations
            </p>
          </div>
        </div>

        {/* Social & Contact Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* LinkedIn Button */}
          <a
            href="https://www.linkedin.com/in/utkarsh-rai-3236281b4/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 14px",
              borderRadius: "8px",
              background: "rgba(10, 102, 194, 0.18)",
              border: "1px solid rgba(10, 102, 194, 0.45)",
              color: "#38bdf8",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(10, 102, 194, 0.35)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(10, 102, 194, 0.18)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span>LinkedIn Profile</span>
          </a>

          {/* GitHub Button */}
          <a
            href="https://github.com/Shaaan2005"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 14px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.16)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>GitHub (@Shaaan2005)</span>
          </a>

          {/* Phone / Call Button */}
          <a
            href="tel:+918287350252"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 14px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.18)",
              border: "1px solid rgba(16, 185, 129, 0.45)",
              color: "#34d399",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.35)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.18)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>📞 +91 8287350252</span>
          </a>

          {/* Academic Email Button */}
          <a
            href="mailto:utkarsh23101@iiitnr.edu.in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 14px",
              borderRadius: "8px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "#fbbf24",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245, 158, 11, 0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(245, 158, 11, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>✉️ utkarsh23101@iiitnr.edu.in</span>
          </a>

          {/* Personal Email Button */}
          <a
            href="mailto:utbalbharati@gmail.com"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 14px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#e2e8f0",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>✉️ utbalbharati@gmail.com</span>
          </a>
        </div>
      </div>



      {/* Bottom Bar */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        paddingTop: "20px",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        fontSize: "0.78rem",
        color: "var(--text-muted)"
      }}>
        <div>
          © {currentYear} <strong>DecisionOS Inc.</strong> • Designed & Built with precision by <strong style={{ color: "#ffffff" }}>Utkarsh Rai</strong>.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Service</span>
          <span>•</span>
          <span>Enterprise SLA</span>
        </div>
      </div>
    </footer>
  );
};
