import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.user import User
from app.models.decision import Decision, DecisionOption
from app.models.report import DecisionReport, DecisionOutcome
from app.schemas.decision import (
    DecisionCreate, DecisionUpdate, DecisionResponse,
    DecisionOutcomeCreate, DecisionOutcomeResponse
)
from app.schemas.report import DecisionReportResponse
from app.core.dependencies import get_current_user
from app.graph.graph_runner import run_boardroom_deliberation
from app.memory.memory_manager import memory_manager
from app.core.rate_limit import enforce_user_rate_limit

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/decisions", tags=["Decisions & Deliberations"])

@router.post("", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
async def create_decision(
    payload: DecisionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new decision dilemma with options and constraints."""
    decision = Decision(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        urgency=payload.urgency,
        timeline=payload.timeline,
        risk_tolerance=payload.risk_tolerance,
        constraints=payload.constraints,
        primary_goal=payload.primary_goal,
        status="pending"
    )
    db.add(decision)
    await db.flush()

    for idx, opt in enumerate(payload.options):
        db_option = DecisionOption(
            decision_id=decision.id,
            label=opt.label,
            description=opt.description,
            pros=opt.pros,
            cons=opt.cons,
            order_index=idx
        )
        db.add(db_option)

    await db.commit()

    # Refetch with relations
    res = await db.execute(
        select(Decision)
        .options(selectinload(Decision.options), selectinload(Decision.outcome))
        .filter(Decision.id == decision.id)
    )
    return res.scalars().first()

@router.get("", response_model=List[DecisionResponse])
async def list_user_decisions(
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all decisions created by the current user."""
    query = (
        select(Decision)
        .options(selectinload(Decision.options), selectinload(Decision.outcome))
        .filter(Decision.user_id == current_user.id)
        .order_by(Decision.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    if category:
        query = query.filter(Decision.category == category)
    if status_filter:
        query = query.filter(Decision.status == status_filter)

    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{decision_id}", response_model=DecisionResponse)
async def get_decision(
    decision_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a single decision by ID."""
    result = await db.execute(
        select(Decision)
        .options(selectinload(Decision.options), selectinload(Decision.outcome))
        .filter(Decision.id == decision_id, Decision.user_id == current_user.id)
    )
    decision = result.scalars().first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision

@router.post("/{decision_id}/deliberate", response_model=DecisionReportResponse)
async def trigger_board_meeting(
    decision_id: str,
    language: str = Query(default="en", min_length=2, max_length=10),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Convene the AI Board of Directors to deliberate, debate, and generate a final recommendation."""
    enforce_user_rate_limit(current_user.id, "Deliberation request")
    try:
        report = await run_boardroom_deliberation(
            decision_id=decision_id,
            user_id=current_user.id,
            db=db,
            language=language,
        )
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        logger.exception("Deliberation failed for decision %s", decision_id)
        raise HTTPException(status_code=500, detail="Deliberation failed. Please try again.")

@router.get("/{decision_id}/report", response_model=DecisionReportResponse)
async def get_decision_report(
    decision_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the generated Board of Directors report for a decision."""
    # Verify decision ownership
    dec_res = await db.execute(
        select(Decision).filter(Decision.id == decision_id, Decision.user_id == current_user.id)
    )
    decision = dec_res.scalars().first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    result = await db.execute(
        select(DecisionReport)
        .options(
            selectinload(DecisionReport.deliberations),
            selectinload(DecisionReport.debate_turns)
        )
        .filter(DecisionReport.decision_id == decision_id)
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Deliberation report has not been generated yet")
    return report

@router.post("/{decision_id}/outcome", response_model=DecisionOutcomeResponse)
async def record_decision_outcome(
    decision_id: str,
    payload: DecisionOutcomeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Record actual real-world outcome and retrospective reflections, indexing into vector memory."""
    # Verify decision
    result = await db.execute(
        select(Decision).filter(Decision.id == decision_id, Decision.user_id == current_user.id)
    )
    decision = result.scalars().first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    # Check existing outcome
    out_res = await db.execute(
        select(DecisionOutcome).filter(DecisionOutcome.decision_id == decision_id)
    )
    existing_outcome = out_res.scalars().first()
    if existing_outcome:
        existing_outcome.actual_choice = payload.actual_choice
        existing_outcome.follow_up_period = payload.follow_up_period
        existing_outcome.satisfaction_score = payload.satisfaction_score
        existing_outcome.actual_outcome_description = payload.actual_outcome_description
        existing_outcome.lessons_learned = payload.lessons_learned
        outcome = existing_outcome
    else:
        outcome = DecisionOutcome(
            decision_id=decision_id,
            actual_choice=payload.actual_choice,
            follow_up_period=payload.follow_up_period,
            satisfaction_score=payload.satisfaction_score,
            actual_outcome_description=payload.actual_outcome_description,
            lessons_learned=payload.lessons_learned
        )
        db.add(outcome)

    await db.commit()
    await db.refresh(outcome)

    # Index into ChromaDB vector memory for future board wisdom
    memory_manager.index_decision_outcome(
        decision_id=decision_id,
        user_id=current_user.id,
        title=decision.title,
        category=decision.category,
        choice=payload.actual_choice,
        outcome=payload.actual_outcome_description,
        lesson=payload.lessons_learned,
        satisfaction_score=payload.satisfaction_score
    )

    return outcome

@router.delete("/{decision_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_decision(
    decision_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a decision and its associated reports."""
    result = await db.execute(
        select(Decision).filter(Decision.id == decision_id, Decision.user_id == current_user.id)
    )
    decision = result.scalars().first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    await db.delete(decision)
    await db.commit()
    memory_manager.remove_decision_outcome(decision_id=decision_id, user_id=current_user.id)
