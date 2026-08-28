from typing import Dict, Any, List, Optional
import json
from app.llm.factory import get_llm_provider, LLMProvider

class BaseAgent:
    """Base class for all DecisionOS Board of Directors agents."""

    def __init__(self, name: str, title: str, system_prompt: str):
        self.name = name
        self.title = title
        self.system_prompt = system_prompt
        self.llm_provider: LLMProvider = get_llm_provider()

    def format_decision_context(
        self,
        decision_data: Dict[str, Any],
        user_profile: Optional[Dict[str, Any]] = None,
        historical_memories: Optional[List[Dict[str, Any]]] = None,
        other_opinions: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Formats comprehensive context for the LLM prompt."""
        context_parts = [
            f"=== DECISION DILEMMA ===",
            f"Title: {decision_data.get('title')}",
            f"Description: {decision_data.get('description')}",
            f"Category: {decision_data.get('category', 'General')}",
            f"Urgency: {decision_data.get('urgency', 'Medium')}",
            f"Timeline: {decision_data.get('timeline', 'Flexible')}",
            f"Risk Tolerance: {decision_data.get('risk_tolerance', 'Moderate')}",
            f"Primary Goal: {decision_data.get('primary_goal', 'Not specified')}",
            f"Constraints: {json.dumps(decision_data.get('constraints', {}), indent=2)}",
        ]

        # Options
        options = decision_data.get("options", [])
        if options:
            context_parts.append("\n=== PROPOSED OPTIONS ===")
            for idx, opt in enumerate(options, 1):
                label = opt.get("label", f"Option {idx}")
                desc = opt.get("description", "")
                pros = ", ".join(opt.get("pros", []))
                cons = ", ".join(opt.get("cons", []))
                context_parts.append(f"[{label}]: {desc}")
                if pros:
                    context_parts.append(f"  Pros: {pros}")
                if cons:
                    context_parts.append(f"  Cons: {cons}")

        # User profile
        if user_profile:
            context_parts.append("\n=== USER PROFILE & CORE VALUES ===")
            context_parts.append(f"Current Role: {user_profile.get('current_role', 'N/A')}")
            context_parts.append(f"Career Goals: {user_profile.get('career_goals', 'N/A')}")
            context_parts.append(f"Financial Runway: {user_profile.get('financial_runway_months', 'N/A')}")
            context_parts.append(f"Core Values: {', '.join(user_profile.get('core_values', []))}")
            if user_profile.get("personal_context"):
                context_parts.append(f"Personal Context: {user_profile.get('personal_context')}")

        # Historical memories from Vector Store
        if historical_memories:
            context_parts.append("\n=== RELEVANT PAST DECISIONS & OUTCOMES (MEMORY) ===")
            for mem in historical_memories:
                context_parts.append(
                    f"- Past Decision: '{mem.get('title')}' | Choice Made: {mem.get('choice')}\n"
                    f"  Outcome: {mem.get('outcome')} | Lesson: {mem.get('lesson')}"
                )

        # Other agent opinions (for debate & chairman synthesis)
        if other_opinions:
            context_parts.append("\n=== FELLOW BOARD MEMBER DELIBERATIONS ===")
            for agent, opinion in other_opinions.items():
                rec = opinion.get("recommended_option", "Undecided")
                analysis = opinion.get("analysis", "")
                context_parts.append(f"- {agent}: Recommends [{rec}]\n  Key Takeaway: {analysis[:300]}...")

        # Language Localization Directive
        language = decision_data.get("language")
        if language and language != "en":
            lang_name_map = {
                "hi": "Hindi (हिन्दी)",
                "es": "Spanish (Español)",
                "fr": "French (Français)",
                "de": "German (Deutsch)",
                "ja": "Japanese (日本語)"
            }
            target_lang = lang_name_map.get(language, language)
            context_parts.append(
                f"\n=== LANGUAGE REQUIREMENT ===\n"
                f"MANDATORY: You must generate all your textual analysis, critique, reasoning, key quotes, trade-offs, and verdicts in {target_lang}. "
                f"Keep all JSON key names in English as required by the schema, but translate all values, explanations, and advice into fluent, natural {target_lang}."
            )

        return "\n".join(context_parts)

    async def analyze(
        self,
        decision_data: Dict[str, Any],
        user_profile: Optional[Dict[str, Any]] = None,
        historical_memories: Optional[List[Dict[str, Any]]] = None,
        other_opinions: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Runs the agent's analysis."""
        raise NotImplementedError

