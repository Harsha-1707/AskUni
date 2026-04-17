# 🎓 AskUni: Ultimate Viva Preparation Guide

This document is designed to help you ace your final Viva. It contains all the technical details, architectural decisions, and sample questions you need to know.

---

## 🚀 1. Project Overview
**Project Name**: AskUni (AI-Powered University Assistant)  
**Objective**: To provide an intelligent, accurate, and conversational interface for university-related information using advanced RAG techniques.

### The Problem
*   University websites are often cluttered and hard to navigate.
*   Students/Parents spend hours searching through long PDFs (Fee structures, Admission policies).
*   Standard chatbots often "hallucinate" (provide wrong information).

### The Solution: AskUni
*   **RAG (Retrieval-Augmented Generation)**: Uses actual university documents to ground AI responses.
*   **Source Attribution**: Always shows the exact document/paragraph where info was found.
*   **Analytics**: A full admin dashboard to monitor system accuracy.

---

## 🏗️ 2. System Architecture
AskUni follows a **three-tier architecture**:

1.  **Frontend (Presentation Layer)**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui.
2.  **Backend (Logic Layer)**: FastAPI (Python) + SQLAlchemy ORM.
3.  **Database/Storage (Data Layer)**: 
    *   **PostgreSQL**: Stores users, chat logs, and feedback.
    *   **FAISS (Vector Store)**: Stores high-dimensional embeddings of university documents for semantic search.

### The RAG Pipeline (How it works step-by-step)
1.  **User Query**: User asks "What is the fee for CSE?".
2.  **Embedding**: The query is converted into a vector (numbers) using `sentence-transformers`.
3.  **Retrieval**: FAISS searches for the top-K most similar text chunks from the university documents.
4.  **Augmentation**: The query + the retrieved text chunks are combined into a single prompt.
5.  **Generation**: **Mistral AI (LLM)** reads the context and generates a human-like response.
6.  **Response**: The system returns the answer, source links, and a confidence score.

---

## 💻 3. Tech Stack Details

| Component | Technology Used | Reason for Choice |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, TypeScript | Server-side rendering, type safety, and modern SEO. |
| **Backend** | FastAPI | Extremely fast, asynchronous support, auto-generated API docs. |
| **LLM Engine** | Mistral AI | Open-weights model, excellent reasoning at a lower cost. |
| **Vector DB** | FAISS | High-performance similarity search designed for large datasets. |
| **Authentication** | JWT (JSON Web Tokens) | Secure, stateless, and industry-standard. |
| **State Management**| Zustand | Lightweight and easier to manage than Redux. |

---

## 📊 4. Evaluation Framework (The "Science" Part)
*One of the strongest parts of your project. Be ready to explain these.*

1.  **Precision@K**: If we retrieve 5 documents, how many are actually relevant?
2.  **Recall@K**: Did we find ALL the relevant information available in the documents?
3.  **MRR (Mean Reciprocal Rank)**: Is the "perfect" answer usually the #1 result?
4.  **Faithfulness Score**: We use "LLM-as-Judge" where Mistral AI cross-checks the final answer against the source text to ensure 0% hallucination.

---

## 🔐 5. Security & Features
*   **Password Hashing**: Bcrypt encryption.
*   **JWT Auth**: Secure sessions with expiration.
*   **Role-Based Access (RBAC)**: Only "Admin" users can see the metrics dashboard.
*   **Real-time Analytics**: Dashboard shows query volume, accuracy trends, and failed queries.

---

## ❓ 6. Pro Viva Questions & Answers

**Q: Why use FAISS over a traditional SQL search?**  
**A:** Traditional SQL uses keywords. If a user asks "Price of course" but the document says "Tuition fee," SQL fails. FAISS uses "Semantic Search" (meaning-based), so it understands they are the same thing.

**Q: What is "Chunking" and why is it important?**  
**A:** LLMs have a "Context Window" (limit on how much text they can read). We split 100-page PDFs into small 500-character "chunks" with overlap so the AI only receives the most relevant sections.

**Q: How do you handle "Hallucinations"?**  
**A:** We use a strict "System Prompt" that tells the AI: *"Only use the provided context. If the answer is not in the context, say you don't know."* We also track this using our Faithfulness Score.

**Q: What happens if two documents give conflicting info?**  
**A:** We use **Re-ranking**. We fetch multiple chunks and use a secondary scoring algorithm to prioritize the most recent or relevant source.

---

## 🚀 7. Future Work
*   **Multi-modal support**: Allow users to upload their own PDFs/Syllabus for personalized help.
*   **Voice Interface**: Integration with Web Speech API for hands-free queries.
*   **Offline Mode**: Deploying smaller local models (like Llama-3 or Mistral-7B) to run without internet.

---
**Prepared for Final Major Project Viva - 2026**
