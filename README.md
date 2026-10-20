# Athlete Workload Monitoring System

A full-stack dashboard for exploring athlete training workload, workload alerts, and injury recovery across multiple sports. Built as a DBMS project using React, FastAPI, and MySQL.

**Live demo:** [Athlete Workload Monitor](https://athlete-workload-monitor.vercel.app)
**API health:** [Check API status](https://athlete-workload-monitor.onrender.com/health)
**Interactive API documentation:** [Open Swagger UI](https://athlete-workload-monitor.onrender.com/docs)
**Source code:** [GitHub repository](https://github.com/manas-mahawar/athlete-workload-monitor)

> **Demo-data notice:** The current athlete, workload, injury, and alert records are synthetic sample data for demonstration. Workload alerts are illustrative and are not medical diagnoses.

## Features

- **Overview dashboard:** Athlete status, workload summaries, injury statistics, and high-risk alerts.
- **Athlete directory and profiles:** Sport, coach, training centre, workload history, alerts, and injuries.
- **Workload analytics:** Session load, daily totals, sport-level summaries, and session-type breakdowns.
- **Injuries and recovery:** Injury severity, return dates, recovery sessions, and reported pain levels.
- **Workload alerts:** ACWR values, risk categories, and resolution status.
- **Database validation:** Foreign keys, constraints, a generated workload column, views, and a validation trigger.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Python, FastAPI |
| Database | MySQL 8 |
| Deployment | Vercel, Render, Aiven |

## Architecture

```text
Browser
   |
   v
React + TypeScript frontend (Vercel)
   |
   | HTTPS / JSON API requests
   v
FastAPI backend (Render)
   |
   v
MySQL database (Aiven)
```

## Repository structure

```text
backend/    FastAPI routes, database connection, API checks
frontend/   React + TypeScript dashboard
database/   Schema reference for documentation
```

**Important:** `database/schema_reference.sql` is a documentation-only schema reference. Do not execute it as a migration script.

## Run locally

### Requirements

- Python compatible with `backend/requirements.txt`
- Node.js and npm
- A MySQL database initialized with the project schema and sample data

### 1. Set up the backend

Open PowerShell in the repository folder:

```powershell
cd backend
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Edit `backend/.env` with your own MySQL connection details. Never commit this file or publish database credentials.

### 2. Start the API

From the `backend` directory:

```powershell
uvicorn main:app --reload --port 8000
```

API base URL: `http://localhost:8000`
Interactive documentation: `http://localhost:8000/docs`

### 3. Set up the frontend

Open a second PowerShell terminal:

```powershell
cd "C:\Users\DEAL\Desktop\athlete-workload-monitor\frontend"
npm install
```

The frontend reads its API URL from `VITE_API_BASE_URL`. For local development, it defaults to `http://localhost:8000`.

To set it explicitly, create `frontend/.env.local` containing:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```powershell
npm run dev
```

Open `http://localhost:5173`.

## Verification

Run the backend smoke tests while the API is running:

```powershell
cd backend
.\.venv\Scripts\python.exe check_api.py
```

Check frontend code quality and build:

```powershell
cd frontend
npm run lint
npm run build
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check API process health |
| GET | `/api/db-check` | Check database access and row counts |
| GET | `/api/overview` | Dashboard summary |
| GET | `/api/athletes` | Athlete directory |
| GET | `/api/athletes/{athlete_id}` | Athlete profile and history |
| GET | `/api/workload` | Workload analytics |
| GET | `/api/injuries` | Injury and recovery records |
| GET | `/api/alerts` | Workload alerts |

## DBMS concepts demonstrated

- Relational schema design using primary and foreign keys
- Data integrity through constraints and a validation trigger
- Generated column: `session_load = duration_min × rpe`
- Views for athlete workload summaries and high-risk alerts
- SQL joins, aggregate functions, grouping, sorting, and subqueries

## Deployment configuration

- **Vercel:** `VITE_API_BASE_URL=https://athlete-workload-monitor.onrender.com`
- **Render:** `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`
- **Aiven:** Hosted MySQL database

Keep credentials in environment variables and out of Git. Free hosting services may sleep when inactive, so the first request after a quiet period can take longer.
