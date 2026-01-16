# AskUni Backend

Production-grade FastAPI backend for AskUni.

## Setup

1. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

2. **Environment**:
   Check `.env` file. Update `DATABASE_URL` if using PostgreSQL.
   Default is `sqlite:///./sql_app.db` for easy testing.

3. **Run Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation

Once running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Verification

Run the verification script to test the full flow:

```bash
python verify_backend.py
```

**Note**: The server must be running in a separate terminal for this to work.

## Directory Structure

- `app/api/v1`: API Endpoints
- `app/core`: Config and Security
- `app/db`: Database Setup
- `app/models`: SQLAlchemy Models
- `app/schemas`: Pydantic Models
- `app/services`: Business Logic
