import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import fetch_all

app = FastAPI(title="Athlete Workload Monitoring API")

# Let the React dev server call this API. The browser treats localhost and
# 127.0.0.1 as different origins, so both are listed. The API only reads
# data, so only GET requests are allowed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

EXISTING_TABLES = [
    "sports",
    "coaches",
    "training_centres",
    "athletes",
    "training_sessions",
    "workload_records",
    "injuries",
    "recovery_sessions",
    "workload_alerts",
]

# Base SELECT statements shared by more than one endpoint. Each endpoint adds
# its own WHERE / ORDER BY; any values still go in as %s parameters.
ALERT_SELECT = """
    SELECT w.alert_id, w.athlete_id, w.alert_date, w.acwr_value,
           w.risk_level, w.is_resolved,
           CONCAT(a.first_name, ' ', a.last_name) AS athlete_name,
           s.sport_name, s.acwr_low, s.acwr_high
    FROM workload_alerts w
    JOIN athletes a ON w.athlete_id = a.athlete_id
    JOIN sports s ON a.sport_id = s.sport_id
"""

WORKLOAD_SELECT = """
    SELECT w.record_id, w.athlete_id, w.duration_min, w.rpe, w.session_load,
           CONCAT(a.first_name, ' ', a.last_name) AS athlete_name,
           s.sport_name,
           ts.session_id, ts.session_date, ts.session_type, ts.venue
    FROM workload_records w
    JOIN athletes a ON w.athlete_id = a.athlete_id
    JOIN sports s ON a.sport_id = s.sport_id
    JOIN training_sessions ts ON w.session_id = ts.session_id
"""

INJURY_SELECT = """
    SELECT i.injury_id, i.athlete_id, i.injury_date, i.body_part, i.severity,
           i.return_date, i.notes,
           CONCAT(a.first_name, ' ', a.last_name) AS athlete_name,
           s.sport_name
    FROM injuries i
    JOIN athletes a ON i.athlete_id = a.athlete_id
    JOIN sports s ON a.sport_id = s.sport_id
"""

RECOVERY_SELECT = """
    SELECT r.recovery_id, r.injury_id, r.session_date, r.therapy_type, r.pain_level
    FROM recovery_sessions r
"""


def run_query(sql, params=None):
    """Run a SELECT query; if MySQL fails, answer with HTTP 503."""
    try:
        return fetch_all(sql, params)
    except mysql.connector.Error as error:
        # Full error goes to the server console; the client gets a short message
        print("Database query failed:", error)
        raise HTTPException(
            status_code=503,
            detail="Could not read from the database. Check backend/.env and that MySQL is running.",
        )


def add_recovery_sessions(injuries, recovery_sessions):
    """Give each injury a list of its own recovery sessions."""
    for injury in injuries:
        injury["recovery_sessions"] = [
            session
            for session in recovery_sessions
            if session["injury_id"] == injury["injury_id"]
        ]
    return injuries


@app.get("/health")
def health():
    """Confirms the API process is running. Does not touch the database."""
    return {"status": "ok"}


@app.get("/api/db-check")
def db_check():
    """Count the rows in each existing table."""
    row_counts = {}
    for table_name in EXISTING_TABLES:
        # Table names cannot be %s parameters, so they are inserted with an
        # f-string. This is safe only because they come from the fixed list above.
        rows = run_query(f"SELECT COUNT(*) AS total FROM {table_name}")
        row_counts[table_name] = rows[0]["total"]
    return {"database": "connected", "row_counts": row_counts}


