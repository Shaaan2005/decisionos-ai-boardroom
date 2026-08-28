from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.llm.prompt_templates import CEO_SYSTEM_PROMPT

class CEOAgent(BaseAgent):
    """Chief Executive Officer Agent: Strategic vision, compounding leverage, market positioning."""

    def __init__(self):
        super().__init__(
            name="CEO Agent",
            title="Chief Executive Officer (Strategy & Vision)",
            system_prompt=CEO_SYSTEM_PROMPT,
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
            f"As the CEO advisor, deliver your strategic assessment of this decision:\n\n"
            f"{context}\n\n"
            f"Provide a JSON response with the following keys:\n"
            f"- 'recommended_option': (string) exact label of your recommended option\n"
            f"- 'perspective_score': (float between 0.0 and 1.0) enthusiasm/conviction\n"
            f"- 'analysis': (string) deep strategic rationale, 2-3 detailed paragraphs\n"
            f"- 'key_quotes': (list of 2-3 punchy strategic quotes representing your stance)\n"
            f"- 'top_priorities': (list of 3 key strategic levers to maximize)\n"
            f"- 'concerns': (list of 2-3 strategic pitfalls or missed opportunities)\n"
        )

        async def fallback():
            options = decision_data.get("options", [])
            # Default to the option with highest upside/growth or option 1
            first_opt = options[0].get("label", "Option A") if options else "Option A"
            second_opt = options[1].get("label", "Option B") if len(options) > 1 else "Status Quo"
            
            # Smart determination of growth path
            growth_opt = first_opt
            for opt in options:
                desc = (opt.get("label", "") + " " + opt.get("description", "")).lower()
                if any(w in desc for w in ["startup", "expand", "scale", "launch", "founder", "lead", "switch", "join"]):
                    growth_opt = opt.get("label", first_opt)
                    break

            return {
                "recommended_option": growth_opt,
                "perspective_score": 0.92,
                "analysis": (
                    f"From a strategic market positioning perspective, '{growth_opt}' represents a non-linear leap in career leverage. "
                    "In modern knowledge economies, playing defense and staying in comfort zones creates a silent compound risk of stagnation. "
                    "By pursuing the higher-growth trajectory, the user secures high-visibility ownership, direct decision-making authority, and asymmetric upside. "
                    "Even in a conservative scenario, the network velocity and reputation compounding gained from this bold step vastly outweigh marginal short-term certainty."
                ),
                "key_quotes": [
                    "In strategic competition, the greatest risk is playing so safely that you become obsolete.",
                    "Ownership and high-agency environments compound your market value faster than incremental promotions.",
                    "Optimize for asymmetric upside where success multiplies your trajectory 10x while downside is strictly bounded."
                ],
                "top_priorities": [
                    "Securing substantial equity/ownership and decision autonomy",
                    "Building a high-density executive and founder network",
                    "Positioning for industry leadership over the next 5-year cycle"
                ],
                "concerns": [
                    f"Risk of staying tethered to legacy stability ({second_opt}) due to inertia",
                    "Ensuring clear governance and strategic clarity before fully executing"
                ],
            }

        return await self.llm_provider.generate_json(self.system_prompt, prompt, fallback)
