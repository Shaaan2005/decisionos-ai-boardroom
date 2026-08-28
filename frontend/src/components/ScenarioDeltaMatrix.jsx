import React from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Shield, Zap, Sparkles, Scale, CheckCircle2 } from "lucide-react";

/**
 * Side-by-Side Scenario Delta Comparison & Financial Matrix
 * Analytical comparative breakdown between Option A and Option B across 5 strategic vectors.
 */
export const ScenarioDeltaMatrix = ({ report, decision }) => {
  const optionA = decision?.options?.[0]?.label || "Option A: Aggressive Venture Track";
  const optionB = decision?.options?.[1]?.label || "Option B: Defensive Stability Track";
  const recommendedTitle = report?.synthesis?.recommended_option_title || optionA;

  const comparisonMetrics = [
    {
      dimension: "12-Month Financial Delta",
      optionAVal: "+$180k - $420k (High Variance)",
      optionBVal: "+$95k (Predictable Liquid)",
      advantage: "Option A (+240% Upside Ceiling)",
      advantageColor: "#10b981",
      icon: TrendingUp
    },
    {
      dimension: "Liquid Runway Exposure",
      optionAVal: "6-9 Months (Requires Capital Discipline)",
      optionBVal: "18+ Months (Zero Drawdown Risk)",
      advantage: "Option B (+12 Mo Safety Buffer)",
      advantageColor: "#06b6d4",
      icon: Shield
    },
    {
      dimension: "Skill & Network Compounding",
      optionAVal: "3.5x Faster (AI Systems Mastery)",
      optionBVal: "1.0x (Standard Enterprise Linear)",
      advantage: "Option A (+250% Career Velocity)",
      advantageColor: "#6366f1",
      icon: Zap
    },
    {
      dimension: "Downside Failure Floor",
      optionAVal: "High (Mitigated by 90-Day Tripwires)",
      optionBVal: "Minimal (Known Baseline)",
      advantage: "Option B (Protected Floor)",
      advantageColor: "#f43f5e",
      icon: Scale
    },
    {
      dimension: "Executive Autonomy & Agency",
      optionAVal: "Unilateral Strategic Decision-Making",
      optionBVal: "Hierarchical Multi-Layer Approvals",
      advantage: "Option A (100% Founder Agency)",
      advantageColor: "#f59e0b",
      icon: Sparkles
    }
  ];

  return (
    <div style={{
      background: "#13100b",
      border: "1px solid var(--border-medium)",
      borderRadius: "14px",
      padding: "24px",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.7)",
      marginBottom: "28px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
              Scenario Delta Comparison & Strategy Matrix
            </h3>
            <span className="cyber-badge">MCKINSEY-TIER DIFF</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Side-by-side trade-off analysis across financial upside, runway safety, and career velocity
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-medium)", textAlign: "left" }}>
              <th style={{ padding: "12px 14px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.72rem" }}>
                Strategic Vector
              </th>
              <th style={{ padding: "12px 14px", color: "#6366f1", fontWeight: 800, width: "30%" }}>
                {optionA} {recommendedTitle.includes(optionA) && <span style={{ color: "#f59e0b", fontSize: "0.7rem" }}>★ VERDICT</span>}
              </th>
              <th style={{ padding: "12px 14px", color: "#06b6d4", fontWeight: 800, width: "30%" }}>
                {optionB} {recommendedTitle.includes(optionB) && <span style={{ color: "#f59e0b", fontSize: "0.7rem" }}>★ VERDICT</span>}
              </th>
              <th style={{ padding: "12px 14px", color: "#f59e0b", fontWeight: 800, width: "22%" }}>
                Consensus Delta
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonMetrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <tr
                  key={m.dimension}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    background: idx % 2 === 0 ? "rgba(255, 255, 255, 0.01)" : "transparent"
                  }}
                >
                  <td style={{ padding: "14px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      background: "rgba(245, 158, 11, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <Icon size={13} color="#f59e0b" />
                    </div>
                    <span>{m.dimension}</span>
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    {m.optionAVal}
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    {m.optionBVal}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      background: `${m.advantageColor}15`,
                      border: `1px solid ${m.advantageColor}35`,
                      color: m.advantageColor,
                      fontSize: "0.75rem",
                      fontWeight: 800
                    }}>
                      {m.advantage}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
