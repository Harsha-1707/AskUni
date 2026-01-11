
from main import CollegeChatbot

def test_retrieval():
    print("Initializing Chatbot for Retrieval Test...")
    bot = CollegeChatbot()
    
    query = "BANANA_123"
    print(f"Searching for unique token: {query}")
    
    result = bot.process_query(query)
    response = result["response"]
    source = result["source"]
    retrieved_docs = result["retrieved_docs"]
    
    print(f"Response: {response}")
    print(f"Source: {source}")
    print(f"Retrieved Docs: {retrieved_docs}")
    
    found = False
    for doc in retrieved_docs:
        if query in doc["content"]:
            found = True
            break
            
    if found:
        print("SUCCESS: Unique token found in retrieved documents.")
    else:
        print("FAILURE: Unique token NOT found.")

if __name__ == "__main__":
    test_retrieval()
