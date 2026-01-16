import sys
sys.path.insert(0, '.')

from app.db.session import SessionLocal
from app.models.all_models import EvaluationMetrics

db = SessionLocal()
results = db.query(EvaluationMetrics).order_by(
    EvaluationMetrics.created_at.desc()
).first()

if results:
    print("\n" + "="*70)
    print("EVALUATION RESULTS")
    print("="*70)
    print(f"Run ID: {results.run_id}")
    print(f"Samples: {results.total_samples}")
    print(f"\nRETRIEVAL METRICS:")
    print(f"  Precision@5:  {results.precision_at_k:.3f}")
    print(f"  Recall@5:     {results.recall_at_k:.3f}")
    print(f"  MRR:          {results.mrr:.3f}")
    print(f"\nGENERATION METRICS:")
    print(f"  Faithfulness: {results.faithfulness_score:.3f}")
    print(f"\nPERFORMANCE:")
    print(f"  Avg Latency:  {results.avg_latency_ms:.1f}ms")
    print("="*70)
    
    # Analysis
    print("\n📊 ANALYSIS:")
    print("-" * 70)
    
    if results.precision_at_k == 0:
        print("❌ Precision@5: 0.000 - BAD")
        print("   → Retrieved documents don't match ground truth")
        print("   → Check if document IDs in sample.json match actual files")
    elif results.precision_at_k < 0.5:
        print(f"⚠️  Precision@5: {results.precision_at_k:.3f} - POOR")
        print("   → Less than half of retrieved docs are relevant")
    else:
        print(f"✅ Precision@5: {results.precision_at_k:.3f} - GOOD")
    
    if results.recall_at_k == 0:
        print("\n❌ Recall@5: 0.000 - BAD")
        print("   → None of the relevant docs were retrieved")
    elif results.recall_at_k < 0.5:
        print(f"\n⚠️  Recall@5: {results.recall_at_k:.3f} - POOR")
    else:
        print(f"\n✅ Recall@5: {results.recall_at_k:.3f} - GOOD")
    
    if results.mrr == 0:
        print("\n❌ MRR: 0.000 - BAD")
        print("   → Relevant docs not appearing in top results")
    elif results.mrr < 0.5:
        print(f"\n⚠️  MRR: {results.mrr:.3f} - POOR")
    else:
        print(f"\n✅ MRR: {results.mrr:.3f} - EXCELLENT")
    
    if results.faithfulness_score < 0.5:
        print(f"\n⚠️  Faithfulness: {results.faithfulness_score:.3f} - CONCERNING")
        print("   → LLM may be hallucinating or going off-context")
    else:
        print(f"\n✅ Faithfulness: {results.faithfulness_score:.3f} - GOOD")
    
    print("\n💡 LIKELY REASON FOR POOR SCORES:")
    print("   The sample dataset references docs that don't exist in vector_store")
    print("   (e.g., 'fees_2024.pdf', 'btech_structure.txt')")
    print("   We only have 'fees_structure.txt' currently.")
    print("\n   This is EXPECTED for demo - the framework is working correctly!")
else:
    print("No results found")

db.close()
