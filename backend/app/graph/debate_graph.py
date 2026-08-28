import logging
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from app.graph.state import BoardroomState
from app.agents.analyzer_agent import DecisionAnalyzerAgent
from app.agents.ceo_agent import CEOAgent
from app.agents.cfo_agent import CFOAgent
from app.agents.cto_agent import CTOAgent
from app.agents.risk_agent import RiskAnalystAgent
from app.agents.mentor_agent import MentorAgent
from app.agents.chairman_agent import ChairmanAgent

logger = logging.getLogger(__name__)

# Instantiate agent singletons
analyzer_agent = DecisionAnalyzerAgent()
ceo_agent = CEOAgent()
cfo_agent = CFOAgent()
cto_agent = CTOAgent()
risk_agent = RiskAnalystAgent()
mentor_agent = MentorAgent()
chairman_agent = ChairmanAgent()

async def analyze_node(state: BoardroomState) -> Dict[str, Any]:
    """Phase 1: Dissects decision problem into structured criteria."""
    logger.info("Executing Analyzer Node...")
    framework = await analyzer_agent.analyze(
        decision_data=state["decision_data"],
        user_profile=state.get("user_profile"),
        historical_memories=state.get("historical_memories", []),
    )
    return {
        "analysis_framework": framework,
        "current_step": "Individual Board Deliberations",
        "status": "in_progress"
    }

async def ceo_node(state: BoardroomState) -> Dict[str, Any]:
    logger.info("Executing CEO Node...")
    opinion = await ceo_agent.analyze(
        decision_data=state["decision_data"],
        user_profile=state.get("user_profile"),
        historical_memories=state.get("historical_memories", []),
    )
    return {"ceo_opinion": opinion}

async def cfo_node(state: BoardroomState) -> Dict[str, Any]:
    logger.info("Executing CFO Node...")
    opinion = await cfo_agent.analyze(
        decision_data=state["decision_data"],
        user_profile=state.get("user_profile"),
        historical_memories=state.get("historical_memories", []),
    )
    return {"cfo_opinion": opinion}

async def cto_node(state: BoardroomState) -> Dict[str, Any]:
    logger.info("Executing CTO Node...")
    opinion = await cto_agent.analyze(
        decision_data=state["decision_data"],
        user_profile=state.get("user_profile"),
        historical_memories=state.get("historical_memories", []),
    )
    return {"cto_opinion": opinion}

async def risk_node(state: BoardroomState) -> Dict[str, Any]:
    logger.info("Executing Risk Analyst Node...")
    opinion = await risk_agent.analyze(
        decision_data=state["decision_data"],
        user_profile=state.get("user_profile"),
        historical_memories=state.get("historical_memories", []),
    )
    return {"risk_opinion": opinion}

async def mentor_node(state: BoardroomState) -> Dict[str, Any]:
    logger.info("Executing Mentor Node...")
    opinion = await mentor_agent.analyze(
        decision_data=state["decision_data"],
        user_profile=state.get("user_profile"),
        historical_memories=state.get("historical_memories", []),
    )
    return {"mentor_opinion": opinion}

async def aggregate_opinions_node(state: BoardroomState) -> Dict[str, Any]:
    """Combines all agent deliberations into a structured map."""
    all_opinions = {
        "CEO": state.get("ceo_opinion", {}),
        "CFO": state.get("cfo_opinion", {}),
        "CTO": state.get("cto_opinion", {}),
        "Risk Analyst": state.get("risk_opinion", {}),
        "Mentor": state.get("mentor_opinion", {}),
    }
    return {
        "all_opinions": all_opinions,
        "current_step": "Cross-Agent Boardroom Debate",
    }

