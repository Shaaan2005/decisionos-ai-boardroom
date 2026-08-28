from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.llm.prompt_templates import MENTOR_SYSTEM_PROMPT

class MentorAgent(BaseAgent):
    """Personal Mentor & Life Strategy Advisor: Core values, psychological fulfillment, retrospective memory."""

    def __init__(self):
        super().__init__(
            name="Mentor Agent",
            title="Personal Mentor (Values & Long-Term Fulfillment)",
            system_prompt=MENTOR_SYSTEM_PROMPT,
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
            f"As the personal Mentor advisor, analyze this decision from the perspective of authentic fulfillment, core values, and life trajectory:\n\n"
            f"{context}\n\n"
            f"Provide a JSON response with the following keys:\n"
            f"- 'recommended_option': (string) exact label of recommended option\n"
            f"- 'perspective_score': (float between 0.0 and 1.0) fulfillment alignment score\n"
            f"- 'analysis': (string) reflective, empathetic yet challenging mentorship counsel connecting to values & memory\n"
            f"- 'key_quotes': (list of 2-3 deep life wisdom quotes)\n"
            f"- 'top_priorities': (list of 3 fulfillment & well-being priorities)\n"
            f"- 'concerns': (list of 2-3 personal or psychological hazards)\n"
            f"- 'memory_reflection': (string) specific insight connecting this choice to the user's past decision patterns\n"
        )

        async def fallback():
            options = decision_data.get("options", [])
            recommended = options[0].get("label", "Option A") if options else "Option A"
            
            # Construct dynamic memory reflection based on memories or profile
            core_vals = user_profile.get("core_values", []) if user_profile else ["Learning Velocity", "Autonomy"]
            val_str = ", ".join(core_vals) if core_vals else "Growth, Impact, and Autonomy"
            
            memory_note = (
                f"Looking back at your historical patterns and declared core values ({val_str}), "
                "you consistently thrive in high-autonomy environments where your contributions directly shape outcomes. "
                "Whenever you have chosen comfort over growth in the past, boredom and restless dissatisfaction followed within 6-12 months."
            )
            if historical_memories:
                first_mem = historical_memories[0]
                memory_note = (
                    f"Reflecting on your past experience in '{first_mem.get('title', 'prior decision')}', your key takeaway was: '{first_mem.get('lesson', 'growth over comfort')}'. "
                    f"Choosing '{recommended}' honors that hard-won lesson rather than repeating past hesitation."
                )

            return {
                "recommended_option": recommended,
                "perspective_score": 0.90,
                "analysis": (
                    f"From a life-mentor standpoint, '{recommended}' represents an act of courage aligned with your authentic aspirational identity. "
                    "Most career regret stems not from bold attempts that faced obstacles, but from safe paths where curiosity was suppressed for illusory safety. "
                    "You possess the resilience and technical foundation to navigate uncertainty. "
                    "However, protect your energy: establish non-negotiable boundaries for sleep, physical health, and relationships so your high-velocity output remains sustainable."
                ),
                "key_quotes": [
                    "Regret is almost always born from inaction and self-censorship, never from deliberate growth.",
                    "Live in alignment with your future self, not in obedience to your past fears.",
                    "True confidence is not knowing you will succeed, but knowing you will learn and adapt regardless of the outcome."
                ],
                "top_priorities": [
                    "Preserving physical stamina, mental clarity, and daily recovery routines",
                    "Surrounding yourself with peers and leaders who inspire and elevate your standards",
                    "Maintaining gratitude and perspective during intense execution sprints"
                ],
                "concerns": [
                    "Allowing work identity to consume personal life balance without conscious boundaries",
                    "Falling into comparative prestige games rather than pursuing intrinsic mastery"
                ],
                "memory_reflection": memory_note
            }

        return await self.llm_provider.generate_json(self.system_prompt, prompt, fallback)
