# Athlete Workload Monitoring System

A dashboard for tracking athlete training load, workload (ACWR) alerts, and
injury recovery. MySQL stores the data, FastAPI serves it as JSON, and a React
app displays it.

```
backend/    FastAPI app (main.py), MySQL connection (database.py), API smoke test (check_api.py)
frontend/   React + TypeScript + Vite app, styled with Tailwind CSS, charts with Recharts
database/   schema_reference.sql: structure export, for reading only (do not run it)
```

## Setup

1. Copy `backend/.env.example` to `backend/.env` and fill in the MySQL login.
   `backend/.env` is git-ignored and must never be committed.
2. Install the backend packages (once):
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
3. Install the frontend packages (once):
   ```powershell
   cd frontend
   npm install
   ```

## Run

Terminal 1, the API at http://localhost:8000 (interactive docs at /docs):
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

Terminal 2, the dashboard at http://localhost:5173:
```powershell
cd frontend
npm run dev
```

## Check

With the API running:
```powershell
cd backend
.\.venv\Scripts\python.exe check_api.py
```

Frontend type-check and production build:
```powershell
cd frontend
npm run build
```
