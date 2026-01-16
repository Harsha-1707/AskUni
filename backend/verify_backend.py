import requests
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_flow():
    email = "teststudent@example.com"
    password = "securepassword123"
    
    # 1. Register
    print(f"Registering user {email}...")
    reg_resp = requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": email, "password": password, "role": "student"}
    )
    
    if reg_resp.status_code == 200:
        print("Registration successful.")
    elif reg_resp.status_code == 400 and "already exists" in reg_resp.text:
        print("User already exists, proceeding...")
    else:
        print(f"Registration failed: {reg_resp.text}")
        sys.exit(1)

    # 2. Login
    print("Logging in...")
    login_resp = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": email, "password": password}
    )
    
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.text}")
        sys.exit(1)
        
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful. Token acquired.")

    # 3. Chat
    print("Testing Chat endpoint...")
    chat_resp = requests.post(
        f"{BASE_URL}/chat/",
        headers=headers,
        json={"query": "What are the fees?"}
    )
    
    if chat_resp.status_code == 200:
        ans = chat_resp.json()
        print(f"Chat Response: {ans['answer']}")
        print(f"Conversation ID: {ans['conversation_id']}")
    else:
        print(f"Chat failed: {chat_resp.text}")

    # 4. Check Health
    print("Testing Health check...")
    health = requests.get("http://localhost:8000/health")
    if health.status_code == 200:
        print("Health check passed.")
        
    print("\n[SUCCESS] Backend verification complete.")

if __name__ == "__main__":
    try:
        test_flow()
    except requests.exceptions.ConnectionError:
        print("\n[ERROR] Could not connect to backend. Is it running?")
        print("Run: uvicorn app.main:app --reload")
