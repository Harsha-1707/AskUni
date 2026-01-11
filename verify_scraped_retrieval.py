from main import CollegeChatbot

def test_scraped_retrieval():
    print("Initializing Chatbot...")
    bot = CollegeChatbot()
    
    query = "What is the vision of the university?"
    print(f"\nQUERY: {query}")
    
    result = bot.process_query(query)
    print(f"RESPONSE:\n{result['response']}")
    print(f"SOURCE: {result['source']}")
    print(f"DOCS: {[d['metadata']['source'] for d in result['retrieved_docs']]}")

if __name__ == "__main__":
    test_scraped_retrieval()
