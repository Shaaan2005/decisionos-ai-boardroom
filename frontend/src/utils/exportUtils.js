/**
 * DecisionOS Executive Memo & Report Exporters
 */

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
}[character]));

export const generateDecisionMemoMarkdown = (arg1, arg2) => {
  const decision = (arg1 && arg1.title) ? arg1 : (arg2 && arg2.title) ? arg2 : {};
  const report = (arg1 && (arg1.recommended_option || arg1.synthesis)) ? arg1 : (arg2 && (arg2.recommended_option || arg2.synthesis)) ? arg2 : {};

  const title = decision.title || "Strategic Decision Dilemma";
  const date = new Date(decision.created_at || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const verdictOption = report.recommended_option || "Consensus Recommendation";
  const consensusScore = report.consensus_score || 85;
  const executiveSummary = report.executive_summary || "Executive summary unavailable.";
  const synthesis = report.synthesis || {};
  const preMortem = report.pre_mortem || [];
  const advisorContributions = report.advisor_contributions || {};

  let md = `# BOARD OF DIRECTORS // EXECUTIVE DECISION MEMORANDUM\n\n`;
  md += `**MEMORANDUM TO:** Executive Leadership & Board of Directors  \n`;
  md += `**FROM:** DecisionOS Multi-Agent Autonomous Quorum  \n`;
  md += `**DATE:** ${date}  \n`;
  md += `**SUBJECT:** Strategic Resolution: ${title}  \n`;
  md += `**CONSENSUS LEVEL:** ${consensusScore}/100 (${consensusScore >= 80 ? "STRONG QUORUM" : "MODERATE ALIGNMENT"})  \n\n`;
  md += `---\n\n`;

  md += `## 1. EXECUTIVE VERDICT & RECOMMENDATION\n\n`;
  md += `> **PRIMARY DIRECTIVE:** ${verdictOption}\n\n`;
  md += `${executiveSummary}\n\n`;

  if (synthesis && Object.keys(synthesis).length > 0) {
    md += `## 2. STRATEGIC SYNTHESIS & RATIONALE\n\n`;
    if (synthesis.key_drivers) {
      md += `### Key Value Drivers\n`;
      const drivers = Array.isArray(synthesis.key_drivers) ? synthesis.key_drivers : [synthesis.key_drivers];
      drivers.forEach(d => md += `- ${d}\n`);
      md += `\n`;
    }
    if (synthesis.trade_offs) {
      md += `### Evaluated Trade-Offs\n`;
      const tradeOffs = Array.isArray(synthesis.trade_offs) ? synthesis.trade_offs : [synthesis.trade_offs];
      tradeOffs.forEach(t => md += `- ${t}\n`);
      md += `\n`;
    }
  }

  if (preMortem && preMortem.length > 0) {
    md += `## 3. PRE-MORTEM RISK ANALYSIS & TRIPWIRES\n\n`;
    md += `| Risk Factor / Failure Mode | Probability | Severity | Mitigation Tripwire |\n`;
    md += `| :--- | :---: | :---: | :--- |\n`;
    preMortem.forEach(r => {
      const risk = r.risk || r.failure_mode || "Operational Friction";
      const prob = r.probability || "Medium";
      const sev = r.severity || "Moderate";
      const mit = r.mitigation || r.tripwire || "Execute rollback threshold";
      md += `| ${risk} | ${prob} | ${sev} | ${mit} |\n`;
    });
    md += `\n`;
  }

  if (advisorContributions && Object.keys(advisorContributions).length > 0) {
    md += `## 4. INDIVIDUAL ADVISOR TESTIMONY & DISSENT\n\n`;
    Object.entries(advisorContributions).forEach(([role, statement]) => {
      const formattedRole = role.toUpperCase().replace(/_/g, " ");
      md += `### ${formattedRole}\n`;
      md += `"${statement}"\n\n`;
    });
  }

  md += `## 5. 90-DAY EXECUTION TRIPWIRES\n\n`;
  md += `1. **Day 0 - 30:** Finalize stakeholder alignment, establish baseline metrics, and lock in fallback runway.\n`;
  md += `2. **Day 31 - 60:** Deploy initial operational test with strict kill-criteria if leading indicators underperform.\n`;
  md += `3. **Day 61 - 90:** Convene follow-up Boardroom review to evaluate outcome calibration against pre-mortem models.\n\n`;

  md += `---\n*Generated autonomously by DecisionOS AI Personal Board of Directors.*`;
  return md;
};

export const downloadDecisionMarkdown = (arg1, arg2) => {
  const md = generateDecisionMemoMarkdown(arg1, arg2);
  const decision = (arg1 && arg1.title) ? arg1 : (arg2 && arg2.title) ? arg2 : {};
  const slug = (decision?.title || "decision_memo").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `DecisionOS_Board_Memo_${slug}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportDecisionToPDF = (arg1, arg2) => {
  const decision = (arg1 && arg1.title) ? arg1 : (arg2 && arg2.title) ? arg2 : {};
  const report = (arg1 && (arg1.recommended_option || arg1.synthesis)) ? arg1 : (arg2 && (arg2.recommended_option || arg2.synthesis)) ? arg2 : {};
  const mdContent = generateDecisionMemoMarkdown(decision, report);
  const title = decision?.title || "Executive Decision Memorandum";

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to generate the printable Decision Memo.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Decision Memo: ${escapeHtml(title)}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            line-height: 1.6;
            margin: 0;
            padding: 24px;
            font-size: 13px;
          }
          .memo-header {
            border-bottom: 2px solid #111827;
            padding-bottom: 14px;
            margin-bottom: 20px;
          }
          .memo-title {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: -0.02em;
            text-transform: uppercase;
            margin-bottom: 12px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 140px 1fr;
            row-gap: 4px;
            font-size: 12px;
          }
          .meta-label {
            font-weight: 700;
            color: #4b5563;
          }
          .verdict-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 14px 18px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .verdict-title {
            font-size: 14px;
            font-weight: 800;
            color: #92400e;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .verdict-text {
            font-size: 13px;
            font-weight: 700;
            color: #1f2937;
          }
          h2 {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 12px;
            letter-spacing: 0.05em;
          }
          h3 {
            font-size: 12px;
            font-weight: 700;
            color: #374151;
            margin-top: 14px;
            margin-bottom: 4px;
            text-transform: uppercase;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 14px 0;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 8px 10px;
            text-align: left;
          }
          th {
            background: #f9fafb;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 11px;
          }
          .advisor-quote {
            background: #f9fafb;
            border-left: 3px solid #6b7280;
            padding: 8px 12px;
            margin: 8px 0 14px;
            font-style: italic;
            color: #374151;
          }
          .footer {
            margin-top: 36px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            font-size: 10px;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="memo-header">
          <div class="memo-title">Board of Directors // Executive Decision Memorandum</div>
          <div class="meta-grid">
            <div class="meta-label">MEMORANDUM TO:</div>
            <div>Executive Leadership & Board of Directors</div>
            <div class="meta-label">FROM:</div>
            <div>DecisionOS Multi-Agent Autonomous Quorum</div>
            <div class="meta-label">DATE:</div>
            <div>${new Date(decision?.created_at || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
            <div class="meta-label">SUBJECT:</div>
            <div><strong>${escapeHtml(title)}</strong></div>
            <div class="meta-label">CONSENSUS SCORE:</div>
            <div><strong>${report?.consensus_score || 85}/100</strong></div>
          </div>
        </div>

        <div class="verdict-box">
          <div class="verdict-title">Primary Boardroom Directive</div>
          <div class="verdict-text">${escapeHtml(report?.recommended_option || "Consensus Approved Option")}</div>
        </div>

        <h2>1. Executive Summary</h2>
        <p>${escapeHtml(report?.executive_summary || "Executive summary unavailable.")}</p>

        ${report?.pre_mortem && report.pre_mortem.length > 0 ? `
          <h2>2. Pre-Mortem Risk Matrix & Tripwires</h2>
          <table>
            <thead>
              <tr>
                <th>Failure Mode / Risk</th>
                <th>Probability</th>
                <th>Severity</th>
                <th>Mitigation Tripwire</th>
              </tr>
            </thead>
            <tbody>
              ${report.pre_mortem.map(r => `
                <tr>
                  <td><strong>${escapeHtml(r.risk || r.failure_mode || "Risk")}</strong></td>
                  <td>${escapeHtml(r.probability || "Medium")}</td>
                  <td>${escapeHtml(r.severity || "Moderate")}</td>
                  <td>${escapeHtml(r.mitigation || r.tripwire || "Active monitoring")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : ""}

        ${report?.advisor_contributions ? `
          <h2>3. Individual Boardroom Testimony</h2>
          ${Object.entries(report.advisor_contributions).map(([role, text]) => `
            <h3>${escapeHtml(role.toUpperCase().replace(/_/g, " "))}</h3>
            <div class="advisor-quote">"${escapeHtml(text)}"</div>
          `).join("")}
        ` : ""}

        <h2>4. 90-Day Execution Roadmap</h2>
        <ol>
          <li><strong>Day 0 - 30:</strong> Secure stakeholder alignment, baseline core metrics, and enforce initial cash/runway buffers.</li>
          <li><strong>Day 31 - 60:</strong> Launch pilot operational test with strict kill-criteria if leading indicators miss targets.</li>
          <li><strong>Day 61 - 90:</strong> Reconvene Board of Directors to benchmark outcome calibration against original pre-mortem.</li>
        </ol>

        <div class="footer">
          <div>DecisionOS AI Personal Board of Directors</div>
          <div>Confidential Executive Strategy Document</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
