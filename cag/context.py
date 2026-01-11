from typing import List, Dict

class ConversationManager:
    def __init__(self, max_history: int = 3):
        self.history: List[Dict[str, str]] = []
        self.max_history = max_history
        self.user_role = "student" # Default role

    def add_turn(self, user_query: str, bot_response: str):
        self.history.append({"role": "user", "content": user_query})
        self.history.append({"role": "assistant", "content": bot_response})
        
        # Trim history (keep last N valid turns, i.e., 2*N items)
        if len(self.history) > self.max_history * 2:
            self.history = self.history[-(self.max_history * 2):]

    def get_history_string(self) -> str:
        formatted = ""
        for turn in self.history:
            role = "User" if turn["role"] == "user" else "Assistant"
            formatted += f"{role}: {turn['content']}\n"
        return formatted

    def set_role(self, role: str):
        self.user_role = role

    def get_context_block(self) -> str:
        return f"User Role: {self.user_role}\nPrevious Conversation:\n{self.get_history_string()}"
