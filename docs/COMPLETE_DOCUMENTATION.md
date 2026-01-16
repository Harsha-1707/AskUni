# AskUni - AI-Powered University Assistant

**Full Documentation**

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Setup & Installation](#setup--installation)
4. [API Documentation](#api-documentation)
5. [Admin Dashboard Usage](#admin-dashboard-usage)
6. [Evaluation Methodology](#evaluation-methodology)
7. [Security & Best Practices](#security--best-practices)
8. [Limitations & Future Work](#limitations--future-work)
9. [Contributing](#contributing)

---

## Executive Summary

**AskUni** is a production-grade, AI-powered question-answering system designed for university environments. Built using Retrieval-Augmented Generation (RAG) architecture, it provides accurate, context-aware responses to queries about university policies, admissions, fees, academics, and campus life.

### Key Features

- 🤖 **RAG-based QA** with FAISS vector retrieval + Mistral AI
- 🔐 **Secure Authentication** with JWT and role-based access control
- 📊 **ML Evaluation Framework** (Precision, Recall, MRR, Faithfulness)
- 📈 **Observability** with structured logging and analytics
- 🎨 **Modern UI** with Next.js, Tailwind CSS, and shadcn/ui
- 🐳 **Containerized** with Docker for easy deployment

### Tech Stack

- **Backend**: FastAPI, SQLAlchemy, FAISS, Mistral AI
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand
- **Database**: PostgreSQL (production) / SQLite (development)
- **Deployment**: Docker Compose

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AskUni System                        │
└─────────────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
    │         │        │         │        │         │
    │Frontend │        │ Backend │        │Database │
    │(Next.js)│◄──────►│(FastAPI)│◄──────►│(Postgres│
    │         │  REST  │         │  ORM   │/SQLite) │
    └─────────┘        └────┬────┘        └─────────┘
                            │
                  ┌─────────┼─────────┐
                  │         │         │
             ┌────▼───┐ ┌──▼────┐ ┌──▼──────┐
             │ FAISS  │ │Mistral│ │Analytics│
             │Vector  │ │  AI   │ │ Engine  │
             │Store   │ │ LLM   │ │         │
             └────────┘ └───────┘ └─────────┘
```

### RAG Pipeline

```
User Query
    │
    ▼
[1] Input Validation & Sanitization
    │
    ▼
[2] Embedding Generation (sentence-transformers)
    │
    ▼
[3] Vector Similarity Search (FAISS)
    │
    ▼
[4] Context Assembly & Ranking
    │
    ▼
[5] Prompt Construction + LLM Call (Mistral AI)
    │
    ▼
[6] Response Post-processing & Source Attribution
    │
    ▼
[7] Confidence Scoring & Analytics Logging
    │
    ▼
Final Response (Answer + Sources + Confidence)
```

### Component Breakdown

#### 1. Frontend (Next.js)

- **Pages**: Landing, Login, Register, Chat, Admin Dashboard
- **State Management**: Zustand (auth, chat)
- **API Client**: Axios with JWT interceptors
- **UI Components**: shadcn/ui (Button, Input, Card, Accordion, Badge)
- **Styling**: Tailwind CSS with custom design system

#### 2. Backend (FastAPI)

- **API Layer**: RESTful endpoints with OpenAPI docs
- **Authentication**: JWT tokens with bcrypt password hashing
- **RAG Engine**: FAISS retrieval + Mistral AI generation
- **Evaluation**: ML metrics (Precision@K, Recall@K, MRR, Faithfulness)
- **Observability**: Structured logging, analytics tracking, error monitoring

#### 3. Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat Logs table
CREATE TABLE chat_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    processing_time_ms FLOAT,
    confidence_score FLOAT,
    sources_count INTEGER,
    has_error BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY,
    chat_id UUID REFERENCES chat_logs(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Evaluation Metrics table
CREATE TABLE evaluation_metrics (
    id UUID PRIMARY KEY,
    run_id VARCHAR(255) UNIQUE,
    precision_at_k FLOAT,
    recall_at_k FLOAT,
    mrr FLOAT,
    faithfulness_score FLOAT,
    hallucination_detected FLOAT,
    avg_latency_ms FLOAT,
    total_samples INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Source Usage Stats table
CREATE TABLE source_usage_stats (
    id UUID PRIMARY KEY,
    source_name VARCHAR(255) UNIQUE,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    avg_relevance_score FLOAT
);

-- Query Analytics table
CREATE TABLE query_analytics (
    id UUID PRIMARY KEY,
    date DATE UNIQUE,
    total_queries INTEGER,
    successful_queries INTEGER,
    failed_queries INTEGER,
    avg_confidence FLOAT,
    avg_latency_ms FLOAT
);
```

---

## Setup & Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (production) or SQLite (development)
- Docker & Docker Compose (optional)
- Mistral API Key ([get here](https://mistral.ai))

### Option 1: Local Development Setup

#### Backend Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/AskUni.git
   cd AskUni
   ```

2. **Create virtual environment**:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment** (create `.env`):

   ```env
   SECRET_KEY=your-secret-key-here  # Generate: python -c "import secrets; print(secrets.token_urlsafe(32))"
   DATABASE_URL=sqlite:///./sql_app.db  # Or PostgreSQL URL
   MISTRAL_API_KEY=your-mistral-api-key
   VECTOR_STORE_PATH=../vector_store
   LLM_PROVIDER=mistral
   BACKEND_CORS_ORIGINS=http://localhost:3000
   ```

5. **Ingest university data**:

   ```bash
   cd ..
   python main.py --ingest
   ```

6. **Run backend**:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
   Backend available at: **http://localhost:8000**

#### Frontend Setup

1. **Install dependencies**:

   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment** (create `.env.local`):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

3. **Run frontend**:
   ```bash
   npm run dev
   ```
   Frontend available at: **http://localhost:3000**

### Option 2: Docker Deployment

1. **Configure environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your secrets
   ```

2. **Start services**:

   ```bash
   docker-compose up -d
   ```

3. **Initialize database**:

   ```bash
   docker-compose exec backend python -c "from app.db.session import engine; from app.models.all_models import Base; Base.metadata.create_all(engine)"
   ```

4. **Ingest data**:
   ```bash
   docker-compose exec backend python /app/main.py --ingest
   ```

Services:

- Frontend: **http://localhost:3000**
- Backend: **http://localhost:8000**
- API Docs: **http://localhost:8000/docs**

---

## API Documentation

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 1. Authentication

**POST `/auth/register`**
Register a new user.

**Request Body**:

```json
{
  "email": "student@university.edu",
  "password": "SecurePass123",
  "role": "student" // Optional: "student" or "admin"
}
```

**Response** (200 OK):

```json
{
  "id": "uuid-here",
  "email": "student@university.edu",
  "role": "student"
}
```

---

**POST `/auth/login`**
Login and receive JWT token.

**Request Body** (form-encoded):

```
username=student@university.edu
password=SecurePass123
```

**Response** (200 OK):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
  "token_type": "bearer"
}
```

---

#### 2. Chat

**POST `/chat/`** 🔒
Send a query and receive an AI-generated answer.

**Headers**:

```
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "query": "What is the fee for B.Tech in Computer Science?",
  "history": [] // Optional conversation history
}
```

**Response** (200 OK):

```json
{
  "answer": "The fee for B.Tech in Computer Science at Anurag University is ₹2,50,000 per annum...",
  "sources": [
    {
      "source": "fee_structure.txt",
      "content": "B.Tech Fee Structure...",
      "score": 0.894
    }
  ],
  "confidence_score": 0.87,
  "processing_time": 1234.5
}
```

---

#### 3. Feedback

**POST `/feedback/submit`** 🔒
Submit feedback for a chat response.

**Request Body**:

```json
{
  "chat_id": "uuid-of-chat-log",
  "rating": 5, // 1-5
  "comment": "Very helpful answer!"
}
```

**Response** (200 OK):

```json
{
  "id": "feedback-uuid",
  "message": "Feedback submitted successfully"
}
```

---

#### 4. Admin Endpoints

**GET `/admin/metrics`** 🔒👑
Get system health metrics.

**Response**:

```json
{
  "total_users": 42,
  "total_queries": 1523,
  "active_sources": 5,
  "avg_response_time_ms": 1245.3
}
```

---

**POST `/admin/ingest`** 🔒👑
Trigger data ingestion from `data/raw/`.

**Response**:

```json
{
  "status": "success",
  "message": "Ingestion triggered",
  "documents_processed": 5
}
```

---

**POST `/admin/evaluate`** 🔒👑
Run ML evaluation on test dataset.

**Request Body**:

```json
{
  "dataset_path": "evaluation_data/sample.json"
}
```

**Response**:

```json
{
  "run_id": "eval_1234567890",
  "message": "Evaluation started"
}
```

---

**GET `/admin/evaluation-history`** 🔒👑
Fetch past evaluation results.

**Response**:

```json
[
  {
    "run_id": "eval_1234567890",
    "precision_at_k": 0.85,
    "recall_at_k": 0.78,
    "mrr": 0.92,
    "faithfulness_score": 0.88,
    "created_at": "2024-01-16T10:30:00Z"
  }
]
```

---

**GET `/admin/analytics/overview`** 🔒👑
Get analytics dashboard data.

**Response**:

```json
{
  "today": {
    "total_queries": 45,
    "successful_queries": 42,
    "failed_queries": 3,
    "avg_confidence": 0.85,
    "avg_latency_ms": 1234.5
  },
  "all_time": {
    "total_queries": 1523,
    "total_errors": 47,
    "error_rate": 3.09
  }
}
```

---

**GET `/admin/analytics/sources`** 🔒👑
Get source usage statistics.

**Response**:

```json
{
  "top_sources": [
    {
      "name": "fee_structure.txt",
      "usage_count": 156,
      "avg_relevance": 0.894,
      "last_used": "2024-01-16T18:45:00Z"
    }
  ]
}
```

---

### Error Responses

All endpoints may return standard HTTP error codes:

**400 Bad Request**:

```json
{
  "detail": "Invalid input: query too short"
}
```

**401 Unauthorized**:

```json
{
  "detail": "Could not validate credentials"
}
```

**403 Forbidden**:

```json
{
  "detail": "Admin access required"
}
```

**500 Internal Server Error**:

```json
{
  "detail": "An unexpected error occurred"
}
```

---

## Admin Dashboard Usage

### Accessing the Dashboard

1. **Login** with admin credentials:

   - Email: `admin@askuni.com`
   - Password: `admin123secure`

2. **Navigate** to `/admin` or click "Admin Dashboard" in chat header

### Dashboard Features

#### 1. Metrics Overview

**Location**: `/admin`

View real-time system health:

- **Total Queries**: Number of queries processed
- **Average Accuracy**: Overall confidence score
- **Hallucination Rate**: Percentage of unreliable answers
- **Active Users**: Number of registered users

**Charts**:

- Accuracy Over Time (line chart)
- Hallucination Rate (bar chart)
- Query Volume - Last 7 Days (area chart)

#### 2. Document Management

**Location**: `/admin/documents`

**Features**:

- Upload new source documents (.txt, .pdf, .docx)
- View all indexed documents
- Delete outdated documents
- Trigger re-ingestion

**Usage**:

1. Click "Upload Document"
2. Select file (max 10MB)
3. Click "Upload"
4. Trigger "Re-Ingestion" to update vector store

#### 3. Feedback Viewer

**Location**: `/admin/feedback`

**Features**:

- View all user feedback
- Filter by rating (1-5 stars)
- Read user comments
- Export feedback data

**Metrics Displayed**:

- Positive Feedback (4-5 ⭐)
- Neutral Feedback (3 ⭐)
- Negative Feedback (1-2 ⭐)

#### 4. Failed Queries

**Location**: `/admin/failed-queries`

**Purpose**: Identify queries with low confidence scores to improve knowledge base.

**Features**:

- List of queries with confidence < 0.5
- Timestamps and confidence scores
- Recommendations for missing content

**Usage**:

1. Review failed queries
2. Identify missing topics
3. Add relevant documents
4. Re-ingest data

#### 5. Quick Actions

**Re-Ingestion**:

- Click "Trigger Re-Ingestion" on main dashboard
- Processes all files in `data/raw/`
- Updates FAISS vector store
- Typically takes 1-2 minutes

---

## Evaluation Methodology

### Overview

AskUni uses a comprehensive ML evaluation framework to measure RAG system performance.

### Metrics

#### 1. Precision@K

**Formula**:

```
Precision@K = (Number of relevant documents in top-K results) / K
```

**Purpose**: Measures accuracy of retrieval

**Interpretation**:

- 1.0: Perfect (all K results are relevant)
- 0.5: Half of top-K results are relevant
- 0.0: No relevant documents in top-K

#### 2. Recall@K

**Formula**:

```
Recall@K = (Number of relevant documents in top-K) / (Total relevant documents)
```

**Purpose**: Measures coverage of retrieval

**Interpretation**:

- 1.0: All relevant docs retrieved
- 0.5: Half of relevant docs retrieved
- 0.0: No relevant docs retrieved

#### 3. Mean Reciprocal Rank (MRR)

**Formula**:

```
MRR = (1/N) * Σ(1 / rank of first relevant document)
```

**Purpose**: Measures ranking quality

**Interpretation**:

- 1.0: First result is always relevant
- 0.5: First relevant result is typically at rank 2
- Lower: Relevant results appear late

#### 4. Faithfulness Score (LLM-as-Judge)

**Method**: Mistral AI evaluates if the answer is grounded in retrieved context

**Scoring**: 0.0 (completely unfaithful) to 1.0 (perfectly faithful)

**Prompt**:

```
You are evaluating an AI assistant's answer.

Context: {retrieved_context}
Question: {user_question}
Answer: {ai_answer}

Rate faithfulness (0.0-1.0):
- 1.0: Answer is fully supported by context
- 0.5: Answer is partially supported
- 0.0: Answer contradicts or ignores context
```

### Running Evaluations

#### 1. Prepare Test Dataset

Create `backend/evaluation_data/test_set.json`:

```json
[
  {
    "query": "What is the CSE fee?",
    "expected_answer": "₹2,50,000 per annum",
    "relevant_docs": ["fee_structure.txt"]
  },
  {
    "query": "Tell me about hostel facilities",
    "expected_answer": "3 types of rooms available...",
    "relevant_docs": ["hostel_accommodation.txt"]
  }
]
```

#### 2. Run Evaluation

```bash
# Via API
curl -X POST http://localhost:8000/api/v1/admin/evaluate \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"dataset_path": "evaluation_data/test_set.json"}'

# Via Python script
cd backend
python run_eval_direct.py
```

#### 3. View Results

```bash
# Via API
curl http://localhost:8000/api/v1/admin/evaluation-history \
  -H "Authorization: Bearer <admin-token>"

# In database
sqlite3 sql_app.db "SELECT * FROM evaluation_metrics ORDER BY created_at DESC LIMIT 5;"
```

### Sample Results

```
Run ID: eval_1768559481
=========================
Precision@5:     0.85
Recall@5:        0.78
MRR:             0.92
Faithfulness:    0.88
Avg Latency:     1245.3 ms
Total Samples:   50
```

### Improving Scores

**Low Precision**: Add more specific, focused documents

**Low Recall**: Expand knowledge base coverage

**Low MRR**: Improve document chunking strategy

**Low Faithfulness**: Tune LLM prompt to cite sources better

---

## Security & Best Practices

### Authentication

- **Password Hashing**: bcrypt with cost factor 12
- **JWT Tokens**: HS256 algorithm, 30-minute expiration
- **Role-Based Access**: Student vs Admin permissions

### Input Validation

**Implemented**:

- HTML escaping for all user inputs
- Query length limits (500 characters)
- Prompt injection detection (blacklist patterns)
- Email format validation
- Password complexity requirements

**Blocked Patterns**:

- "ignore previous instructions"
- "system prompt"
- "reveal your instructions"
- "jailbreak", "DAN mode"

### Rate Limiting

**Configured Limits** (via `slowapi`):

- Chat: 10 requests/minute per user
- Login: 5 requests/minute per IP
- Register: 3 requests/minute per IP
- Global: 100 requests/minute per IP

### Production Checklist

**Security**:

- [ ] Set strong `SECRET_KEY` (32+ characters)
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS/TLS
- [ ] Rotate secrets every 90 days
- [ ] Enable CORS only for trusted origins
- [ ] Add Web Application Firewall (WAF)

**Performance**:

- [ ] Enable database connection pooling
- [ ] Add Redis caching layer
- [ ] Use CDN for frontend assets
- [ ] Configure Gunicorn workers (4 × CPU cores)

**Monitoring**:

- [ ] Setup log aggregation (ELK, Splunk)
- [ ] Enable APM (DataDog, New Relic)
- [ ] Configure alerts (error spikes, latency)
- [ ] Implement health check endpoints

---

## Limitations & Future Work

### Current Limitations

1. **Context Window**: Limited to 4096 tokens for Mistral AI
2. **Streaming**: Simulated client-side, not true server-sent events
3. **Multimodal**: Text-only, no image/PDF parsing
4. **Language**: English only
5. **Scale**: Not tested beyond 1000 concurrent users
6. **Offline**: Requires internet for Mistral AI calls

### Future Enhancements

#### Phase 2 (Next 3 months)

- [ ] **True Streaming**: Implement SSE for real-time responses
- [ ] **Chat History**: Persist and display past conversations
- [ ] **Multi-tenancy**: Support multiple universities
- [ ] **Voice Interface**: Add speech-to-text input
- [ ] **Mobile App**: React Native client

#### Phase 3 (Next 6 months)

- [ ] **Multi-modal**: Support PDF, image, video ingestion
- [ ] **Multi-lingual**: Add Hindi, Telugu, Tamil support
- [ ] **Fine-tuning**: Custom LLM trained on university data
- [ ] **Advanced RAG**: Implement HyDE, recursive retrieval
- [ ] **Personalization**: User-specific response tuning

#### Phase 4 (Next 12 months)

- [ ] **Federated Learning**: Privacy-preserving model updates
- [ ] **Graph RAG**: Knowledge graph integration
- [ ] **Agentic Workflows**: Multi-step reasoning with tools
- [ ] **White-label**: SaaS platform for multiple institutions

### Research Directions

1. **Retrieval Optimization**:

   - Hybrid search (dense + sparse)
   - Recursive summarization
   - Query expansion techniques

2. **LLM Optimization**:

   - Quantized local models (LLaMA 3, Mistral)
   - Mixture of experts routing
   - Prompt optimization via DSPy

3. **Evaluation**:
   - Human-in-the-loop feedback
   - A/B testing framework
   - Red-teaming for safety

---

## Contributing

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make** your changes
4. **Test** thoroughly:

   ```bash
   # Backend tests
   pytest backend/tests

   # Frontend tests
   npm run test
   ```

5. **Commit** with clear messages:
   ```bash
   git commit -m "feat: add multi-language support"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Submit** a pull request

### Contribution Guidelines

- Follow existing code style (PEP 8 for Python, ESLint for TypeScript)
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive
- Reference issue numbers in PR descriptions

### Areas Needing Help

- [ ] Frontend UI/UX improvements
- [ ] Additional evaluation metrics
- [ ] Performance optimization
- [ ] Multi-language support
- [ ] Documentation improvements
- [ ] Test coverage increase

---

## License

This project is licensed under the MIT License.

## Citation

If you use AskUni in your research or project, please cite:

```bibtex
@software{askuni2024,
  author = {Your Name},
  title = {AskUni: AI-Powered University Assistant},
  year = {2024},
  url = {https://github.com/yourusername/AskUni}
}
```

---

## Contact

- **Email**: your.email@university.edu
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your Name](https://linkedin.com/in/yourprofile)

---

**Built with ❤️ for B.Tech Major Project**

**Star ⭐ this repo if you find it useful!**
