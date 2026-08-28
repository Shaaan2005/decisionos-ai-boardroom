import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Integer, Float
from sqlalchemy.orm import relationship
from app.database.base import Base

class DecisionReport(Base):
    __tablename__ = "decision_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    decision_id = Column(String(36), ForeignKey("decisions.id"), unique=True, nullable=False)
    executive_summary = Column(Text, nullable=False)
    recommended_option = Column(String(255), nullable=False)
    confidence_score = Column(Float, default=0.85)  # 0.0 to 1.0
    strategic_verdict = Column(Text, nullable=False)
    key_agreements = Column(JSON, default=list)
    key_disagreements = Column(JSON, default=list)
    risk_factors = Column(JSON, default=list)  # list of {"risk": str, "severity": str, "mitigation": str}
    growth_opportunities = Column(JSON, default=list)
    action_plan_steps = Column(JSON, default=list)  # list of actionable next steps
    explainability_notes = Column(Text, nullable=True)  # "Why the board reached this conclusion"
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    decision = relationship("Decision", back_populates="report")
    deliberations = relationship("AgentDeliberation", back_populates="report", cascade="all, delete-orphan")
    debate_turns = relationship("DebateTurn", back_populates="report", cascade="all, delete-orphan")


class AgentDeliberation(Base):
    __tablename__ = "agent_deliberations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("decision_reports.id"), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False)  # CEO, CFO, CTO, Risk Analyst, Mentor, Chairman
    agent_title = Column(String(100), nullable=False)
    recommended_option = Column(String(255), nullable=False)
    perspective_score = Column(Float, default=0.8)  # Agent's confidence or enthusiasm
    analysis = Column(Text, nullable=False)
    key_quotes = Column(JSON, default=list)
    top_priorities = Column(JSON, default=list)
    concerns = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationship
    report = relationship("DecisionReport", back_populates="deliberations")


class DebateTurn(Base):
    __tablename__ = "debate_turns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("decision_reports.id"), nullable=False, index=True)
    speaker = Column(String(100), nullable=False)
    target_agent = Column(String(100), nullable=True)  # Who they are responding/challenging
    turn_type = Column(String(50), default="rebuttal")  # statement, critique, defense, synthesis
    content = Column(Text, nullable=False)
    round_number = Column(Integer, default=1)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationship
    report = relationship("DecisionReport", back_populates="debate_turns")


class DecisionOutcome(Base):
    __tablename__ = "decision_outcomes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    decision_id = Column(String(36), ForeignKey("decisions.id"), unique=True, nullable=False)
    actual_choice = Column(String(255), nullable=False)
    follow_up_period = Column(String(50), default="3_months")  # 1_month, 3_months, 6_months, 1_year
    satisfaction_score = Column(Integer, default=8)  # 1 to 10
    actual_outcome_description = Column(Text, nullable=False)
    lessons_learned = Column(Text, nullable=False)
    retrospective_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationship
    decision = relationship("Decision", back_populates="outcome")
