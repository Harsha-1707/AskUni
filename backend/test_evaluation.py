import requests
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

# 1. Register admin user
print("Creating admin user...")
admin_data = {
    "email": "admin@askuni.com",
    "password": "admin123secure",
    "role": "admin"
}
reg_resp = requests.post(f"{BASE_URL}/auth/register", json=admin_data)
if reg_resp.status_code == 200:
    print("[OK] Admin user created")
elif "already exists" in reg_resp.text:
    print("[OK] Admin user already exists")

# 2. Login as admin
print("\nLogging in as admin...")
login_resp = requests.post(
    f"{BASE_URL}/auth/login",
    data={"username": "admin@askuni.com", "password": "admin123secure"}
)
if login_resp.status_code != 200:
    print(f"[ERROR] Login failed: {login_resp.text}")
    exit(1)

token = login_resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("[OK] Logged in successfully")

# 3. Trigger evaluation
print("\nTriggering evaluation run...")
eval_resp = requests.post(f"{BASE_URL}/admin/evaluate", headers=headers)
print(f"Status: {eval_resp.json()}")

# 4. Wait for completion
print("\nWaiting 12 seconds for evaluation to complete...")
time.sleep(12)

# 5. Fetch results
print("\nFetching evaluation results...")
history_resp = requests.get(f"{BASE_URL}/admin/evaluation-history", headers=headers)

results = history_resp.json()
if results and len(results) > 0:
    latest = results[0]
    print("\n" + "="*70)
    print("EVALUATION RESULTS")
    print("="*70)
    print(f"Run ID: {latest['run_id']}")
    print(f"Total Samples: {latest['total_samples']}")
    print(f"\nRETRIEVAL METRICS:")
    print(f"  Precision@5:  {latest['precision_at_k']:.3f}")
    print(f"  Recall@5:     {latest['recall_at_k']:.3f}")
    print(f"  MRR:          {latest['mrr']:.3f}")
    print(f"\nGENERATION METRICS:")
    print(f"  Faithfulness: {latest['faithfulness_score']:.3f}")
    print(f"  Hallucination: {latest.get('hallucination_detected', 0):.1f}%")
    print(f"\nPERFORMANCE:")
    print(f"  Avg Latency:  {latest['avg_latency_ms']:.1f}ms")
    print(f"  Timestamp:    {latest['created_at']}")
    print("="*70)
    print("\n[SUCCESS] Evaluation test completed!")
else:
    print("[WARNING] No evaluation results found.")
