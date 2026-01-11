from main import CollegeChatbot

print("--- Initializing Chatbot ---")
bot = CollegeChatbot()

print("\n--- Test 1: Retrieval Only (Fee Query) ---")
q1 = "What are the B.Tech fees?"
res1 = bot.process_query(q1)
print(f"QUERY: {q1}")
print(f"RESPONSE:\n{res1['response'][:200]}...") # Truncate for display
print(f"SOURCE: {res1['source']}")

print("\n--- Test 2: Intent/Rule (Greeting) ---")
q2 = "Hello"
res2 = bot.process_query(q2)
print(f"QUERY: {q2}")
print(f"RESPONSE: {res2['response']}")
print(f"SOURCE: {res2['source']}")

print("\n--- Test 3: LLM Status ---")
print(f"LLM Active: {bot.llm.is_active()}")

if "Retrieval" in res1['source'] and not bot.llm.is_active():
    print("\n[SUCCESS] System correctly fell back to Retrieval Mode due to missing LLM.")
else:
    print(f"\n[INFO] LLM seemingly active or unexpected source: {res1['source']}")
