from typing import List, Dict, Any
import time
from app.services.retriever import retriever
from app.services.llm_engine import llm_engine
from app.core.logging import logger

class ChatOrchestrator:
    def process_query(self, query: str, history: List[str] = []) -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Retrieval
        docs = retriever.search(query)
        
        # 2. Format Docs
        doc_text = ""
        sources = []
        max_score = 0.0
        
        for i, doc in enumerate(docs):
            doc_text += f"[{i+1}] {doc['content']}\n\n"
            sources.append({
                "source": doc["metadata"].get("source", "Unknown"),
                "score": doc["score"],
                "content": doc["content"][:200] + "..."
            })
            if doc["score"] > max_score:
                max_score = doc["score"]
        
        # 3. Context (Simple string join for now)
        context_str = "\n".join(history[-5:]) if history else "No previous context."
        
        # 4. Generation
        if not docs:
            answer = "I couldn't find any specific information about that in my documents."
            confidence = 0.0
        else:
            system_prompt = "You are a helpful college assistant. Use the provided documents to answer. If the answer is not in the documents, say so. Cite sources using [1] notation."
            answer = llm_engine.generate(system_prompt, query, context_str, doc_text)
            confidence = max_score # Simplified confidence metric
            
        processing_time = time.time() - start_time
        
        return {
            "answer": answer,
            "sources": sources,
            "confidence_score": confidence,
            "processing_time": processing_time,
            "metadata": {"doc_count": len(docs), "engine": "mistral" if llm_engine.mistral_client else "fallback"}
        }

orchestrator = ChatOrchestrator()
