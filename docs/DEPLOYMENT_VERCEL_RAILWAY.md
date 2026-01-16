# AskUni - Vercel + Railway Deployment Guide

**Deploy your project to the cloud in 30 minutes!**

---

## Overview

- **Frontend**: Vercel (Next.js hosting)
- **Backend**: Railway (Python + PostgreSQL)
- **Cost**: FREE (Vercel unlimited, Railway $5 credit/month)
- **Result**: Live URLs to share with recruiters!

---

## Prerequisites

- [x] GitHub account
- [x] Vercel account (sign up at vercel.com)
- [x] Railway account (sign up at railway.app)
- [x] Your code pushed to GitHub

---

## Part 1: Push to GitHub (5 minutes)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `AskUni`
3. Description: `AI-Powered University Assistant with RAG`
4. Visibility: **Public** (for portfolio)
5. Click **"Create repository"**

### Step 2: Push Your Code

**In your project directory**:

```bash
cd C:\Projects\AskUni

# Initialize git (if not done)
git init

# Create .gitignore
```

Create `.gitignore` file:

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
*.egg
*.egg-info/
dist/
build/
*.db
*.sqlite
*.sqlite3

# Node
node_modules/
.next/
.vercel/
out/

# Environment
.env
.env.local
.env*.local
backend/.env

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Vector store (too large for git)
vector_store/
```

**Push to GitHub**:

```bash
git add .
git commit -m "Initial commit: AskUni AI Assistant"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/AskUni.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

---

## Part 2: Deploy Backend to Railway (15 minutes)

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with GitHub
4. Authorize Railway

### Step 2: Create New Project

1. Click **"+ New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **AskUni** repository
4. Select **"Deploy Now"**

### Step 3: Configure Backend Service

Railway will auto-detect it's a Python project.

**Add a `railway.json` file** to your backend directory first:

Create `backend/railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Commit and push**:

```bash
git add backend/railway.json
git commit -m "Add Railway configuration"
git push
```

### Step 4: Add PostgreSQL Database

1. In Railway dashboard, click **"+ New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Wait for provisioning (~1 minute)

### Step 5: Set Environment Variables

In Railway backend service, go to **"Variables"** tab:

```env
SECRET_KEY=<generate-with-python-secrets>
MISTRAL_API_KEY=your-mistral-api-key
VECTOR_STORE_PATH=./vector_store
LLM_PROVIDER=mistral
BACKEND_CORS_ORIGINS=*
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Generate SECRET_KEY**:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Important**:

- `DATABASE_URL` will auto-reference the PostgreSQL database
- `BACKEND_CORS_ORIGINS=*` allows all origins (change later for security)

### Step 6: Deploy Data Files

**Option A: Include in Git** (Recommended for demo)

Add vector store to git (with Git LFS for large files):

```bash
# Install Git LFS (if not installed)
# Windows: Download from https://git-lfs.github.com/

git lfs install
git lfs track "vector_store/*.faiss"
git lfs track "vector_store/*.pkl"
git add .gitattributes vector_store/
git commit -m "Add vector store with Git LFS"
git push
```

**Option B: Upload via Railway CLI** (For very large files)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Upload vector store
railway run python main.py --ingest
```

### Step 7: Initialize Database

Once deployed, open Railway **"Terminal"** tab and run:

```bash
python -c "from app.db.session import engine; from app.models.all_models import Base; from app.models.analytics_models import SourceUsageStats, QueryAnalytics; Base.metadata.create_all(engine)"

python -c "from app.db.session import SessionLocal; from app.models.all_models import User; from app.core.security import get_password_hash; db = SessionLocal(); admin = User(email='admin@askuni.com', hashed_password=get_password_hash('admin123secure'), role='admin'); db.add(admin); db.commit(); print('Admin created!')"
```

### Step 8: Get Backend URL

1. Go to **"Settings"** tab
2. Find **"Domains"** section
3. Click **"Generate Domain"**
4. Copy URL (e.g., `https://askuni-backend-production.up.railway.app`)

**Test it**:

```bash
curl https://your-railway-url.up.railway.app/health
```

Expected: `{"status":"healthy"}`

---

## Part 3: Deploy Frontend to Vercel (10 minutes)

### Step 1: Sign Up for Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Sign in with GitHub
4. Authorize Vercel

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your **AskUni** repository
3. Vercel auto-detects Next.js

### Step 3: Configure Frontend

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `frontend` (IMPORTANT!)

**Build Settings**:

- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Environment Variables**:
Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.up.railway.app/api/v1
```

Replace `your-railway-backend-url` with actual Railway URL from Step 2.8!

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Get your live URL!

**Your frontend will be at**:

```
https://askuni-yourname.vercel.app
```

---

## Part 4: Final Configuration (5 minutes)

### Update CORS in Backend

Go to Railway → Backend → Variables, update:

```env
BACKEND_CORS_ORIGINS=https://askuni-yourname.vercel.app,http://localhost:3000
```

Replace with your actual Vercel URL.

**Redeploy backend** (Railway auto-redeploys on env change).

---

## Part 5: Testing (5 minutes)

### Test Backend

```bash
# Health check
curl https://your-backend.railway.app/health

