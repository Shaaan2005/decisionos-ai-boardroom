from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field

class UserProfileBase(BaseModel):
    current_role: Optional[str] = None
    career_goals: Optional[str] = None
    financial_runway_months: Optional[str] = None
    default_risk_tolerance: str = "moderate"
    core_values: List[str] = []
    personal_context: Optional[str] = None

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str
    created_at: datetime
    profile: Optional[UserProfileResponse] = None

class ResumeParseRequest(BaseModel):
    text: Optional[str] = Field(default=None, max_length=50_000)
    api_key: Optional[str] = Field(default=None, max_length=512)

class ResumeParseResponse(BaseModel):
    current_role: Optional[str] = None
    career_goals: Optional[str] = None
    financial_runway_months: Optional[str] = "6-12 months"
    default_risk_tolerance: str = "moderate"
    core_values: List[str] = []
    personal_context: Optional[str] = None
    extracted_skills: List[str] = []
    summary: Optional[str] = None
