import React, { useMemo, useState } from "react";
import { Scale, Trophy } from "lucide-react";

const criteria = ["Financial upside", "Downside protection", "Learning & growth", "Autonomy", "Values alignment"];

export const WeightedDecisionScorecard = ({ decision }) => {
  const options = decision?.options || [];
  const [weights, setWeights] = useState(() => Object.fromEntries(criteria.map((name) => [name, 20])));
  const [scores, setScores] = useState(() => Object.fromEntries(options.map((option) => {
    const baseline = Math.max(1, Math.min(10, 5 + (option.pros?.length || 0) - (option.cons?.length || 0)));
    const optionScores = Object.fromEntries(criteria.map((name, index) => [
      name, Math.max(1, Math.min(10, baseline + (index === 1 ? -1 : 0))),
    ]));
    return [option.id || option.label, optionScores];
  })));

  const results = useMemo(() => options.map((option) => {
    const key = option.id || option.label;
    const totalWeight = Object.values(weights).reduce((sum, value) => sum + Number(value), 0) || 1;
    const score = criteria.reduce((sum, name) => sum + (scores[key]?.[name] || 0) * Number(weights[name]), 0) / totalWeight;
    return { key, label: option.label, score };
  }).sort((a, b) => b.score - a.score), [options, scores, weights]);

  const setScore = (key, criterion, value) => setScores((current) => ({ ...current, [key]: { ...current[key], [criterion]: Number(value) } }));

  if (options.length < 2) return null;
  return <section className="rzp-card" style={{ padding: 24, marginBottom: 28 }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}><Scale size={20} color="#f59e0b" /><h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Your Weighted Decision Scorecard</h3></div>
    <p style={{ color: "var(--text-muted)", fontSize: ".85rem", marginBottom: 20 }}>Set what matters most, then rate each option. This is your transparent scenario model—not an opaque AI verdict.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
      {criteria.map((name) => <label key={name} style={{ fontSize: ".78rem", color: "var(--text-secondary)" }}>{name}: <b>{weights[name]}%</b><input aria-label={`${name} weight`} type="range" min="0" max="100" value={weights[name]} onChange={(event) => setWeights({ ...weights, [name]: event.target.value })} style={{ width: "100%", accentColor: "#f59e0b" }} /></label>)}
    </div>
    <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}><thead><tr><th style={{ textAlign: "left", padding: 8 }}>Criterion</th>{options.map((option) => <th key={option.id || option.label} style={{ padding: 8, textAlign: "center" }}>{option.label}</th>)}</tr></thead><tbody>{criteria.map((name) => <tr key={name} style={{ borderTop: "1px solid var(--border-subtle)" }}><td style={{ padding: 8 }}>{name}</td>{options.map((option) => { const key = option.id || option.label; return <td key={key} style={{ padding: 8, textAlign: "center" }}><input aria-label={`${option.label} ${name}`} type="number" min="1" max="10" value={scores[key]?.[name] || 5} onChange={(event) => setScore(key, name, event.target.value)} style={{ width: 48 }} /></td>; })}</tr>)}</tbody></table></div>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>{results.map((result, index) => <div key={result.key} style={{ padding: "10px 14px", borderRadius: 8, background: index === 0 ? "rgba(16,185,129,.14)" : "rgba(255,255,255,.04)" }}>{index === 0 && <Trophy size={14} color="#10b981" style={{ verticalAlign: "middle", marginRight: 6 }} />}<b>{result.label}</b>: {result.score.toFixed(1)}/10</div>)}</div>
  </section>;
};
