import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from app.database.base import Base

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Career & Business")  # Career & Business, Financial, Startup, Relocation, Personal
    urgency = Column(String(50), default="Medium")  # Low, Medium, High, Immediate
    timeline = Column(String(100), nullable=True)  # e.g., "Within 30 days"
    risk_tolerance = Column(String(50), default="moderate")  # conservative, moderate, aggressive, highly_aggressive
    constraints = Column(JSON, default=dict)  # {"budget": "...", "location": "...", "family": "..."}
    primary_goal = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, deliberating, completed, failed, archived
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="decisions")
    options = relationship("DecisionOption", back_populates="decision", cascade="all, delete-orphan")
    report = relationship("DecisionReport", back_populates="decision", uselist=False, cascade="all, delete-orphan")
    outcome = relationship("DecisionOutcome", back_populates="decision", uselist=False, cascade="all, delete-orphan")


class DecisionOption(Base):
    __tablename__ = "decision_options"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    decision_id = Column(String(36), ForeignKey("decisions.id"), nullable=False, index=True)
    label = Column(String(255), nullable=False)  # e.g., "Option A: Accept Series A Startup Offer"
    description = Column(Text, nullable=False)
    pros = Column(JSON, default=list)
    cons = Column(JSON, default=list)
    order_index = Column(Integer, default=0)

    # Relationship
    decision = relationship("Decision", back_populates="options")
