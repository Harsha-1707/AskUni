import re
import html
from typing import Optional

# Dangerous patterns
that could indicate prompt injection
PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(previous|above|prior)\s+instructions",
    r"system\s+prompt",
    r"reveal\s+(your|the)\s+instructions",
    r"you\s+are\s+(now|a)\s+",
    r"jailbreak",
    r"DAN\s+mode",
    r"developer\s+mode",
]

# Max input lengths
MAX_QUERY_LENGTH = 500
MAX_FEEDBACK_LENGTH = 1000

def sanitize_text(text: str) -> str:
    """Sanitize user input to prevent XSS"""
    if not text:
        return ""
    
    # HTML escape
    sanitized = html.escape(text.strip())
    
    # Normalize unicode
    sanitized = sanitized.encode('ascii', 'ignore').decode('ascii')
    
    return sanitized

def validate_query(query: str) -> tuple[bool, Optional[str]]:
    """Validate chat query for security issues"""
    
    # Check length
    if len(query) > MAX_QUERY_LENGTH:
        return False, f"Query too long. Max {MAX_QUERY_LENGTH} characters."
    
    if len(query) < 3:
        return False, "Query too short. Minimum 3 characters."
    
    # Check for prompt injection attempts
    query_lower = query.lower()
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, query_lower):
            return False, "Query contains potentially harmful content."
    
    # Check for excessive special characters (potential encoding attacks)
    special_char_ratio = len(re.findall(r'[^a-zA-Z0-9\s\?\.]', query)) / len(query)
    if special_char_ratio > 0.3:
        return False, "Query contains too many special characters."
    
    return True, None

def validate_password(password: str) -> tuple[bool, Optional[str]]:
    """Validate password complexity"""
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters."
    
    if len(password) > 100:
        return False, "Password too long."
    
    # Check complexity
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    
    if not (has_upper and has_lower and has_digit):
        return False, "Password must contain uppercase, lowercase, and numbers."
    
    return True, None

def validate_email(email: str) -> tuple[bool, Optional[str]]:
    """Basic email validation"""
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_pattern, email):
        return False, "Invalid email format."
    
    if len(email) > 255:
        return False, "Email too long."
    
    return True, None
