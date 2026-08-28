from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.llm.prompt_templates import CTO_SYSTEM_PROMPT

class CTOAgent(BaseAgent):
    """Chief Technology Officer Agent: Skill velocity, technology stack relevance, technical mastery."""

    def __init__(self):
        super().__init__(
            name="CTO Agent",
            title="Chief Technology Officer (Skills & Tech Growth)",
            system_prompt=CTO_SYSTEM_PROMPT,
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
            f"As the CTO advisor, evaluate the technical growth and skill velocity of this decision:\n\n"
            f"{context}\n\n"
            f"Provide a JSON response with the following keys:\n"
            f"- 'recommended_option': (string) exact label of your recommended option\n"
            f"- 'perspective_score': (float between 0.0 and 1.0) technical growth score\n"
            f"- 'analysis': (string) in-depth technical skill and architectural velocity analysis\n"
            f"- 'key_quotes': (list of 2-3 technical engineering mastery quotes)\n"
            f"- 'top_priorities': (list of 3 key skill/technology priorities to target)\n"
            f"- 'concerns': (list of 2-3 technical pitfalls or skill debt risks)\n"
        )

        async def fallback():
            options = decision_data.get("options", [])
            growth_opt = options[0].get("label", "Option A") if options else "Option A"
            
            return {
                "recommended_option": growth_opt,
                "perspective_score": 0.95,
                "analysis": (
                    f"Evaluating '{growth_opt}' from a technology and skill compounding lens yields overwhelmingly bullish indicators. "
                    "In fast-evolving AI and software ecosystems, learning speed is the only durable moat. In a high-agency, high-velocity environment, "
                    "the breadth of architectural challenges—end-to-end multi-agent orchestration, cloud infrastructure, AI model pipelines, and system scaling—"
                    "compresses 4 years of linear enterprise learning into 12 intensive months. Staying in lower-velocity environments risks accumulating skill debt."
                ),
                "key_quotes": [
                    "Skill compounding is non-linear: your market value is determined by the hardest problems you have solved end-to-end.",
                    "Beware the trap of 10 years of experience that is actually 1 year repeated 10 times.",
                    "Mastering modern multi-agent, distributed AI stacks today secures tier-1 engineering leverage for the next decade."
                ],
                "top_priorities": [
                    "Hands-on ownership of core architecture and production AI deployments",
                    "Rapid iteration loops with production user feedback and telemetry",
                    "Building deep expertise in emerging orchestration, vector indexing, and scalable infrastructure"
                ],
                "concerns": [
                    "Risk of chaotic technical debt if engineering standards are neglected under fast deadlines",
                    "Ensuring adequate mentorship or peer engineering talent to cross-pollinate best practices"
                ],
            }

        return await self.llm_provider.generate_json(self.system_prompt, prompt, fallback)
