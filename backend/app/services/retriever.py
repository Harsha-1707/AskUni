import os
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
from app.core.config import settings
from app.core.logging import logger

class Retriever:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Retriever, cls).__new__(cls)
            cls._instance.initialize()
        return cls._instance

    def initialize(self):
        self.vector_store_path = settings.VECTOR_STORE_PATH
        self.model_name = settings.EMBEDDING_MODEL
        self.top_k = 5
        self.threshold = 0.6
        
        logger.info(f"Loading Embedding Model: {self.model_name}")
        self.model = SentenceTransformer(self.model_name)
        
        self.index = None
        self.chunks = []
        self.metadata = []
        self._load_index()

    def _load_index(self):
        index_file = os.path.join(self.vector_store_path, "index.faiss")
        chunks_file = os.path.join(self.vector_store_path, "chunks.pkl")

        if os.path.exists(index_file) and os.path.exists(chunks_file):
            try:
                self.index = faiss.read_index(index_file)
                with open(chunks_file, "rb") as f:
                    self.chunks, self.metadata = pickle.load(f)
                logger.info(f"Vector store loaded. {self.index.ntotal} documents indexed.")
            except Exception as e:
                logger.error(f"Failed to load vector store: {e}")
                self.index = None
        else:
            logger.warning(f"Vector store not found at {self.vector_store_path}. RAG will not work.")

    def search(self, query: str) -> List[Dict]:
        if not self.index:
            return []

        query_vector = self.model.encode([query]).astype('float32')
        faiss.normalize_L2(query_vector)
        
        distances, indices = self.index.search(query_vector, self.top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            score = float(distances[0][i])
            if idx == -1 or score < self.threshold:
                continue
                
            results.append({
                "content": self.chunks[idx],
                "metadata": self.metadata[idx],
                "score": score
            })
            
        return results

# Global instance
retriever = Retriever()
