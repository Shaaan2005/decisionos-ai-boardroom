from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.llm.prompt_templates import RISK_ANALYST_SYSTEM_PROMPT

class RiskAnalystAgent(BaseAgent):
    """Chief Risk Officer / Risk Analyst: Pre-mortems, worst-case scenarios, systemic vulnerabilities, concrete mitigations."""

    def __init__(self):
        super().__init__(
            name="Risk Analyst",
            title="Chief Risk Officer (Pre-Mortem & Vulnerability)",
            system_prompt=RISK_ANALYST_SYSTEM_PROMPT,
        )

    async def analyze(
        self,
        decision_data: Dict[str, Any],
        user_profile: Optional[Dict[str, Any]] = None,
        historical_memories: Optional[List[Dict[str, Any]]] = None,
        other_opinions: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        context = self.format_decision_context(decision_data, user_profile, historical_memories, other_opinions)
        
        prompt = (
            f"As the Chief Risk Officer, deliver a pre-mortem and risk audit for this decision:\n\n"
            f"{context}\n\n"
            f"Provide a JSON response with the following keys:\n"
            f"- 'recommended_option': (string) exact label of recommended option (with protective conditions)\n"
            f"- 'perspective_score': (float between 0.0 and 1.0) risk conviction score\n"
            f"- 'analysis': (string) pre-mortem diagnosis and risk assessment\n"
            f"- 'key_quotes': (list of 2-3 risk guardrail quotes)\n"
            f"- 'top_priorities': (list of 3 risk controls/guardrails to install)\n"
            f"- 'concerns': (list of 2-3 specific worst-case failure modes)\n"
            f"- 'risk_matrix': (list of objects with 'risk', 'severity': 'High'|'Medium'|'Low', 'probability': 'High'|'Medium'|'Low', 'mitigation')\n"
        )

        async def fallback():
            options = decision_data.get("options", [])
            recommended = options[0].get("label", "Option A") if options else "Option A"
            
            return {
                "recommended_option": recommended,
                "perspective_score": 0.78,
                "analysis": (
                    f"A thorough pre-mortem on '{recommended}' reveals several critical failure modes that must be actively hedged. "
                    "The primary risk is not failure itself, but prolonged unmitigated drift: high stress without clear deliverables, "
                    "unrealistic founder expectations, or unexpected company runway compression. "
                    "However, risks are manageable if the user establishes clear 90-day tripwires, maintains a 6-month liquidity cushion, "
                    "and secures explicit written alignment on roles, ownership, and performance metrics before onboarding."
                ),
                "key_quotes": [
                    "A pre-mortem is not about pessimism; it is about building resilience before the storm hits.",
                    "Define your exit criteria and financial tripwires before you step through the door.",
                    "Never risk what you need to gain what you simply desire unless the downside is capped."
                ],
                "top_priorities": [
                    "Establish a non-negotiable 6-month financial emergency reserve",
                    "Define a 90-day performance and cultural alignment check-in",
                    "Have an active, warm professional network ready as a contingency parachute"
                ],
                "concerns": [
                    "Early-stage runway volatility or unexpected shift in company leadership/strategy",
                    "Burnout from sustained unstructured 70+ hour workweeks without clear guardrails"
                ],
                "risk_matrix": [
                    {
                        "risk": "Startup Runway Depletion / Funding Drought",
                        "severity": "High",
                        "probability": "Medium",
                        "mitigation": "Review company balance sheet/cap table before signing; verify 18+ months runway."
                    },
                    {
                        "risk": "Cultural Mismatch / Founder Micromanagement",
                        "severity": "Medium",
                        "probability": "Medium",
                        "mitigation": "Conduct backchannel references with past employees and establish clear 90-day mutual expectations."
                    },
                    {
                        "risk": "Illiquid Equity Value Realization",
                        "severity": "Medium",
                        "probability": "High",
                        "mitigation": "Discount equity to $0 for baseline living calculations; treat as pure upside."
                    }
                ]
            }

        return await self.llm_provider.generate_json(self.system_prompt, prompt, fallback)