@app.get("/api/overview")
def overview():
    """Headline numbers for the dashboard home page."""
    status_rows = run_query(
        "SELECT status, COUNT(*) AS total FROM athletes GROUP BY status"
    )
    athletes_by_status = {row["status"]: row["total"] for row in status_rows}

    # In MySQL a true comparison counts as 1, so SUM(condition) counts matching rows
    alerts = run_query(
        """SELECT COALESCE(SUM(is_resolved = 0 AND risk_level = 'High'), 0) AS open_high,
                  COALESCE(SUM(is_resolved = 0 AND risk_level = 'Moderate'), 0) AS open_moderate,
                  COALESCE(SUM(is_resolved = 0 AND risk_level = 'Low'), 0) AS open_low,
                  COALESCE(SUM(is_resolved = 1), 0) AS resolved
           FROM workload_alerts"""
    )[0]

    injuries = run_query(
        """SELECT COUNT(*) AS total,
                  COALESCE(SUM(return_date IS NULL), 0) AS open_injuries
           FROM injuries"""
    )[0]

    workload = run_query(
        """SELECT COUNT(*) AS records,
                  COALESCE(SUM(session_load), 0) AS total_load,
                  ROUND(AVG(session_load), 2) AS average_load,
                  ROUND(AVG(rpe), 2) AS average_rpe
           FROM workload_records"""
    )[0]

    date_range = run_query(
        """SELECT MIN(ts.session_date) AS first_session,
                  MAX(ts.session_date) AS last_session
           FROM workload_records w
           JOIN training_sessions ts ON w.session_id = ts.session_id"""
    )[0]

    high_risk_alerts = run_query(
        "SELECT * FROM vw_high_risk_alerts ORDER BY acwr_value DESC"
    )
    top_workloads = run_query(
        """SELECT * FROM vw_athlete_workload_summary
           ORDER BY total_workload DESC LIMIT 5"""
    )

    return {
        "athletes_by_status": athletes_by_status,
        "alerts": alerts,
        "injuries": injuries,
        "workload": workload,
        "date_range": date_range,
        "high_risk_alerts": high_risk_alerts,
        "top_workloads": top_workloads,
    }


@app.get("/api/athletes")
def list_athletes():
    """Every athlete with sport, coach, centre, workload totals and latest alert."""
    return run_query(
        """SELECT a.athlete_id,
                  CONCAT(a.first_name, ' ', a.last_name) AS athlete_name,
                  a.date_of_birth, a.gender, a.home_state, a.status,
                  s.sport_name, s.sport_type, c.coach_name, t.centre_name,
                  COALESCE(v.total_sessions, 0) AS total_sessions,
                  COALESCE(v.total_workload, 0) AS total_workload,
                  latest.acwr_value AS latest_acwr,
                  latest.risk_level AS latest_risk_level,
                  latest.is_resolved AS latest_alert_resolved,
                  (SELECT COUNT(*) FROM injuries i
                   WHERE i.athlete_id = a.athlete_id AND i.return_date IS NULL) AS open_injuries
           FROM athletes a
           JOIN sports s ON a.sport_id = s.sport_id
           JOIN coaches c ON a.coach_id = c.coach_id
           JOIN training_centres t ON a.centre_id = t.centre_id
           LEFT JOIN vw_athlete_workload_summary v ON v.athlete_id = a.athlete_id
           -- Latest alert = newest alert_date; the higher alert_id breaks a tie.
           -- LEFT JOIN keeps athletes who have no alerts (their latest_* fields are NULL).
           LEFT JOIN workload_alerts latest ON latest.alert_id = (
               SELECT w.alert_id FROM workload_alerts w
               WHERE w.athlete_id = a.athlete_id
               ORDER BY w.alert_date DESC, w.alert_id DESC
               LIMIT 1)
           ORDER BY a.last_name, a.first_name"""
    )


