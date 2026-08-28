from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class DecisionOptionCreate(BaseModel):
    label: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=10_000)
    pros: List[str] = Field(default_factory=list, max_length=50)
    cons: List[str] = Field(default_factory=list, max_length=50)

class DecisionOptionResponse(DecisionOptionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    decision_id: str
    order_index: int

class DecisionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=20_000)
    category: str = "Career & Business"
    urgency: str = "Medium"
    timeline: Optional[str] = None
    risk_tolerance: str = "moderate"
    constraints: Dict[str, Any] = Field(default_factory=dict, max_length=50)
    primary_goal: Optional[str] = Field(default=None, max_length=5_000)
    options: List[DecisionOptionCreate] = Field(default_factory=list, max_length=10)

class DecisionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    urgency: Optional[str] = None
    timeline: Optional[str] = None
    risk_tolerance: Optional[str] = None
    constraints: Optional[Dict[str, Any]] = None
    primary_goal: Optional[str] = None
    status: Optional[str] = None

class DecisionOutcomeCreate(BaseModel):
    actual_choice: str
    follow_up_period: str = "3_months"
    satisfaction_score: int = Field(ge=1, le=10)
    actual_outcome_description: str
    lessons_learned: str

class DecisionOutcomeResponse(DecisionOutcomeCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    decision_id: str
    retrospective_date: datetime

class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    description: str
    category: str
    urgency: str
    timeline: Optional[str] = None
    risk_tolerance: str
    constraints: Dict[str, Any]
    primary_goal: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    options: List[DecisionOptionResponse] = []
    outcome: Optional[DecisionOutcomeResponse] = None
