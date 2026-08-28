from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.llm.prompt_templates import CFO_SYSTEM_PROMPT

class CFOAgent(BaseAgent):
    """Chief Financial Officer Agent: Capital allocation, runway modeling, risk-adjusted ROI."""

    def __init__(self):
        super().__init__(
            name="CFO Agent",
            title="Chief Financial Officer (Financial Modeling & ROI)",
            system_prompt=CFO_SYSTEM_PROMPT,
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
            f"As the CFO advisor, deliver your rigorous financial analysis of this decision:\n\n"
            f"{context}\n\n"
            f"Provide a JSON response with the following keys:\n"
            f"- 'recommended_option': (string) exact label of your recommended option\n"
            f"- 'perspective_score': (float between 0.0 and 1.0) financial confidence score\n"
            f"- 'analysis': (string) detailed quantitative & risk-adjusted financial breakdown\n"
            f"- 'key_quotes': (list of 2-3 financial discipline quotes)\n"
            f"- 'top_priorities': (list of 3 financial priorities e.g., runway, compensation terms, equity tax)\n"
            f"- 'concerns': (list of 2-3 financial risks)\n"
        )

        async def fallback():
            options = decision_data.get("options", [])
            first_opt = options[0].get("label", "Option A") if options else "Option A"
            
            runway = user_profile.get("financial_runway_months", "6-12 months") if user_profile else "6-12 months"

            return {
                "recommended_option": first_opt,
                "perspective_score": 0.84,
                "analysis": (
                    f"From a financial modeling standpoint, evaluating '{first_opt}' requires stress-testing cash flows and runway buffers. "
                    f"Given current financial context (estimated runway: {runway}), this move is financially viable provided the base compensation covers core burn rate "
                    "without draining liquid capital reserves. Illiquid equity grants should be discounted by at least 70-80% in baseline calculations. "
                    "However, if structured with proper vesting acceleration, signing bonus, or milestone triggers, the expected financial value "
                    "significantly surpasses linear corporate salary increments over a 3-5 year compounding horizon."
                ),
                "key_quotes": [
                    "Cash runway is your personal freedom buffer; protect minimum 6 months of liquid reserves unconditionally.",
                    "Treat early equity as a call option: never compromise baseline survival costs for unvested paper wealth.",
                    "Calculate total compensation on a risk-adjusted net present value (NPV) basis."
                ],
                "top_priorities": [
                    "Ensuring guaranteed base salary covers 100% of baseline living expenses",
                    "Negotiating clear equity vesting schedules (e.g. 1-year cliff, monthly vesting, single/double trigger)",
                    "Maintaining a strict 6-month liquid emergency fund"
                ],
                "concerns": [
                    "Potential short-term cash flow compression if base compensation drops",
                    "Tax implications and exercise windows for equity options upon separation"
                ],
            }

        return await self.llm_provider.generate_json(self.system_prompt, prompt, fallback)
