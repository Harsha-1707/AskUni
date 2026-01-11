import os
import yaml
from dotenv import load_dotenv

load_dotenv()

from cag.intent import IntentClassifier
from cag.context import ConversationManager
from cag.rules import RuleEngine
from rag.retrieve import Retriever
from llm.local_llm import LocalLLM

class CollegeChatbot:
    def __init__(self, config_path: str = "config.yaml"):
        print("Initializing College Information Chatbot...")
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)
            
        self.intent_classifier = IntentClassifier()
        self.conversation_manager = ConversationManager()
        self.rule_engine = RuleEngine()
        self.retriever = Retriever(config_path)
        
        provider = self.config["llm"].get("provider", "local")
        if provider == "mistral":
            from llm.mistral_llm import MistralLLM
            self.llm = MistralLLM(config_path)
        else:
            self.llm = LocalLLM(config_path)
        
        # Performance/Mode flags
        self.use_llm = True
        
    def process_query(self, user_query: str, history: list = []) -> dict:
        """
        Main pipeline: Intent -> Context -> Rule Check -> Retrieval -> LLM/Direct Answer
        """
        # 0. Update Conversation Context
        # Note: In a stateless API, history might be passed in. 
        # For Gradio, we might manage state there. 
        # Here we assume single session or passed state.
        
        # 1. Intent Detection
        intent = self.intent_classifier.detect_intent(user_query)
        
        # 2. Rule Check (Fast Path)
        rule_response = self.rule_engine.get_rule_based_response(intent, user_query)
        if rule_response:
             self.conversation_manager.add_turn(user_query, rule_response)
             return {
                 "response": rule_response,
                 "source": "Rule Engine",
                 "intent": intent,
                 "retrieved_docs": []
             }
             
        # 3. Retrieval (RAG)
        retrieved_docs = self.retriever.search(user_query)
        doc_text = "\n\n".join([f"[{i+1}] {d['content']}" for i, d in enumerate(retrieved_docs)])
        
        # 4. Decision: LLM vs Direct
        # If no docs found and not a general chat, might be unanswerable
        if not retrieved_docs and intent != "greeting":
             resp = "I'm sorry, I couldn't find any relevant information in the provided college documents."
             return {
                 "response": resp,
                 "source": "System (No Data)",
                 "intent": intent,
                 "retrieved_docs": []
             }

        # 5. LLM Generation
        system_prompt = "SYSTEM:\nYou are a college information assistant.\nYou must ONLY use the provided documents.\nIf information is missing, say so clearly."
        context_str = self.conversation_manager.get_context_block()
        
        if self.llm.is_active():
            final_response = self.llm.generate_response(
                system_prompt=system_prompt,
                user_query=user_query,
                context=context_str,
                retrieved_chunks=doc_text
            )
            source = "Local LLM"
        else:
            # Fallback if no LLM loaded
            final_response = f"**Top relevant information found:**\n\n{doc_text}\n\n*(LLM not active, showing raw results)*"
            source = "Retrieval Only"

        self.conversation_manager.add_turn(user_query, final_response)
        
        return {
            "response": final_response,
            "source": source,
            "intent": intent,
            "retrieved_docs": retrieved_docs
        }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="College Chatbot CLI")
    parser.add_argument("--ingest", action="store_true", help="Run data ingestion and exit")
    parser.add_argument("--scrape", type=str, help="URL to scrape (e.g., https://college.edu)")
    args = parser.parse_args()

    if args.scrape:
        from scraper.spider import Spider
        spider = Spider(args.scrape)
        spider.run()
    elif args.ingest:
        from rag.ingest import Ingestor
        ingestor = Ingestor()
        ingestor.process_and_index()
    else:
        bot = CollegeChatbot()
        print("Chatbot started. Type 'exit' to quit.")
        while True:
            try:
                q = input("\nUser: ")
                if q.lower() in ["exit", "quit"]:
                    break
                res = bot.process_query(q)
                print(f"Bot: {res['response']}")
                print(f"Debug: Intent={res['intent']}, Source={res['source']}")
            except KeyboardInterrupt:
                break
