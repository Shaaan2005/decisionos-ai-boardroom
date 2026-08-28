from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.models.user import User
from app.core.dependencies import get_current_user
from app.memory.memory_manager import memory_manager

router = APIRouter(prefix="/memory", tags=["Memory Vault"])

class MemorySearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=5_000)
    limit: int = Field(default=5, ge=1, le=25)

@router.get("/vault", response_model=List[Dict[str, Any]])
async def get_user_memory_vault(
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all semantic memory embeddings and retrospective reflections stored for the user."""
    memories = memory_manager.get_memory_vault(user_id=current_user.id)
    return memories[:limit]

@router.post("/search", response_model=List[Dict[str, Any]])
async def search_memory_vault(
    payload: MemorySearchRequest,
    current_user: User = Depends(get_current_user)
):
    """Perform a semantic vector similarity search over historical decisions, choices, and lessons learned."""
    results = memory_manager.retrieve_context_for_decision(
        user_id=current_user.id,
        title=payload.query,
        description="",
        category="",
        limit=payload.limit
    )
    return results
