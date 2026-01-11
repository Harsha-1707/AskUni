import os
import yaml
from typing import Dict, Any, Optional

try:
    from llama_cpp import Llama
except ImportError:
    Llama = None

class LocalLLM:
    def __init__(self, config_path: str = "config.yaml"):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)
            
        self.model_path = self.config["llm"].get("model_path", "")
        self.context_window = self.config["llm"]["context_window"]
        self.max_tokens = self.config["llm"]["max_new_tokens"]
        self.temp = self.config["llm"]["temperature"]
        
        self.llm = None
        # Lazy load or load on init depending on preference.
        # Here we attempt to load if path exists.
        
        if Llama and os.path.exists(self.model_path):
            print(f"Loading Local LLM from {self.model_path}...")
            # n_gpu_layers=-1 enables Metal (MPS) on Mac if installed with Metal support
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=self.context_window,
                n_gpu_layers=-1, 
                verbose=False
            )
        else:
            print(f"Warning: LLM model not found at {self.model_path} or llama-cpp-python not installed.")
            print("The system will function in Retrieval-Only mode or fail gracefully.")

    def generate_response(self, system_prompt: str, user_query: str, context: str, retrieved_chunks: str) -> str:
        if not self.llm:
            return "Error: Local LLM is not loaded. Please check your model path and installation."

        prompt = f"""
{system_prompt}

CONTEXT:
{context}

REFERENCE DOCUMENTS:
{retrieved_chunks}

QUESTION:
{user_query}

INSTRUCTIONS:
- Answer clearly
- Use bullet points if needed
- Do not guess
"""
        try:
            output = self.llm(
                prompt,
                max_tokens=self.max_tokens,
                stop=["Question:", "System:", "User:"],
                temperature=self.temp,
                echo=False
            )
            return output['choices'][0]['text'].strip()
        except Exception as e:
            return f"Error generating response: {str(e)}"

    def is_active(self) -> bool:
        return self.llm is not None