@app.get("/api/athletes/{athlete_id}")
def get_athlete(athlete_id: int):
    """One athlete's profile, workload history, alerts and injuries."""
    rows = run_query(
        """SELECT a.athlete_id,
                  CONCAT(a.first_name, ' ', a.last_name) AS athlete_name,
                  a.first_name, a.last_name, a.date_of_birth, a.gender,
                  a.home_state, a.status,
                  s.sport_name, s.sport_type, s.acwr_low, s.acwr_high,
                  c.coach_name, c.nis_certified,
                  t.centre_name, t.centre_type
           FROM athletes a
           JOIN sports s ON a.sport_id = s.sport_id
           JOIN coaches c ON a.coach_id = c.coach_id
           JOIN training_centres t ON a.centre_id = t.centre_id
           WHERE a.athlete_id = %s""",
        (athlete_id,),
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Athlete not found")
    athlete = rows[0]

    summary = run_query(
        "SELECT * FROM vw_athlete_workload_summary WHERE athlete_id = %s",
        (athlete_id,),
    )
    athlete["summary"] = summary[0] if summary else None

    athlete["workload_records"] = run_query(
        WORKLOAD_SELECT + " WHERE w.athlete_id = %s ORDER BY ts.session_date, w.record_id",
        (athlete_id,),
    )
    athlete["alerts"] = run_query(
        ALERT_SELECT + " WHERE w.athlete_id = %s ORDER BY w.alert_date DESC",
        (athlete_id,),
    )

    injuries = run_query(
        INJURY_SELECT + " WHERE i.athlete_id = %s ORDER BY i.injury_date DESC",
        (athlete_id,),
    )
    recovery_sessions = run_query(
        RECOVERY_SELECT
        + """ JOIN injuries i ON r.injury_id = i.injury_id
              WHERE i.athlete_id = %s ORDER BY r.session_date""",
        (athlete_id,),
    )
    athlete["injuries"] = add_recovery_sessions(injuries, recovery_sessions)
    return athlete


@app.get("/api/workload")
def workload_analytics():
    """Workload records plus daily, per-sport and per-session-type totals."""
    records = run_query(WORKLOAD_SELECT + " ORDER BY ts.session_date, w.record_id")

    daily = run_query(
        """SELECT ts.session_date, COUNT(*) AS records,
                  SUM(w.session_load) AS total_load,
                  ROUND(AVG(w.rpe), 2) AS average_rpe
           FROM workload_records w
           JOIN training_sessions ts ON w.session_id = ts.session_id
           GROUP BY ts.session_date
           ORDER BY ts.session_date"""
    )

    # Average per record = total load / number of records (not an average of averages)
    by_sport = run_query(
        """SELECT sport_name, COUNT(*) AS athletes,
                  SUM(total_sessions) AS records,
                  SUM(total_workload) AS total_load,
                  ROUND(SUM(total_workload) / NULLIF(SUM(total_sessions), 0), 2) AS average_load
           FROM vw_athlete_workload_summary
           GROUP BY sport_name
           ORDER BY total_load DESC"""
    )

    by_session_type = run_query(
        """SELECT ts.session_type, COUNT(*) AS records,
                  SUM(w.session_load) AS total_load,
                  ROUND(AVG(w.session_load), 2) AS average_load,
                  ROUND(AVG(w.rpe), 2) AS average_rpe
           FROM workload_records w
           JOIN training_sessions ts ON w.session_id = ts.session_id
           GROUP BY ts.session_type
           ORDER BY total_load DESC"""
    )

    return {
        "records": records,
        "daily": daily,
        "by_sport": by_sport,
        "by_session_type": by_session_type,
    }


@app.get("/api/injuries")
def list_injuries():
    """All injuries, newest first, each with its recovery sessions."""
    injuries = run_query(INJURY_SELECT + " ORDER BY i.injury_date DESC")
    recovery_sessions = run_query(RECOVERY_SELECT + " ORDER BY r.session_date")
    return add_recovery_sessions(injuries, recovery_sessions)


@app.get("/api/alerts")
def list_alerts():
    """All workload alerts: unresolved first, then highest ACWR first."""
    return run_query(
        ALERT_SELECT + " ORDER BY w.is_resolved, w.acwr_value DESC, w.alert_date DESC"
    )
