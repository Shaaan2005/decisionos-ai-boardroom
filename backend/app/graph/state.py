from typing import TypedDict, Dict, Any, List, Optional

class BoardroomState(TypedDict):
    """The multi-agent state container passed between LangGraph nodes."""
    decision_data: Dict[str, Any]
    user_profile: Optional[Dict[str, Any]]
    historical_memories: List[Dict[str, Any]]
    
    # Analyzer outputs
    analysis_framework: Dict[str, Any]
    
    # Individual board member deliberations
    ceo_opinion: Dict[str, Any]
    cfo_opinion: Dict[str, Any]
    cto_opinion: Dict[str, Any]
    risk_opinion: Dict[str, Any]
    mentor_opinion: Dict[str, Any]
    
    # Combined opinions map
    all_opinions: Dict[str, Any]
    
    # Active debate turns between agents
    debate_turns: List[Dict[str, Any]]
    
    # Final Chairman synthesis and verdict
    final_report: Dict[str, Any]
    
    # Execution logs & metadata
    current_step: str
    status: str
