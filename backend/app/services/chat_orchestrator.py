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
            system_prompt = """You are AskUni, a knowledgeable and friendly assistant for Anurag University. Answer the student's question clearly and concisely using the provided reference documents.

Guidelines:
- Write in plain, natural English. Do NOT use markdown symbols like **, *, or #.
- Use numbered lists (1. 2. 3.) when listing multiple items.
- Keep answers focused and to the point — 2 to 5 sentences for simple facts, a short numbered list for multi-part answers.
- Always cite your source at the end using a brief note like "Source: fee_structure.txt".
- If the answer is not in the documents, honestly say: "I don't have that information in my current knowledge base."
- Never make up information."""
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
