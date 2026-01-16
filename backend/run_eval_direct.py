import sys
sys.path.insert(0, '.')

from app.evaluation.runner import runner

print("="*70)
print("Running Evaluation Framework Test")
print("="*70)

result = runner.run_evaluation()

if result:
    print("\n" + "="*70)
    print("EVALUATION RESULTS")
    print("="*70)
    print(f"Run ID: {result.run_id}")
    print(f"Total Samples: {result.total_samples}")
    print(f"\nRETRIEVAL METRICS:")
    print(f"  Precision@5:  {result.precision_at_k:.3f}")
    print(f"  Recall@5:     {result.recall_at_k:.3f}")
    print(f"  MRR:          {result.mrr:.3f}")
    print(f"\nGENERATION METRICS:")
    print(f"  Faithfulness: {result.faithfulness_score:.3f}")
    print(f"\nPERFORMANCE:")
    print(f"  Avg Latency:  {result.avg_latency_ms:.1f}ms")
    print("="*70)
