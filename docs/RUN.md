# How to Run AskUni

**Quick Navigation**:

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Docker Setup](#docker-setup)
- [Deployment (Cloud)](#deployment-cloud)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Python 3.11 or higher**

   ```bash
   python --version  # Should show 3.11+
   ```

   Download: https://www.python.org/downloads/

2. **Node.js 18 or higher**

   ```bash
   node --version  # Should show v18+
   ```

   Download: https://nodejs.org/

3. **Git**

   ```bash
   git --version
   ```

   Download: https://git-scm.com/downloads

4. **Docker Desktop** (Optional - for containerized deployment)
   - Download: https://www.docker.com/products/docker-desktop/

### API Keys

- **Mistral AI API Key** (Required)
  - Sign up: https://mistral.ai/
  - Get your API key from the dashboard
  - Copy it (you'll need it in step 4)

---

## Local Development Setup

**Estimated Time**: 15-20 minutes (first time)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/AskUni.git
cd AskUni
```

---

### Step 2: Setup Backend

#### 2.1 Navigate to Backend

```bash
cd backend
```

#### 2.2 Create Virtual Environment

**Windows**:

```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac**:

```bash
python -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

#### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected duration**: 3-5 minutes (downloads ~500MB of packages)

#### 2.4 Configure Environment

Create `.env` file in `backend/` directory:

**Windows**:

```bash
copy NUL .env
```

**Linux/Mac**:

```bash
touch .env
```

Edit `.env` with your text editor and add:

```env
# Database (SQLite for development)
DATABASE_URL=sqlite:///./sql_app.db

# Security - Generate a secure key
SECRET_KEY=your-super-secret-key-min-32-characters-long-change-this

# Mistral AI
MISTRAL_API_KEY=your-mistral-api-key-here

# RAG Settings
VECTOR_STORE_PATH=../vector_store
LLM_PROVIDER=mistral

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000
```

**Generate a secure SECRET_KEY**:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and replace `your-super-secret-key-min-32-characters-long-change-this`

#### 2.5 Initialize Database

```bash
python -c "from app.db.session import engine; from app.models.all_models import Base; from app.models.analytics_models import SourceUsageStats, QueryAnalytics; Base.metadata.create_all(engine)"
```

**Expected output**: No errors (silent success)

#### 2.6 Create Admin User

```bash
python -c "from app.db.session import SessionLocal; from app.models.all_models import User; from app.core.security import get_password_hash; db = SessionLocal(); admin = User(email='admin@askuni.com', hashed_password=get_password_hash('admin123secure'), role='admin'); db.add(admin); db.commit(); print('Admin user created!')"
```

**Expected output**: `Admin user created!`

---

### Step 3: Ingest University Data

#### 3.1 Navigate to Project Root

```bash
cd ..  # Go back to AskUni/
```

#### 3.2 Run Ingestion Script

```bash
python main.py --ingest
```

**Expected output**:

```
Loading documents from data/raw/...
Processing 5 documents...
Creating embeddings...
Saving to FAISS index...
✓ Ingestion complete! Indexed 5 documents.
```

**Expected duration**: 2-3 minutes

---

### Step 4: Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload
```

**Expected output**:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

**✅ Backend is running at: http://localhost:8000**

**Test it**: Open http://localhost:8000/docs in your browser

- You should see the Swagger API documentation

**Leave this terminal running** and open a **new terminal** for the frontend.

---

### Step 5: Setup Frontend

In a **new terminal**:

#### 5.1 Navigate to Frontend

```bash
cd AskUni/frontend  # Adjust path based on where you are
```

#### 5.2 Install Dependencies

```bash
npm install
```

**Expected duration**: 2-3 minutes

#### 5.3 Configure Environment

Create `.env.local` file:

**Windows**:

```bash
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 > .env.local
```

**Linux/Mac**:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
```

#### 5.4 Start Frontend Server

```bash
npm run dev
```

**Expected output**:

```
▲ Next.js 16.1.2 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.x.x:3000
✓ Starting...
✓ Ready in 866ms
```

**✅ Frontend is running at: http://localhost:3000**

---

### Step 6: Access the Application

1. **Open your browser** and go to: **http://localhost:3000**

2. **Login as Admin**:

   - Click "Login"
   - Email: `admin@askuni.com`
   - Password: `admin123secure`
   - Click "Sign In"

3. **Test the Chat**:

   - You'll be redirected to `/chat`
   - Ask: _"What is the fee for B.Tech in Computer Science?"_
   - You should get an answer with source citations

4. **Access Admin Dashboard**:
   - Click "Admin Dashboard" button in the header
   - Explore metrics, documents, feedback

**🎉 Congratulations! AskUni is running!**

---

## Docker Setup

**Estimated Time**: 25-30 minutes (first time), 2 minutes (subsequent times)

### Step 1: Ensure Docker is Running

1. **Start Docker Desktop**
2. **Verify** it's running:
   ```bash
   docker --version
   docker-compose --version
   ```

### Step 2: Configure Environment

```bash
cd AskUni
cp .env.example .env
```

Edit `.env` file:

```env
# Database
POSTGRES_USER=askuni
POSTGRES_PASSWORD=your-secure-password-here  # Change this!
POSTGRES_DB=askuni

# Backend Security
SECRET_KEY=your-generated-secret-key-32-chars  # Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
MISTRAL_API_KEY=your-mistral-api-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Step 3: Build and Start Containers

```bash
docker-compose up -d --build
```

**Expected duration**:

- First time: 20-25 minutes (downloading and building images)
- Subsequent times: 10-30 seconds (using cached layers)

**Expected output**:

```
[+] Building 1234.5s (25/25) FINISHED
[+] Running 3/3
 ✔ Container askuni-postgres   Started
 ✔ Container askuni-backend    Started
 ✔ Container askuni-frontend   Started
```

### Step 4: Initialize Database

```bash
# Create tables
docker-compose exec backend python -c "from app.db.session import engine; from app.models.all_models import Base; from app.models.analytics_models import SourceUsageStats, QueryAnalytics; Base.metadata.create_all(engine)"

# Create admin user
docker-compose exec backend python -c "from app.db.session import SessionLocal; from app.models.all_models import User; from app.core.security import get_password_hash; db = SessionLocal(); admin = User(email='admin@askuni.com', hashed_password=get_password_hash('admin123secure'), role='admin'); db.add(admin); db.commit(); print('Admin created!')"
```

### Step 5: Ingest Data

```bash
docker-compose exec backend python /app/main.py --ingest
```

**Expected output**:

```
Loading documents...
✓ Ingestion complete!
```

### Step 6: Access Application

Open: **http://localhost:3000**

Login with `admin@askuni.com` / `admin123secure`

---

### Docker Management Commands

**View logs**:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Check status**:

```bash
docker-compose ps
```

**Stop services**:

```bash
docker-compose down
```

**Restart services**:

```bash
docker-compose restart
```

**Rebuild after code changes**:

```bash
docker-compose up -d --build
```

---

## Deployment (Cloud)

Want to share your project with the world? We support deploying to **Vercel (Frontend)** and **Railway (Backend)** for free.

**👉 [Read the Complete Deployment Guide](DEPLOYMENT_VERCEL_RAILWAY.md)**

**Quick Summary**:

1. Push code to GitHub
2. Deploy Backend to Railway (Connect GitHub Repo)
3. Deploy Frontend to Vercel (Connect GitHub Repo)
4. Enjoy your live URL!

---

## Verification

### Backend Verification

1. **API Docs**: http://localhost:8000/docs

   - Should show Swagger UI with all endpoints

2. **Health Check**:

   ```bash
   curl http://localhost:8000/health
   ```

   **Expected**: `{"status":"healthy"}`

3. **Test Authentication**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@askuni.com&password=admin123secure"
   ```
   **Expected**: JSON with `access_token`

### Frontend Verification

1. **Landing Page**: http://localhost:3000

   - Should show AskUni homepage

2. **Login Page**: http://localhost:3000/login

   - Should show login form

3. **Console Check** (F12 → Console):
   - No red errors
   - May see normal Next.js messages

### Database Verification

**Local (SQLite)**:

```bash
cd backend
sqlite3 sql_app.db "SELECT email, role FROM users;"
```

**Expected**: Shows admin@askuni.com | admin

**Docker (PostgreSQL)**:

```bash
docker-compose exec postgres psql -U askuni -d askuni -c "SELECT email, role FROM users;"
```

### Vector Store Verification

```bash
ls -lh vector_store/
```

**Expected**: `index.faiss` file (~50-100KB)

---

## Troubleshooting

### Backend Issues

#### Error: "ModuleNotFoundError"

**Solution**: Install missing dependency

```bash
cd backend
pip install <missing-module>
```

#### Error: "MISTRAL_API_KEY not set"

**Solution**: Check `.env` file exists and has valid API key

```bash
cat backend/.env | grep MISTRAL
```

#### Error: "Address already in use (port 8000)"

**Solution**: Kill process using port 8000

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

#### Error: "EADDRINUSE: port 3000 already in use"

**Solution**: Kill process or use different port

```bash
# Kill process
# Windows: Same as above  with port 3000
# Linux/Mac: lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Error: "Could not connect to backend"

**Solution**:

1. Ensure backend is running on port 8000
2. Check `.env.local` has correct API URL
3. Check browser console for CORS errors

### Docker Issues

#### Error: "Docker daemon not running"

**Solution**: Start Docker Desktop and wait for it to fully initialize

#### Error: "Authentication required"

**Solution**: Sign in to Docker Desktop (top right corner)

#### Error: "Build failed"

**Solution**: Clean and rebuild

```bash
docker-compose down -v
docker system prune -a --volumes  # CAUTION: Removes all Docker data
docker-compose up -d --build
```

#### Containers won't start

**Solution**: Check logs

```bash
docker-compose logs backend
docker-compose logs frontend
```

### General Issues

#### Slow performance

**Solution**:

- Close unused applications
- Increase Docker memory (Settings → Resources)
- Use local setup instead of Docker for development

#### Chat not returning answers

**Check**:

1. ✅ Vector store exists: `ls vector_store/index.faiss`
2. ✅ Mistral API key is valid
3. ✅ Check backend logs for errors

---

## Quick Reference

### Ports

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432 (Docker) or `sql_app.db` (local)

### Default Credentials

- **Admin**: `admin@askuni.com` / `admin123secure`
- **Test User**: Create via `/register`

### Important Files

- Backend config: `backend/.env`
- Frontend config: `frontend/.env.local`
- Database: `backend/sql_app.db` (local) or PostgreSQL (Docker)
- Vector store: `vector_store/index.faiss`
- Docs: `data/raw/*.txt`

### Useful Commands

**Backend**:

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

**Frontend**:

```bash
cd frontend
npm run dev
```

**Docker**:

```bash
docker-compose up -d        # Start
docker-compose down         # Stop
docker-compose logs -f      # View logs
docker-compose ps           # Check status
```

---

## Next Steps

After running successfully:

1. **Explore the Admin Dashboard** at `/admin`
2. **Test different queries** in the chat
3. **Run evaluation** (for B.Tech project):
   ```bash
   cd backend
   python run_eval_direct.py
   ```
4. **Review Documentation** in `docs/` folder
5. **Customize** for your university (add more documents in `data/raw/`)

---

## Getting Help

**Documentation**:

- Complete Docs: `docs/COMPLETE_DOCUMENTATION.md`
- Security: `docs/SECURITY.md`
- Docker Guide: `docs/docker_deployment.md`

**Issues**:

- GitHub Issues: [Create an issue](https://github.com/yourusername/AskUni/issues)
- Email: your.email@university.edu

**Community**:

- Discussions: GitHub Discussions
- Contributing: `docs/CONTRIBUTING.md`

---

**🎉 Happy Running! If everything works, you're ready to demo your project!**

**Time to complete**:

- Local setup: ~20 minutes
- Docker setup: ~30 minutes (first time)
- Testing: ~10 minutes

**Total**: ~1 hour for complete first-time setup ✅