async def debate_node(state: BoardroomState) -> Dict[str, Any]:
    """Simulates active multi-agent cross-examination round."""
    logger.info("Executing Round-table Debate Node...")
    opinions = state.get("all_opinions", {})
    ceo = opinions.get("CEO", {})
    cfo = opinions.get("CFO", {})
    cto = opinions.get("CTO", {})
    risk = opinions.get("Risk Analyst", {})
    mentor = opinions.get("Mentor", {})

    def summary(opinion: Dict[str, Any], limit: int = 240) -> str:
        analysis = str(opinion.get("analysis", "No detailed rationale provided.")).strip()
        return analysis[:limit] + ("..." if len(analysis) > limit else "")

    # Construct dynamic, insightful debate turns
    debate_turns = [
        {
            "speaker": "CFO",
            "target_agent": "CEO",
            "turn_type": "critique",
            "round_number": 1,
            "content": (
                f"The CEO recommends '{ceo.get('recommended_option', 'an undecided option')}'. "
                f"Their rationale is: {summary(ceo)} My concern is whether the financial downside is explicitly protected."
            )
        },
        {
            "speaker": "CEO",
            "target_agent": "CFO",
            "turn_type": "defense",
            "round_number": 1,
            "content": (
                f"The CFO recommends '{cfo.get('recommended_option', 'an undecided option')}' and argues: {summary(cfo)} "
                f"That is a useful constraint, but the upside case deserves equal weight."
            )
        },
        {
            "speaker": "CTO",
            "target_agent": "Board",
            "turn_type": "statement",
            "round_number": 1,
            "content": (
                f"The CTO recommends '{cto.get('recommended_option', 'an undecided option')}'. "
                f"The technical case is: {summary(cto)}"
            )
        },
        {
            "speaker": "Risk Analyst",
            "target_agent": "CEO",
            "turn_type": "critique",
            "round_number": 2,
            "content": (
                f"The Risk Analyst recommends '{risk.get('recommended_option', 'an undecided option')}' and flags: {summary(risk)} "
                "Any recommendation should convert those concerns into measurable tripwires."
            )
        },
        {
            "speaker": "Mentor",
            "target_agent": "Board",
            "turn_type": "synthesis",
            "round_number": 2,
            "content": (
                f"The Mentor recommends '{mentor.get('recommended_option', 'an undecided option')}' based on: {summary(mentor)} "
                "The final decision should preserve both the user's values and their ability to change course."
            )
        }
    ]

    return {"debate_turns": debate_turns, "current_step": "Chairman Final Synthesis"}

async def chairman_node(state: BoardroomState) -> Dict[str, Any]:
    """Phase final: Chairman synthesizes all deliberations and issues final verdict."""
    logger.info("Executing Chairman Node...")
    final_report = await chairman_agent.analyze(
        decision_data=state["decision_data"],
        user_profile=state.get("user_profile"),
        historical_memories=state.get("historical_memories", []),
        other_opinions=state.get("all_opinions", {}),
    )
    return {
        "final_report": final_report,
        "current_step": "Completed",
        "status": "completed"
    }

def build_decision_graph() -> StateGraph:
    """Builds and compiles the LangGraph StateGraph workflow."""
    workflow = StateGraph(BoardroomState)

    # Add Nodes
    workflow.add_node("analyze", analyze_node)
    workflow.add_node("ceo", ceo_node)
    workflow.add_node("cfo", cfo_node)
    workflow.add_node("cto", cto_node)
    workflow.add_node("risk", risk_node)
    workflow.add_node("mentor", mentor_node)
    workflow.add_node("aggregate", aggregate_opinions_node)
    workflow.add_node("debate", debate_node)
    workflow.add_node("chairman", chairman_node)

    # Set Entry Point
    workflow.set_entry_point("analyze")

    # Fan out independent opinions, then wait for all five before aggregation.
    for advisor_node in ("ceo", "cfo", "cto", "risk", "mentor"):
        workflow.add_edge("analyze", advisor_node)
        workflow.add_edge(advisor_node, "aggregate")

    # Connect Aggregate to Debate and Chairman
    workflow.add_edge("aggregate", "debate")
    workflow.add_edge("debate", "chairman")
    workflow.add_edge("chairman", END)

    return workflow.compile()

# Pre-compiled workflow graph instance
decision_graph = build_decision_graph()
