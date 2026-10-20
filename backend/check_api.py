"""
Start the API first, then run:
    python check_api.py                         (checks http://127.0.0.1:8000)
    python check_api.py http://localhost:8000   (or any other base URL)
"""
import json
import sys
import urllib.error
import urllib.request

BASE_URL = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://127.0.0.1:8000"
ALLOWED_ORIGIN = "http://localhost:5173"

failures = []

def get(path, origin=None):
    """Return (status code, parsed JSON body, response headers) for a GET request."""
    request = urllib.request.Request(BASE_URL + path)
    if origin:
        request.add_header("Origin", origin)
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return response.status, json.loads(response.read()), response.headers
    except urllib.error.HTTPError as error:
        # 4xx/5xx responses still have a JSON body ({"detail": ...})
        return error.code, json.loads(error.read()), error.headers

def check(description, passed):
    print(("PASS  " if passed else "FAIL  ") + description)
    if not passed:
        failures.append(description)

def main():
    try:
        get("/health")
    except urllib.error.URLError:
        print(f"Cannot reach {BASE_URL}. Is uvicorn running?")
        sys.exit(1)

    for path in ["/health", "/api/db-check", "/api/overview", "/api/athletes",
                 "/api/workload", "/api/injuries", "/api/alerts"]:
        status, _, _ = get(path)
        check(f"GET {path} returns 200", status == 200)

    _, db_check, _ = get("/api/db-check")
    counts = db_check["row_counts"]
    check("db-check reports all 9 tables", len(counts) == 9)

    _, athletes, _ = get("/api/athletes")
    check("athlete list has one row per athletes-table row", len(athletes) == counts["athletes"])
    for athlete in athletes:
        status, _, _ = get(f"/api/athletes/{athlete['athlete_id']}")
        check(f"GET /api/athletes/{athlete['athlete_id']} returns 200", status == 200)

    status, body, _ = get("/api/athletes/999999")
    check("unknown athlete returns 404 with a message", status == 404 and "detail" in body)

    _, workload, _ = get("/api/workload")
    _, overview, _ = get("/api/overview")
    record_total = sum(record["session_load"] for record in workload["records"])
    check("workload records match the workload_records table", len(workload["records"]) == counts["workload_records"])
    check("overview total load equals the sum of session loads", overview["workload"]["total_load"] == record_total)
    check("daily totals add up to the same total load", sum(day["total_load"] for day in workload["daily"]) == record_total)
    check("every record's session_load equals duration_min x rpe",
          all(r["session_load"] == r["duration_min"] * r["rpe"] for r in workload["records"]))

    _, alerts, _ = get("/api/alerts")
    alert_counts = overview["alerts"]
    check("alert list matches the workload_alerts table", len(alerts) == counts["workload_alerts"])
    check("overview alert counts add up to all alerts",
          sum(alert_counts.values()) == counts["workload_alerts"])

    _, injuries, _ = get("/api/injuries")
    recovery_total = sum(len(injury["recovery_sessions"]) for injury in injuries)
    check("injury list matches the injuries table", len(injuries) == counts["injuries"])
    check("every recovery session is attached to an injury", recovery_total == counts["recovery_sessions"])

    _, _, headers = get("/api/alerts", origin=ALLOWED_ORIGIN)
    check("CORS allows the Vite dev server", headers.get("access-control-allow-origin") == ALLOWED_ORIGIN)
    _, _, headers = get("/api/alerts", origin="http://example.com")
    check("CORS does not allow other websites", headers.get("access-control-allow-origin") is None)

    print()
    if failures:
        print(f"{len(failures)} check(s) failed.")
        sys.exit(1)
    print("All checks passed.")

if __name__ == "__main__":
    main()