# API docs
open https://your-backend.railway.app/docs
```

### Test Frontend

1. Open your Vercel URL
2. Click **"Login"**
3. Use: `admin@askuni.com` / `admin123secure`
4. Try a query: _"What is the fee for B.Tech CSE?"_

### Test Full Flow

- [ ] Homepage loads
- [ ] Login works
- [ ] Chat returns answers with sources
- [ ] Admin dashboard shows metrics
- [ ] No CORS errors in console (F12)

---

## Troubleshooting

### "Cannot connect to backend"

**Check**:

1. Backend is deployed and running (Railway dashboard)
2. `NEXT_PUBLIC_API_URL` in Vercel matches Railway URL
3. CORS is configured correctly in Railway

**Fix**:

```bash
# In Vercel, check Environment Variables
# Make sure no trailing slash in API_URL
NEXT_PUBLIC_API_URL=https://backend.railway.app/api/v1  ✅
# not:
NEXT_PUBLIC_API_URL=https://backend.railway.app/api/v1/  ❌
```

### "Database connection error"

**Check**:

1. PostgreSQL is running in Railway
2. `DATABASE_URL` variable is set correctly
3. Database tables are created

**Fix**:

```bash
# In Railway terminal
python -c "from app.db.session import engine; from app.models.all_models import Base; Base.metadata.create_all(engine)"
```

### "Module not found" errors

**Check**: `requirements.txt` is in backend folder

**Fix**:

```bash
# Make sure Railway is looking at backend/ directory
# In railway.json, root should be backend/
```

### Cold starts are slow

**Solution**: Railway keeps apps warm on paid plan (~$5/month)

**Workaround**: Use a cron job to ping every 5 minutes:

```bash
# Use cron-job.org to ping
https://your-backend.railway.app/health
```

---

## Monitoring & Maintenance

### View Logs

**Backend (Railway)**:

1. Railway dashboard → your backend service
2. Click **"Logs"** tab
3. Monitor real-time logs

**Frontend (Vercel)**:

1. Vercel dashboard → your project
2. Click **"Logs"** tab
3. Filter by deployment

### Update Code

**Automatic deployment on push**:

```bash
git add .
git commit -m "Update feature"
git push
```

Both Vercel and Railway auto-deploy from GitHub!

### Analytics

**Railway**:

- CPU usage
- Memory usage
- Request count

**Vercel**:

- Page views
- Function invocations
- Build times

---

## Custom Domain (Optional)

### Frontend (Vercel)

1. Buy domain from Namecheap/GoDaddy
2. Vercel → Settings → Domains
3. Add your domain (e.g., `askuni.com`)
4. Update DNS records (Vercel provides instructions)

### Backend (Railway)

1. Railway → Settings → Domains
2. Add custom domain (e.g., `api.askuni.com`)
3. Update DNS CNAME record

---

## Cost Breakdown

### Free Tier Limits

**Vercel** (Free Forever):

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions
- ✅ Automatic SSL

**Railway** (Free $5 credit/month):

- ✅ $5 usage credit
- ✅ PostgreSQL database
- ✅ 512MB RAM
- ⚠️ ~20-25 hours uptime/month (with constant usage)

**Total**: **$0-5/month**

### Upgrade (Optional)

**Vercel Pro** ($20/month):

- ✅ Custom domains
- ✅ Password protection
- ✅ Advanced analytics

**Railway Pro** ($20/month):

- ✅ Always warm (no cold starts)
- ✅ More usage hours
- ✅ Priority support

**For B.Tech project demo**: Free tier is sufficient!

---

## URLs to Share

After deployment, you'll have:

1. **Live Application**: `https://askuni-yourname.vercel.app`
2. **API Documentation**: `https://your-backend.railway.app/docs`
3. **GitHub Repository**: `https://github.com/yourname/AskUni`

**Add these to**:

- Resume
- LinkedIn
- Portfolio website
- B.Tech project report

---

## Security Checklist for Production

If you want to make it production-ready:

- [ ] Change admin password from default
- [ ] Set strong `SECRET_KEY` (32+ characters)
- [ ] Update CORS to specific domains only
- [ ] Enable Vercel password protection (Settings → General)
- [ ] Add rate limiting (already in code, needs activation)
- [ ] Setup monitoring alerts (Railway + Vercel)
- [ ] Backup database regularly (Railway CLI)

---

## Backup & Recovery

### Backup Database

```bash
# Install Railway CLI
railway login
railway link

# Backup
railway run pg_dump > backup.sql
```

### Restore Database

```bash
railway run psql < backup.sql
```

### Backup Vector Store

Download from Railway or keep in Git LFS.

---

## Performance Optimization

### Frontend (Vercel)

- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ CDN caching

### Backend (Railway)

**Add caching**:

```python
# In backend, install redis (future enhancement)
```

**Optimize queries**:

- Use database indexing
- Cache FAISS results

---

## Next Steps After Deployment

1. **Share URL** with professors/recruiters
2. **Create demo video** showing live site
3. **Update documentation** with live URLs
4. **Add to portfolio** website
5. **Monitor usage** via Railway/Vercel dashboards

---

## Support

**Issues?**

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- GitHub Issues: Create issue in your repo

**Community**:

- Railway Discord: https://discord.gg/railway
- Vercel Discord: https://vercel.com/discord

---

## Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] PostgreSQL added to Railway
- [ ] Environment variables set in Railway
- [ ] Database initialized
- [ ] Vector store uploaded
- [ ] Backend deployed and tested
- [ ] Vercel project created
- [ ] Frontend environment variable set
- [ ] Frontend deployed
- [ ] CORS updated
- [ ] End-to-end testing done
- [ ] URLs documented

---

**Estimated Total Time**: 30-45 minutes

**Difficulty**: Easy (follow step-by-step)

**Result**: Production-ready, shareable demo! 🎉

---

**Created by**: Antigravity AI  
**Last Updated**: 2026-01-16  
**For**: AskUni B.Tech Major Project
