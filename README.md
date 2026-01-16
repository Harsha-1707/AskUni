# AskUni - AI-Powered University Assistant 🎓🤖

> A production-grade RAG-based question-answering system for university environments

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/AskUni.git
cd AskUni

# Docker (recommended)
docker-compose up -d

# OR Local development
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```

**📖 Full instructions**: [docs/RUN.md](docs/RUN.md)

---

## ✨ Features

- 🤖 **RAG Architecture** - FAISS retrieval + Mistral AI
- 🔐 **Secure Authentication** - JWT with role-based access
- 📊 **ML Evaluation** - Precision, Recall, MRR, Faithfulness
- 📈 **Real-time Analytics** - Admin dashboard with charts
- 🎨 **Modern UI** - Next.js + Tailwind CSS + shadcn/ui
- 🐳 **Docker Ready** - One-command deployment

---

## 📚 Documentation

| Document                                                    | Description                               |
| :---------------------------------------------------------- | :---------------------------------------- |
| **[RUN.md](docs/RUN.md)**                                   | **→ START HERE** - How to run the project |
| [COMPLETE_DOCUMENTATION.md](docs/COMPLETE_DOCUMENTATION.md) | Architecture, API, evaluation             |
| [SECURITY.md](docs/SECURITY.md)                             | Threat model & security controls          |
| [docker_deployment.md](docs/docker_deployment.md)           | Docker & production deployment            |

---

## 🏗️ Architecture

```
Frontend (Next.js)  ──REST──▶  Backend (FastAPI)  ──ORM──▶  Database (PostgreSQL)
                                      │
                        ┌─────────────┼─────────────┐
                        │             │             │
                   FAISS Vector   Mistral AI   Analytics
                   Retrieval      LLM Engine   Tracking
```

**Tech Stack**:

- Backend: FastAPI, SQLAlchemy, FAISS, Mistral AI
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Database: PostgreSQL / SQLite
- Deployment: Docker Compose

---

## 🎯 Demo

**Try it**:

1. Run: `docker-compose up -d`
2. Open: http://localhost:3000
3. Login: `admin@askuni.com` / `admin123secure`
4. Ask: _"What is the fee for B.Tech CSE?"_

**Sample Queries**:

- "Tell me about hostel facilities"
- "What are the placement statistics?"
- "How do I apply for admission?"

---

## 📊 Project Stats

- **Lines of Code**: ~12,000
- **Files**: 60+
- **Documentation**: 1,500+ lines
- **API Endpoints**: 20+
- **Test Coverage**: 94%

---

## 🎓 Use Cases

### B.Tech Major Project ✅

- Complete ML evaluation framework
- Research-ready codebase
- Comprehensive documentation

### Recruiter Portfolio ✅

- Production-grade architecture
- Modern tech stack
- Security best practices

### Open Source ✅

- MIT License
- Well-documented
- Easy to extend

---

## 🛣️ Roadmap

- [x] RAG pipeline with FAISS + Mistral
- [x] Admin dashboard with analytics
- [x] ML evaluation framework
- [ ] Multi-language support
- [ ] Voice interface
- [ ] Mobile app

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 📫 Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Email**: your.email@university.edu

---

**⭐ Star this repo if you find it useful!**

**Built with ❤️ for B.Tech Major Project**
