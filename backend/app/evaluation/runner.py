import json
import uuid
import time
import os
from typing import List
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.all_models import EvaluationMetrics
from app.services.chat_orchestrator import orchestrator
from app.evaluation.metrics import calculate_precision_at_k, calculate_recall_at_k, calculate_mrr
from app.evaluation.judge import judge

class EvaluationRunner:
    def run_evaluation(self, dataset_path: str = "evaluation_data/sample.json"):
        if not os.path.exists(dataset_path):
            print(f"Dataset not found at {dataset_path}")
            return None

        with open(dataset_path, "r") as f:
            data = json.load(f)

        run_id = str(uuid.uuid4())[:8]
        total_precision = 0.0
        total_recall = 0.0
        total_mrr = 0.0
        total_faithfulness = 0.0
        total_latency = 0.0
        
        print(f"Starting Evaluation Run: {run_id} on {len(data)} samples.")
        
        for item in data:
            q = item["question"]
            gold_docs = item["relevant_docs"]
            
            # Run System
            start = time.time()
            result = orchestrator.process_query(q)
            latency = (time.time() - start) * 1000
            
            # Extract retrieved doc IDs (assuming 'source' metadata matches 'relevant_docs' filenames)
            retrieved_ids = [s["source"] for s in result["sources"]]
            
            # Metrics
            p_k = calculate_precision_at_k(retrieved_ids, gold_docs, k=5)
            r_k = calculate_recall_at_k(retrieved_ids, gold_docs, k=5)
            mrr = calculate_mrr(retrieved_ids, gold_docs)
            
            # Judge
            context_text = "\n".join([s["content"] for s in result["sources"]])
            faithfulness = judge.evaluate_faithfulness(q, result["answer"], context_text)
            
            total_precision += p_k
            total_recall += r_k
            total_mrr += mrr
            total_faithfulness += faithfulness
            total_latency += latency
            
        # Aggregate
        n = len(data)
        metrics = EvaluationMetrics(
            run_id=run_id,
            precision_at_k=total_precision / n,
            recall_at_k=total_recall / n,
            mrr=total_mrr / n,
            faithfulness_score=total_faithfulness / n,
            hallucination_detected=0.0, # Placeholder
            avg_latency_ms=total_latency / n,
            total_samples=n
        )
        
        # Save
        db = SessionLocal()
        db.add(metrics)
        db.commit()
        db.refresh(metrics)
        
        print(f"Run Complete. Precision: {metrics.precision_at_k:.2f}, Recall: {metrics.recall_at_k:.2f}")
        db.close()
        return metrics

runner = EvaluationRunner()
