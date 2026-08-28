import logging
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.decision import Decision, DecisionOption
from app.models.user import User, UserProfile
from app.models.report import DecisionReport, AgentDeliberation, DebateTurn
from app.memory.memory_manager import memory_manager
from app.graph.debate_graph import decision_graph

logger = logging.getLogger(__name__)

async def run_boardroom_deliberation(
    decision_id: str,
    user_id: str,
    db: AsyncSession,
    language: str = "en",
) -> DecisionReport:
    """Orchestrates full LangGraph multi-agent deliberation and saves results."""
    
    # 1. Fetch Decision and Options
    result = await db.execute(
        select(Decision)
        .options(selectinload(Decision.options))
        .filter(Decision.id == decision_id, Decision.user_id == user_id)
    )
    decision = result.scalars().first()
    if not decision:
        raise ValueError(f"Decision {decision_id} not found for user {user_id}")

    # 2. Fetch User Profile
    prof_result = await db.execute(
        select(UserProfile).filter(UserProfile.user_id == user_id)
    )
    profile = prof_result.scalars().first()

    user_profile_data = {
        "current_role": profile.current_role if profile else None,
        "career_goals": profile.career_goals if profile else None,
        "financial_runway_months": profile.financial_runway_months if profile else None,
        "default_risk_tolerance": profile.default_risk_tolerance if profile else "moderate",
        "core_values": profile.core_values if profile else ["Growth", "Autonomy"],
        "personal_context": profile.personal_context if profile else None,
    }

    # 3. Retrieve relevant historical memories from Vector Store
    memories = memory_manager.retrieve_context_for_decision(
        user_id=user_id,
        title=decision.title,
        description=decision.description,
        category=decision.category,
        limit=3
    )

    # 4. Prepare Decision Data Payload
    decision_data = {
        "id": decision.id,
        "title": decision.title,
        "description": decision.description,
        "category": decision.category,
        "urgency": decision.urgency,
        "timeline": decision.timeline,
        "risk_tolerance": decision.risk_tolerance,
        "constraints": decision.constraints or {},
        "primary_goal": decision.primary_goal,
        "language": language,
        "options": [
            {
                "id": opt.id,
                "label": opt.label,
                "description": opt.description,
                "pros": opt.pros or [],
                "cons": opt.cons or []
            }
            for opt in decision.options
        ]
    }

    # 5. Initialize Initial LangGraph State
    initial_state = {
        "decision_data": decision_data,
        "user_profile": user_profile_data,
        "historical_memories": memories,
        "analysis_framework": {},
        "ceo_opinion": {},
        "cfo_opinion": {},
        "cto_opinion": {},
        "risk_opinion": {},
        "mentor_opinion": {},
        "all_opinions": {},
        "debate_turns": [],
        "final_report": {},
        "current_step": "Starting Deliberation",
        "status": "started",
    }

    # Update decision status to deliberating
    decision.status = "deliberating"
    await db.commit()

    # 6. Execute LangGraph Workflow
    logger.info(f"Starting LangGraph workflow for decision: {decision.title}")
    try:
        final_state = await decision_graph.ainvoke(initial_state)
    except Exception:
        decision.status = "failed"
        await db.commit()
        logger.exception("LangGraph workflow failed for decision: %s", decision.title)
        raise
    logger.info(f"LangGraph workflow finished for decision: {decision.title}")

    final_report_data = final_state.get("final_report", {})
    all_opinions = final_state.get("all_opinions", {})
    debate_turns_data = final_state.get("debate_turns", [])

    # 7. Check if report already exists, or create new
    existing_report_res = await db.execute(
        select(DecisionReport).filter(DecisionReport.decision_id == decision.id)
    )
    existing_report = existing_report_res.scalars().first()
    if existing_report:
        await db.delete(existing_report)
        await db.flush()

    report = DecisionReport(
        decision_id=decision.id,
        executive_summary=final_report_data.get("executive_summary", "Executive deliberation complete."),
        recommended_option=final_report_data.get("recommended_option", "Option A"),
        confidence_score=final_report_data.get("confidence_score", 0.85),
        strategic_verdict=final_report_data.get("strategic_verdict", "Execute recommended strategy with guardrails."),
        key_agreements=final_report_data.get("key_agreements", []),
        key_disagreements=final_report_data.get("key_disagreements", []),
        risk_factors=final_report_data.get("risk_factors", []),
        growth_opportunities=final_report_data.get("growth_opportunities", []),
        action_plan_steps=final_report_data.get("action_plan_steps", []),
        explainability_notes=final_report_data.get("explainability_notes", "Synthesized across all perspectives."),
    )
    db.add(report)
    await db.flush()

    # 8. Save Agent Deliberations
    agent_titles = {
        "CEO": "Chief Executive Officer (Strategy & Vision)",
        "CFO": "Chief Financial Officer (Financial Modeling & ROI)",
        "CTO": "Chief Technology Officer (Skills & Tech Growth)",
        "Risk Analyst": "Chief Risk Officer (Pre-Mortem & Vulnerability)",
        "Mentor": "Personal Mentor (Values & Long-Term Fulfillment)",
    }

    for agent_key, op in all_opinions.items():
        if op:
            delib = AgentDeliberation(
                report_id=report.id,
                agent_name=agent_key,
                agent_title=agent_titles.get(agent_key, f"{agent_key} Advisor"),
                recommended_option=op.get("recommended_option", "Option A"),
                perspective_score=op.get("perspective_score", 0.8),
                analysis=op.get("analysis", ""),
                key_quotes=op.get("key_quotes", []),
                top_priorities=op.get("top_priorities", []),
                concerns=op.get("concerns", []),
            )
            db.add(delib)

    # 9. Save Debate Turns
    for turn in debate_turns_data:
        db_turn = DebateTurn(
            report_id=report.id,
            speaker=turn.get("speaker", "Board Member"),
            target_agent=turn.get("target_agent"),
            turn_type=turn.get("turn_type", "rebuttal"),
            content=turn.get("content", ""),
            round_number=turn.get("round_number", 1),
        )
        db.add(db_turn)

    # Update decision status to completed
    decision.status = "completed"
    await db.commit()

    # Refetch full report with relations
    full_report_res = await db.execute(
        select(DecisionReport)
        .options(
            selectinload(DecisionReport.deliberations),
            selectinload(DecisionReport.debate_turns)
        )
        .filter(DecisionReport.id == report.id)
    )
    return full_report_res.scalars().first()
