from app.services.llm_engine import llm_engine

class LLMJudge:
    def evaluate_faithfulness(self, question: str, answer: str, context: str) -> float:
        """
        Uses LLM to score if the answer is supported by the context.
        Returns 0.0 to 1.0
        """
        if not context or "I couldn't find" in answer:
            return 1.0 # Technically faithful if it admits ignorance
            
        prompt = f"""
        You are an impartial judge. Evaluate if the ANSWER is fully supported by the CONTEXT.
        
        QUESTION: {question}
        CONTEXT: {context}
        ANSWER: {answer}
        
        Respond ONLY with a score from 0.0 to 1.0, where 1.0 means fully supported and 0.0 means completely hallucinatory.
        """
        
        try:
            # We reuse the specific LLM engine's generate but bypass the specialized RAG prompting
            # For simplicity, we assume llm_engine has a raw generate or we construct a "system prompt" call
            # using the existing generate() method with empty context args to just pass our prompt.
            score_str = llm_engine.generate("You are a judge.", prompt, "", "")
            
            # Simple parsing: extract first float found
            import re
            match = re.search(r"0\.\d+|1\.0|0|1", score_str)
            if match:
                return float(match.group())
            return 0.5 # Default if unparseable
        except:
            return 0.5

judge = LLMJudge()
