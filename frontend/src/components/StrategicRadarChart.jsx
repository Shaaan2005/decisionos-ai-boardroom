import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Radar, 
  ShieldCheck, 
  TrendingUp, 
  Cpu, 
  DollarSign, 
  HeartHandshake,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

/**
 * 5-Axis Strategic Radar Chart & Scorecard Comparison Matrix
 * Dimensions:
 * 1. Capital Safety (CFO)
 * 2. Asymmetric Upside (CEO)
 * 3. Tech Velocity (CTO)
 * 4. Downside Defense (Risk Analyst)
 * 5. Values Alignment (Mentor)
 */
export const StrategicRadarChart = ({ report, decision }) => {
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [activeView, setActiveView] = useState("radar"); // "radar" | "matrix"

  // Derive scores from deliberations or default baseline
  const options = decision?.options || [
    { id: "opt_a", label: "Option A: Aggressive Venture / Startup Path" },
    { id: "opt_b", label: "Option B: Conservative / Stability Path" }
  ];

  // Default calibrated dimension vectors
  const dimensions = [
    { key: "upside", label: "Asymmetric Upside", icon: TrendingUp, color: "#6366f1", advisor: "CEO Advisor" },
    { key: "capital", label: "Financial Runway Safety", icon: DollarSign, color: "#10b981", advisor: "CFO Advisor" },
    { key: "velocity", label: "Tech Velocity & Mastery", icon: Cpu, color: "#06b6d4", advisor: "CTO Advisor" },
    { key: "defense", label: "Downside Containment", icon: ShieldCheck, color: "#f43f5e", advisor: "Risk Analyst" },
    { key: "values", label: "Core Values Alignment", icon: HeartHandshake, color: "#a855f7", advisor: "Mentor Advisor" }
  ];

  // Compute option score vectors based on consensus
  const consensus = report?.consensus_score || 82;
  const optAScores = [
    Math.min(95, Math.round(consensus * 1.1)),
    Math.max(45, Math.round(100 - consensus * 0.6)),
    Math.min(90, Math.round(consensus * 1.05)),
    Math.max(50, Math.round(100 - consensus * 0.5)),
    Math.min(92, Math.round(consensus * 0.95))
  ];

  const optBScores = [
    Math.max(50, Math.round(100 - consensus * 0.45)),
    Math.min(92, Math.round(consensus * 1.05)),
    Math.max(55, Math.round(100 - consensus * 0.4)),
    Math.min(88, Math.round(consensus * 0.98)),
    Math.min(85, Math.round(consensus * 0.9))
  ];

  // SVG Radar coordinate generator
  const size = 320;
  const center = size / 2;
  const radius = size * 0.38;
  const angleStep = (Math.PI * 2) / dimensions.length;

  const getCoordinates = (value, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const polyA = optAScores.map((val, idx) => {
    const { x, y } = getCoordinates(val, idx);
    return `${x},${y}`;
  }).join(" ");

  const polyB = optBScores.map((val, idx) => {
    const { x, y } = getCoordinates(val, idx);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="rzp-card" style={{ padding: "28px", marginTop: "24px", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
      {/* Card Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Radar size={20} color="#a5b4fc" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
              Multi-Dimensional Strategic Trade-Off Radar
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Cross-comparing options across the 5 advisor domains
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", background: "#18140f", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={() => setActiveView("radar")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              background: activeView === "radar" ? "var(--accent-primary)" : "transparent",
              color: activeView === "radar" ? "#ffffff" : "var(--text-secondary)",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Radar Spectrum
          </button>
          <button
            type="button"
            onClick={() => setActiveView("matrix")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              background: activeView === "matrix" ? "var(--accent-primary)" : "transparent",
              color: activeView === "matrix" ? "#ffffff" : "var(--text-secondary)",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Score Matrix
          </button>
        </div>
      </div>

      {activeView === "radar" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "center" }}>
          {/* SVG Radar Chart */}
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <svg width={size} height={size} style={{ overflow: "visible" }}>
              {/* Background concentric web rings */}
              {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius * scale}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray={scale === 1 ? "none" : "3,3"}
                />
              ))}

              {/* Axis Spoke Lines */}
              {dimensions.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Option B Polygon (Amber/Secondary) */}
              <polygon
                points={polyB}
                fill="rgba(245, 158, 11, 0.18)"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4,4"
              />

              {/* Option A Polygon (Indigo/Primary) */}
              <polygon
                points={polyA}
                fill="rgba(99, 102, 241, 0.3)"
                stroke="#6366f1"
                strokeWidth="2.5"
              />

              {/* Data points for Option A */}
              {optAScores.map((val, idx) => {
                const { x, y } = getCoordinates(val, idx);
                return (
                  <circle
                    key={`dot-a-${idx}`}
                    cx={x}
                    cy={y}
                    r={4}
                    fill="#a5b4fc"
                    stroke="#6366f1"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Data points for Option B */}
              {optBScores.map((val, idx) => {
                const { x, y } = getCoordinates(val, idx);
                return (
                  <circle
                    key={`dot-b-${idx}`}
                    cx={x}
                    cy={y}
                    r={3.5}
                    fill="#fef08a"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Axis Labels */}
              {dimensions.map((dim, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const labelRadius = radius + 24;
                const x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);
                return (
                  <text
                    key={`lbl-${i}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={dim.color}
                    fontSize="11"
                    fontWeight="700"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                  >
                    {dim.label.split(" ")[0]}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Dimension Details & Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Legend Keys */}
            <div style={{ display: "flex", gap: "16px", padding: "10px 14px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#6366f1" }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#e2e8f0" }}>
                  {options[0]?.title || options[0]?.label || "Option A (Recommended Path)"}
                </span>
              </div>
              {options[1] && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#f59e0b", border: "1px dashed #ffffff" }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1" }}>
                    {options[1]?.title || options[1]?.label || "Option B (Alternative)"}
                  </span>
                </div>
              )}
            </div>

            {/* Score Breakdown per Axis */}
            {dimensions.map((dim, idx) => {
              const DimIcon = dim.icon;
              const scoreA = optAScores[idx];
              const scoreB = optBScores[idx];
              return (
                <div 
                  key={dim.key}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(20, 24, 38, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <DimIcon size={16} color={dim.color} />
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
                        {dim.label}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Championed by {dim.advisor}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#a5b4fc" }}>
                      A: {scoreA}%
                    </span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fef08a" }}>
                      B: {scoreB}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Matrix View */
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                <th style={{ padding: "12px 14px", color: "var(--text-muted)", fontWeight: 700 }}>Strategic Dimension</th>
                <th style={{ padding: "12px 14px", color: "#a5b4fc", fontWeight: 800 }}>{options[0]?.title || "Option A"}</th>
                {options[1] && <th style={{ padding: "12px 14px", color: "#fef08a", fontWeight: 800 }}>{options[1]?.title || "Option B"}</th>}
                <th style={{ padding: "12px 14px", color: "var(--text-muted)", fontWeight: 700 }}>Advisor Verdict</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dim, idx) => {
                const DimIcon = dim.icon;
                const scoreA = optAScores[idx];
                const scoreB = optBScores[idx];
                const winner = scoreA >= scoreB ? "Option A" : "Option B";
                return (
                  <tr key={dim.key} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#ffffff" }}>
                      <DimIcon size={16} color={dim.color} />
                      {dim.label}
                    </td>
                    <td style={{ padding: "12px 14px", color: scoreA >= scoreB ? "#34d399" : "#cbd5e1", fontWeight: 700 }}>
                      {scoreA}/100 {scoreA >= scoreB ? "🏆" : ""}
                    </td>
                    {options[1] && (
                      <td style={{ padding: "12px 14px", color: scoreB > scoreA ? "#34d399" : "#cbd5e1", fontWeight: 700 }}>
                        {scoreB}/100 {scoreB > scoreA ? "🏆" : ""}
                      </td>
                    )}
                    <td style={{ padding: "12px 14px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      Favors <strong>{winner}</strong> ({dim.advisor})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
