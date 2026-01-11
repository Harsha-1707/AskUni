from main import CollegeChatbot
import os

def check_mistral_setup():
    print("--- Checking Mistral Integration ---")
    
    # Ensure config is re-read
    bot = CollegeChatbot()
    
    # Check if we are using MistralLLM instance
    llm_class = bot.llm.__class__.__name__
    print(f"LLM Class: {llm_class}")
    
    if llm_class == "MistralLLM":
        print("SUCCESS: MistralLLM loaded as default.")
    else:
        print(f"FAILURE: Expected MistralLLM, got {llm_class}")
        
    # Check "is_active" status
    active = bot.llm.is_active()
    print(f"Is LLM Active: {active}")
    
    if not active:
        print("(Expected if MISTRAL_API_KEY is not set)")

    # Dry run query
    res = bot.process_query("Hello")
    print(f"Response Source: {res['source']}")

if __name__ == "__main__":
    check_mistral_setup()
