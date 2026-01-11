from typing import Optional

class RuleEngine:
    def __init__(self):
        self.static_responses = {
            "out_of_scope": "I can only answer questions related to college admissions, courses, and campus life. Please ask something else.",
            "emergency": "For emergencies, please contact campus security at 555-0199 immediately.",
            "greeting": "Hello! I am the College Information Assistant. How can I help you today?"
        }

    def get_rule_based_response(self, intent: str, query: str = "") -> Optional[str]:
        """
        Returns a static response if the intent matches a rule, else None.
        """
        if intent == "greeting":
            return self.static_responses["greeting"]
            
        # Example of specific query matching
        if "who are you" in query.lower():
            return "I am an AI assistant designed to help you with college information."
            
        if not self._is_college_related(query) and intent == "general_query":
             # This is a weak check, relying on previous intent classification is better
             pass

        return None

    def _is_college_related(self, query: str) -> bool:
        # Placeholder for more complex scope checking
        return True
