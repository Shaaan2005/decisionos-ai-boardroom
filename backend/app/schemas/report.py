from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict

class AgentDeliberationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    report_id: str
    agent_name: str
    agent_title: str
    recommended_option: str
    perspective_score: float
    analysis: str
    key_quotes: List[str] = []
    top_priorities: List[str] = []
    concerns: List[str] = []
    created_at: datetime

class DebateTurnResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    report_id: str
    speaker: str
    target_agent: Optional[str] = None
    turn_type: str
    content: str
    round_number: int
    timestamp: datetime

class DecisionReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    decision_id: str
    executive_summary: str
    recommended_option: str
    confidence_score: float
    strategic_verdict: str
    key_agreements: List[str] = []
    key_disagreements: List[str] = []
    risk_factors: List[Dict[str, Any]] = []
    growth_opportunities: List[str] = []
    action_plan_steps: List[str] = []
    explainability_notes: Optional[str] = None
    created_at: datetime
    deliberations: List[AgentDeliberationResponse] = []
    debate_turns: List[DebateTurnResponse] = []

class ChatAttachment(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    file_type: str = Field(min_length=1, max_length=100)
    data: Optional[str] = Field(default=None, max_length=5_000_000)
    size: Optional[int] = Field(default=0, ge=0, le=3_700_000)

class InteractiveChatRequest(BaseModel):
    agent_name: Optional[str] = None
    question: str = Field(min_length=1, max_length=5_000)
    attachments: Optional[List[ChatAttachment]] = Field(default_factory=list, max_length=5)

class InteractiveChatResponse(BaseModel):
    responder: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
