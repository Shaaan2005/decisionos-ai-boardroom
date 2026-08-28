import logging
from typing import List, Dict, Any, Optional
from app.memory.vector_store import vector_store

logger = logging.getLogger(__name__)

class MemoryManager:
    """Manages high-level semantic memory operations for DecisionOS."""

    def __init__(self, store=vector_store):
        self.store = store

    def index_decision_outcome(
        self,
        decision_id: str,
        user_id: str,
        title: str,
        category: str,
        choice: str,
        outcome: str,
        lesson: str,
        satisfaction_score: int = 8,
    ):
        """Indexes a recorded retrospective outcome into semantic memory."""
        self.store.add_memory(
            memory_id=f"outcome_{decision_id}",
            user_id=user_id,
            title=title,
            category=category,
            choice=choice,
            outcome=outcome,
            lesson=lesson,
            metadata={
                "decision_id": decision_id,
                "satisfaction_score": satisfaction_score
            }
        )

    def retrieve_context_for_decision(
        self,
        user_id: str,
        title: str,
        description: str,
        category: str,
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """Retrieves past decisions and lessons most relevant to the current decision dilemma."""
        query_text = f"{title} {description} {category}"
        memories = self.store.query_memories(user_id=user_id, query_text=query_text, n_results=limit)
        
        # If no memories found, return structured empty list (or seeded memory if available)
        return memories

    def get_memory_vault(self, user_id: str) -> List[Dict[str, Any]]:
        """Returns all memories stored in the user's vector memory vault."""
        return self.store.get_all_user_memories(user_id=user_id)

    def remove_decision_outcome(self, decision_id: str, user_id: str):
        """Remove memory generated from a deleted decision outcome."""
        self.store.delete_memory(memory_id=f"outcome_{decision_id}", user_id=user_id)

memory_manager = MemoryManager()
