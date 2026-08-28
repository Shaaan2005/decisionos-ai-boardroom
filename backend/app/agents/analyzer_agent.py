from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.llm.prompt_templates import ANALYZER_SYSTEM_PROMPT

class DecisionAnalyzerAgent(BaseAgent):
    """Dissects decision inputs into strategic dimensions and trade-off axes."""

    def __init__(self):
        super().__init__(
            name="Decision Analyzer",
            title="Lead Decision Strategist",
            system_prompt=ANALYZER_SYSTEM_PROMPT,
        )

    async def analyze(
        self,
        decision_data: Dict[str, Any],
        user_profile: Optional[Dict[str, Any]] = None,
        historical_memories: Optional[List[Dict[str, Any]]] = None,
        other_opinions: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        context = self.format_decision_context(decision_data, user_profile, historical_memories)
        
        prompt = (
            f"Please structure and analyze the following decision problem for the Board of Directors:\n\n"
            f"{context}\n\n"
            f"Provide a JSON response with the following keys:\n"
            f"- 'core_dilemma': (string) crisp problem statement\n"
            f"- 'strategic_stakes': (string) what is really at risk or to be gained\n"
            f"- 'key_tradeoff_axes': (list of strings) e.g., ['Stability vs Growth', 'Immediate Cash vs Long-term Equity']\n"
            f"- 'critical_constraints': (list of strings) identified constraints\n"
            f"- 'evaluation_criteria': (list of objects with 'criterion', 'weight' 1-10, 'description')\n"
        )

        async def fallback():
            title = decision_data.get("title", "Strategic Choice")
            options = decision_data.get("options", [])
            opt_labels = [opt.get("label", f"Option {i+1}") for i, opt in enumerate(options)]
            
            return {
                "core_dilemma": f"Evaluating optimal path forward regarding '{title}', balancing risk, upside, and alignment.",
                "strategic_stakes": "High impact on trajectory, skill compounding, financial security, and personal fulfillment.",
                "key_tradeoff_axes": [
                    "High Asymmetric Upside vs. Baseline Certainty",
                    "Immediate Cash Compensation vs. Long-Term Equity & Leverage",
                    "Rapid Skill Acceleration vs. Work-Life Equilibrium",
                ],
                "critical_constraints": [
                    f"Risk profile: {decision_data.get('risk_tolerance', 'moderate')}",
                    f"Urgency timeline: {decision_data.get('timeline', 'Flexible')}",
                ],
                "evaluation_criteria": [
                    {"criterion": "Career Compounding & Vision", "weight": 9, "description": "Long-term market positioning and leverage"},
                    {"criterion": "Financial Health & ROI", "weight": 8, "description": "Cash flow, runway buffer, and risk-adjusted compensation"},
                    {"criterion": "Technical & Skill Growth", "weight": 8, "description": "Velocity of mastering rare, valuable capabilities"},
                    {"criterion": "Downside & Vulnerability Mitigation", "weight": 7, "description": "Pre-mortem exposure and resilience"},
                    {"criterion": "Personal Fulfillment & Core Values", "weight": 9, "description": "Authentic alignment and well-being"},
                ],
            }

        return await self.llm_provider.generate_json(self.system_prompt, prompt, fallback)
