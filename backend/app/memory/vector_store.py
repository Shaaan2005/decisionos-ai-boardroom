import os
import math
import logging
import hashlib
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class LightweightEmbeddingFunction:
    """Fast, deterministic zero-dependency embedding function for ChromaDB.
    Produces 128-dimensional normalized semantic-hash vector representations.
    Ensures zero external model download latency and 100% offline reliability.
    """
    def __init__(self, dim: int = 128):
        self.dim = dim

    def __call__(self, input: List[str]) -> List[List[float]]:
        embeddings = []
        for text in input:
            tokens = text.lower().split()
            vec = [0.0] * self.dim
            for token in tokens:
                # Hash token into vector buckets
                h = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16)
                idx = h % self.dim
                sign = 1.0 if ((h >> 8) % 2 == 0) else -1.0
                vec[idx] += sign * (1.0 + math.log(1 + len(token)))
            
            # Normalize vector
            norm = math.sqrt(sum(x * x for x in vec)) or 1.0
            norm_vec = [x / norm for x in vec]
            embeddings.append(norm_vec)
        return embeddings

class ChromaVectorStore:
    """Manages persistent ChromaDB vector collections for user decisions, profiles, and outcomes."""

    def __init__(self, persist_dir: str = settings.CHROMA_PERSIST_DIR):
        self.persist_dir = persist_dir
        self.embedding_fn = LightweightEmbeddingFunction()
        self.client = None
        self.collection = None
        self._memory_cache = {}  # In-memory fallback dictionary: {user_id: [memories]}
        self._init_chroma()

    def _init_chroma(self):
        """Initializes ChromaDB persistent client with custom fast embedding function."""
        try:
            import chromadb
            from chromadb.config import Settings as ChromaSettings

            os.makedirs(self.persist_dir, exist_ok=True)
            self.client = chromadb.PersistentClient(
                path=self.persist_dir,
                settings=ChromaSettings(anonymized_telemetry=False, is_persistent=True)
            )
            self.collection = self.client.get_or_create_collection(
                name="decision_memory_vault_v2",
                embedding_function=self.embedding_fn,
                metadata={"description": "DecisionOS user decision history and retrospective lessons"}
            )
            logger.info("ChromaDB vector store with fast embedding function initialized successfully.")
        except Exception as e:
            logger.warning(f"ChromaDB initialization failed: {e}. Falling back to resilient in-memory index.")
            self.client = None
            self.collection = None

    def add_memory(
        self,
        memory_id: str,
        user_id: str,
        title: str,
        category: str,
        choice: str,
        outcome: str,
        lesson: str,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Indexes a past decision and outcome into the vector store."""
        document_text = (
            f"Decision: {title}\n"
            f"Category: {category}\n"
            f"Option Chosen: {choice}\n"
            f"Realized Outcome: {outcome}\n"
            f"Core Lesson Learned: {lesson}"
        )
        
        meta = {
            "id": memory_id,
            "user_id": user_id,
            "title": title,
            "category": category,
            "choice": choice,
            "outcome": outcome,
            "lesson": lesson,
            **(metadata or {})
        }

        # Save to in-memory fallback
        if user_id not in self._memory_cache:
            self._memory_cache[user_id] = []
        self._memory_cache[user_id].append(meta)

        if self.collection:
            try:
                self.collection.upsert(
                    ids=[memory_id],
                    documents=[document_text],
                    metadatas=[meta]
                )
                logger.info(f"Indexed memory {memory_id} in ChromaDB.")
            except Exception as e:
                logger.error(f"Error adding memory to ChromaDB: {e}")

    def query_memories(
        self,
        user_id: str,
        query_text: str,
        n_results: int = 3
    ) -> List[Dict[str, Any]]:
        """Retrieves semantically similar historical decisions and lessons for a given user."""
        if self.collection:
            try:
                results = self.collection.query(
                    query_texts=[query_text],
                    where={"user_id": user_id},
                    n_results=n_results
                )
                memories = []
                if results and results.get("metadatas") and len(results["metadatas"]) > 0:
                    for meta in results["metadatas"][0]:
                        memories.append(meta)
                if memories:
                    return memories
            except Exception as e:
                logger.warning(f"Error querying ChromaDB memories: {e}")

        # Fallback to in-memory cache
        user_mems = self._memory_cache.get(user_id, [])
        return user_mems[:n_results]

    def get_all_user_memories(self, user_id: str) -> List[Dict[str, Any]]:
        """Retrieves all indexed memories for a specific user."""
        if self.collection:
            try:
                results = self.collection.get(where={"user_id": user_id})
                if results and results.get("metadatas"):
                    return results["metadatas"]
            except Exception as e:
                logger.warning(f"Error retrieving all user memories: {e}")
        return self._memory_cache.get(user_id, [])

    def delete_memory(self, memory_id: str, user_id: str):
        """Remove a user's memory from both persistent and fallback stores."""
        self._memory_cache[user_id] = [
            memory for memory in self._memory_cache.get(user_id, [])
            if memory.get("id") != memory_id
        ]
        if self.collection:
            try:
                self.collection.delete(ids=[memory_id])
            except Exception as e:
                logger.warning(f"Error deleting memory {memory_id} from ChromaDB: {e}")

# Singleton instance
vector_store = ChromaVectorStore()
