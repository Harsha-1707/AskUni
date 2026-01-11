import os
import yaml
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple

class Retriever:
    def __init__(self, config_path: str = "config.yaml"):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)
            
        self.vector_store_path = self.config["paths"]["vector_store"]
        self.model_name = self.config["rag"]["embedding_model"]
        self.top_k = self.config["rag"]["top_k"]
        self.threshold = self.config["rag"]["similarity_threshold"]

        print(f"Loading Retriever with model: {self.model_name}")
        self.model = SentenceTransformer(self.model_name)
        
        self.index = None
        self.chunks = []
        self.metadata = []
        self._load_index()

    def _load_index(self):
        index_file = os.path.join(self.vector_store_path, "index.faiss")
        chunks_file = os.path.join(self.vector_store_path, "chunks.pkl")

        if os.path.exists(index_file) and os.path.exists(chunks_file):
            self.index = faiss.read_index(index_file)
            with open(chunks_file, "rb") as f:
                self.chunks, self.metadata = pickle.load(f)
            print("Vector store loaded successfully.")
        else:
            print("Vector store not found. Please run ingestion first.")

    def search(self, query: str) -> List[Dict]:
        if not self.index:
            return []

        query_vector = self.model.encode([query]).astype('float32')
        faiss.normalize_L2(query_vector)
        
        distances, indices = self.index.search(query_vector, self.top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            score = distances[0][i]
            if idx == -1 or score < self.threshold:
                continue
                
            results.append({
                "content": self.chunks[idx],
                "metadata": self.metadata[idx],
                "score": float(score)
            })
            
        return results

if __name__ == "__main__":
    # Test text
    retriever = Retriever()
    res = retriever.search("What are the admission fees?")
    for r in res:
        print(f"[{r['score']:.4f}] {r['content'][:100]}...")
