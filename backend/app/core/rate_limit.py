from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Rate limit configurations
CHAT_RATE_LIMIT = "10/minute"
AUTH_LOGIN_LIMIT = "5/minute"
AUTH_REGISTER_LIMIT = "3/minute"
GLOBAL_RATE_LIMIT = "100/minute"
