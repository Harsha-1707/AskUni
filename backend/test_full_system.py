import requests
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    print("\n" + "="*70)
    print("TEST 1: HEALTH CHECK")
    print("="*70)
    try:
        response = requests.get("http://localhost:8000/health")
        assert response.status_code == 200
        print("✅ Backend is healthy")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_registration():
    print("\n" + "="*70)
    print("TEST 2: USER REGISTRATION")
    print("="*70)
    try:
        email = f"test_{int(time.time())}@anurag.edu.in"
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={"email": email, "password": "test123456", "role": "student"}
        )
        if response.status_code == 200:
            print(f"✅ Registration successful: {email}")
            return email, "test123456"
        else:
            print(f"⚠️  Registration returned: {response.status_code}")
            return None, None
    except Exception as e:
        print(f"❌ Registration failed: {e}")
        return None, None

def test_login(email, password):
    print("\n" + "="*70)
    print("TEST 3: USER LOGIN")
    print("="*70)
    try:
        formData = f"username={email}&password={password}"
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data=formData,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"✅ Login successful")
            print(f"   Token: {token[:50]}...")
            return token
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_chat(token, query):
    print("\n" + "="*70)
    print(f"TEST 4: CHAT - '{query}'")
    print("="*70)
    try:
        headers = {"Authorization": f"Bearer {token}"}
        start = time.time()
        response = requests.post(
            f"{BASE_URL}/chat/",
            headers=headers,
            json={"query": query, "history": []}
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Chat response received")
            print(f"\n📝 ANSWER:")
            print(f"   {data['answer'][:200]}...")
            print(f"\n📊 METRICS:")
            print(f"   Confidence: {data.get('confidence_score', 0):.2f}")
            print(f"   Processing Time: {data.get('processing_time', 0):.2f}s")
            print(f"   Sources: {len(data.get('sources', []))}")
            
            if data.get('sources'):
                print(f"\n📚 SOURCES:")
                for i, src in enumerate(data['sources'][:3], 1):
                    print(f"   {i}. {src.get('source', 'Unknown')} (Score: {src.get('score', 0):.3f})")
            
            print(f"\n⏱️  Total Request Time: {elapsed:.2f}s")
            return True
        else:
            print(f"❌ Chat failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Chat error: {e}")
        return False

def test_knowledge_base(token):
    print("\n" + "="*70)
    print("TEST 5: KNOWLEDGE BASE VALIDATION")
    print("="*70)
    
    test_queries = [
        "What is the fee for B.Tech in Computer Science?",
        "Tell me about hostel facilities",
        "What was the highest placement package?",
        "What are the MBA specializations?",
    ]
    
    passed = 0
    for i, query in enumerate(test_queries, 1):
        print(f"\n🔍 Query {i}/4: {query}")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(
                f"{BASE_URL}/chat/",
                headers=headers,
                json={"query": query, "history": []}
            )
            if response.status_code == 200:
                data = response.json()
                has_sources = len(data.get('sources', [])) > 0
                not_empty = "couldn't find" not in data['answer'].lower()
                
                if has_sources and not_empty:
                    print(f"   ✅ Got relevant answer with {len(data['sources'])} sources")
                    passed += 1
                elif has_sources:
                    print(f"   ⚠️  Has sources but answer seems empty")
                    passed += 0.5
                else:
                    print(f"   ❌ No sources found - knowledge gap")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        time.sleep(0.5)  # Rate limiting
    
    print(f"\n📊 Knowledge Base Score: {passed}/{len(test_queries)}")
    return passed >= len(test_queries) * 0.75

def run_all_tests():
    print("\n" + "="*70)
    print("🚀 ASKUNI SYSTEM TEST SUITE")
    print("="*70)
    print("Testing: Backend API + RAG + Knowledge Base")
    print("="*70)
    
    results = []
    
    # Test 1: Health
    results.append(("Health Check", test_health()))
    
    # Test 2-3: Auth
    email, password = test_registration()
    if email:
        results.append(("Registration", True))
        token = test_login(email, password)
        if token:
            results.append(("Login", True))
            
            # Test 4: Basic Chat
            results.append(("Basic Chat", test_chat(token, "What is Anurag University?")))
            
            # Test 5: Knowledge Base
            results.append(("Knowledge Base", test_knowledge_base(token)))
        else:
            results.append(("Login", False))
    else:
        results.append(("Registration", False))
    
    # Summary
    print("\n" + "="*70)
    print("📊 TEST SUMMARY")
    print("="*70)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n🎯 Overall Score: {passed}/{total} ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! System is fully operational.")
    elif passed / total >= 0.8:
        print("\n✅ Most tests passed. System is operational with minor issues.")
    else:
        print("\n⚠️  Multiple failures detected. Review system logs.")
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
