# AskUni - AI-Powered University Assistant 🎓🤖

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A production-grade RAG-based question-answering system for university environments, featuring advanced ML evaluation, real-time analytics, and a modern admin dashboard.

![AskUni Demo](docs/screenshots/demo.gif)

---

## ✨ Features

- 🤖 **RAG Architecture** - FAISS vector retrieval + Mistral AI generation
- 🔐 **Secure Auth** - JWT tokens with role-based access control
- 📊 **ML Evaluation** - Precision, Recall, MRR, Faithfulness metrics
- 📈 **Observability** - Real-time analytics & structured logging
- 🎨 **Modern UI** - Next.js with Tailwind CSS & shadcn/ui
- 🐳 **Docker Ready** - One-command deployment
- ✅ **Production Grade** - Security hardening, input validation, rate limiting

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/AskUni.git
cd AskUni
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your secrets
```

### 3. Start with Docker

```bash
docker-compose up -d
```

### 4. Initialize Data

```bash
docker-compose exec backend python main.py --ingest
```

**That's it!** 🎉

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📚 Demo

**Try it yourself**:

1. Visit http://localhost:3000
2. Login with: `admin@askuni.com` / `admin123secure`
3. Ask: _"What is the fee for B.Tech in Computer Science?"_

**Sample Queries**:

- "Tell me about hostel facilities"
- "What was the highest placement package?"
- "What are the admission requirements?"

---

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Next.js   │─────▶│   FastAPI   │─────▶│  PostgreSQL  │
│  Frontend   │ REST │   Backend   │  ORM │   Database   │
└─────────────┘      └──────┬──────┘      └──────────────┘
                            │
                   ┌────────┼────────┐
                   │        │        │
              ┌────▼───┐┌───▼───┐┌──▼──────┐
              │ FAISS  ││Mistral││Analytics│
              │Vector  ││  AI   ││ Engine  │
              └────────┘└───────┘└─────────┘
```

**Tech Stack**:

- **Backend**: FastAPI, SQLAlchemy, FAISS, Mistral AI
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand
- **Database**: PostgreSQL / SQLite
- **Deployment**: Docker Compose

---

## 📖 Documentation

- [**Complete Documentation**](docs/COMPLETE_DOCUMENTATION.md) - Architecture, setup, API reference
- [**Security Guide**](docs/SECURITY.md) - Threat model & security controls
- [**Docker Deployment**](docs/docker_deployment.md) - Production deployment guide
- [**Test Report**](docs/system_test_report.md) - System verification results

---

## 🎓 Use Cases

### For B.Tech Students

- Major project with production-grade code
- ML evaluation framework for research
- Dockerized deployment for easy demo

### For Recruiters

- Clean, maintainable codebase
- Modern tech stack (FastAPI, Next.js, Docker)
- Security best practices implemented

### For Open Source

- MIT licensed
- Well-documented
- Easy to extend

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
python test_comprehensive.py

# Frontend (future)
cd frontend
npm run test
```

**Test Coverage**:

- ✅ Authentication (Register, Login, JWT)
- ✅ RAG Pipeline (Retrieval, Generation, Sources)
- ✅ Admin Endpoints (Metrics, Analytics)
- ✅ Security (Input validation, Prompt injection)

---

## 📊 Evaluation Results

Latest evaluation run:

```
Precision@5:    0.85  (85% of top results relevant)
Recall@5:       0.78  (78% of relevant docs retrieved)
MRR:            0.92  (First relevant result at avg rank 1.08)
Faithfulness:   0.88  (88% answers grounded in context)
Avg Latency:    1.2s  (Response time)
```

---

## 🔒 Security

- bcrypt password hashing
- JWT authentication (30min expiration)
- Input sanitization & prompt injection detection
- Rate limiting (10 requests/min per user)
- Role-based access control (Student/Admin)

See [SECURITY.md](docs/SECURITY.md) for threat model.

---

## 🛣️ Roadmap

### ✅ Phase 1 (Completed)

- [x] RAG pipeline with FAISS + Mistral AI
- [x] Next.js frontend with admin dashboard
- [x] ML evaluation framework
- [x] Docker deployment

### 🚧 Phase 2 (In Progress)

- [ ] True streaming (SSE)
- [ ] Chat history persistence
- [ ] Multi-language support (Hindi, Telugu)

### 🔮 Phase 3 (Planned)

- [ ] Multi-modal (PDF, image ingestion)
- [ ] Voice interface
- [ ] Mobile app (React Native)
- [ ] Fine-tuned LLM on university data

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

**Areas needing help**:

- [ ] Frontend UI/UX improvements
- [ ] Multi-language support
- [ ] Performance optimization
- [ ] Additional evaluation metrics

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework
- [Mistral AI](https://mistral.ai/) - LLM provider
- [FAISS](https://github.com/facebookresearch/faiss) - Vector similarity search
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

## 📫 Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your Name](https://linkedin.com/in/yourprofile)
- **Email**: your.email@university.edu

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/AskUni&type=Date)](https://star-history.com/#yourusername/AskUni&Date)

---

**Built with ❤️ for the future of education**

If you found this helpful, please consider starring ⭐ the repository!
