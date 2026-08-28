import React from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  DollarSign, 
  Cpu, 
  ShieldAlert, 
  HeartHandshake, 
  CheckCircle, 
  AlertTriangle,
  Target
} from "lucide-react";

export const AgentCard = ({ deliberation }) => {
  if (!deliberation) return null;

  const agentConfig = {
    CEO: { icon: Briefcase, color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
    CFO: { icon: DollarSign, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
    CTO: { icon: Cpu, color: "#06b6d4", bg: "rgba(6, 182, 212, 0.1)" },
    "Risk Analyst": { icon: ShieldAlert, color: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)" },
    Mentor: { icon: HeartHandshake, color: "#a855f7", bg: "rgba(168, 85, 247, 0.1)" },
  };

  const config = agentConfig[deliberation.agent_name] || agentConfig[deliberation.role] || {
    icon: Briefcase,
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.1)"
  };

  const IconComponent = config.icon;
  const scorePercent = Math.round((deliberation.perspective_score || 0.8) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4 }}
      className="glass-card" 
      style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Card Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: config.bg,
              border: `1px solid ${config.color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <IconComponent size={22} color={config.color} />
          </motion.div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {deliberation.agent_name}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {deliberation.agent_title}
            </p>
          </div>
        </div>

        {/* Conviction Score Gauge */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end"
        }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Conviction
          </span>
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            style={{ fontSize: "1.2rem", fontWeight: 800, color: config.color }}
          >
            {scorePercent}%
          </motion.span>
        </div>
      </div>

      {/* Recommended Option Badge */}
      <div style={{
        padding: "8px 12px",
        borderRadius: "8px",
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid var(--border-subtle)",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <CheckCircle size={16} color={config.color} />
        <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
          Recommends: <strong>{deliberation.recommended_option}</strong>
        </span>
      </div>

      {/* Analysis text */}
      <p style={{
        fontSize: "0.9rem",
        color: "#cbd5e1",
        lineHeight: "1.6",
        marginBottom: "20px",
        flexGrow: 1
      }}>
        {deliberation.analysis || deliberation.argument}
      </p>

      {/* Top Priorities */}
      {deliberation.top_priorities && deliberation.top_priorities.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Target size={14} color={config.color} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              Key Priorities
            </span>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
            {deliberation.top_priorities.map((item, idx) => (
              <li key={idx} style={{ fontSize: "0.82rem", color: "#e2e8f0", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <span style={{ color: config.color, fontWeight: 700 }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concerns */}
      {deliberation.concerns && deliberation.concerns.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <AlertTriangle size={14} color="#fb7185" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#fb7185", letterSpacing: "0.05em" }}>
              Identified Concerns
            </span>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
            {deliberation.concerns.map((item, idx) => (
              <li key={idx} style={{ fontSize: "0.82rem", color: "#fca5a5", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <span style={{ color: "#fb7185", fontWeight: 700 }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quotes Footer */}
      {deliberation.key_quotes && deliberation.key_quotes.length > 0 && (
        <div style={{
          marginTop: "auto",
          padding: "10px 12px",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.02)",
          borderLeft: `3px solid ${config.color}`,
          fontStyle: "italic",
          fontSize: "0.82rem",
          color: "#94a3b8"
        }}>
          "{deliberation.key_quotes[0]}"
        </div>
      )}
    </motion.div>
  );
};
