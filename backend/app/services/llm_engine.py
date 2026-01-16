import os
from mistralai import Mistral
from app.core.config import settings
from app.core.logging import logger

class LLMEngine:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.mistral_client = None
        
        if self.provider == "mistral":
            if settings.MISTRAL_API_KEY:
                self.mistral_client = Mistral(api_key=settings.MISTRAL_API_KEY)
                logger.info("Mistral API Client initialized.")
            else:
                logger.warning("Mistral Provider selected but no API Key found.")

    def generate(self, system_prompt: str, user_query: str, context: str, retrieved_chunks: str) -> str:
        full_prompt = f"""
{system_prompt}

CONTEXT_HISTORY:
{context}

REFERENCE_DOCUMENTS:
{retrieved_chunks}

USER_QUESTION:
{user_query}

ANSWER:
"""
        if self.provider == "mistral" and self.mistral_client:
            try:
                response = self.mistral_client.chat.complete(
                    model="mistral-large-latest",
                    messages=[{"role": "user", "content": full_prompt}],
                    temperature=0.1
                )
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"Mistral API failed: {e}")
                return self._fallback_response(retrieved_chunks)
        
        # Local LLM integration would go here (omitted for brevity/compatibility)
        # fallback to retrieval only
        return self._fallback_response(retrieved_chunks)

    def _fallback_response(self, retrieved_chunks: str) -> str:
        if not retrieved_chunks:
            return "I'm sorry, I couldn't find any relevant information."
        return f"**I am unable to generate a synthesized answer right now, but here is what I found:**\n\n{retrieved_chunks}"

llm_engine = LLMEngine()
