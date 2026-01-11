from typing import List, Dict

class IntentClassifier:
    def __init__(self):
        # Basic keyword maps for heuristic classification
        # In a real system, this could be a zero-shot classifier or BERT model
        self.intent_keywords = {
            "fees": ["fee", "cost", "tuition", "payment", "price"],
            "admissions": ["admission", "apply", "application", "deadline", "enroll"],
            "courses": ["course", "syllabus", "curriculum", "subject", "program", "degree"],
            "eligibility": ["eligible", "criteria", "requirement", "mark", "grade", "score"],
            "exam": ["exam", "test", "schedule", "date", "midterm", "final"],
            "faculty": ["faculty", "professor", "teacher", "staff", "dean"],
            "hostel": ["hostel", "accommodation", "dorm", "room", "mess"],
            "placement": ["placement", "job", "career", "salary", "package", "recruiter"],
            "rules": ["rule", "policy", "regulation", "code of conduct", "ragging"],
            "greeting": ["hi", "hello", "hey", "good morning", "good evening"]
        }
        
    def detect_intent(self, query: str) -> str:
        query_lower = query.lower()
        
        # Check specific keywords
        for intent, keywords in self.intent_keywords.items():
            if any(k in query_lower for k in keywords):
                return intent
                
        # Fallback
        return "general_query"

    def is_safe(self, query: str) -> bool:
        """
        Basic safety check for out-of-scope topics.
        """
        unsafe_keywords = ["politics", "religion", "gambling", "dating", "movies"]
        if any(k in query.lower() for k in unsafe_keywords):
            return False
        return True
