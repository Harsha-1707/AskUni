import os
import yaml
from mistralai import Mistral

class MistralLLM:
    def __init__(self, config_path: str = "config.yaml"):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)
            
        self.model = self.config["llm"]["mistral"]["model"]
        self.temp = self.config["llm"]["mistral"]["temperature"]
        
        api_key = os.environ.get(self.config["llm"]["mistral"]["api_key_env_var"])
        self.client = None
        
        if api_key:
            print(f"Initializing Mistral API with model: {self.model}")
            self.client = Mistral(api_key=api_key)
        else:
            print("Warning: MISTRAL_API_KEY not found in environment variables.")
            print("The system will function in Retrieval-Only mode.")

    def generate_response(self, system_prompt: str, user_query: str, context: str, retrieved_chunks: str) -> str:
        if not self.client:
            return "Error: Mistral API Key missing. Please set MISTRAL_API_KEY."

        prompt = f"""
{system_prompt}

CONTEXT:
{context}

REFERENCE DOCUMENTS:
{retrieved_chunks}

QUESTION:
{user_query}

INSTRUCTIONS:
- Answer clearly based ONLY on the provided documents.
- If the answer is not in the documents, state that you don't know.
"""
        try:
            chat_response = self.client.chat.complete(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temp,
            )
            return chat_response.choices[0].message.content
        except Exception as e:
            return f"Error calling Mistral API: {str(e)}"

    def is_active(self) -> bool:
        return self.client is not None
