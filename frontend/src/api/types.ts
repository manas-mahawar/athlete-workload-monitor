// Shapes of the JSON returned by backend/main.py.
// Dates arrive as "YYYY-MM-DD" strings. MySQL DECIMAL values arrive as numbers.
// Boolean columns (is_resolved, nis_certified) arrive as 0 or 1.

export type AthleteStatus = 'Active' | 'Inactive' | 'Injured'
export type RiskLevel = 'Low' | 'Moderate' | 'High'
export type Severity = 'Mild' | 'Moderate' | 'Severe'
export type SessionType = 'Practice' | 'Match' | 'Fitness' | 'Recovery'

/** One row of vw_athlete_workload_summary */
export interface WorkloadSummary {
  athlete_id: number
  athlete_name: string
  sport_name: string
  total_sessions: number
  total_workload: number
  average_workload: number | null
  highest_session_load: number | null
}

/** One row of vw_high_risk_alerts */
export interface HighRiskAlert {
  athlete_id: number
  athlete_name: string
  sport_name: string
  alert_date: string
  acwr_value: number
  risk_level: RiskLevel
  is_resolved: number
}

export interface Overview {
  athletes_by_status: Partial<Record<AthleteStatus, number>>
  alerts: { open_high: number; open_moderate: number; open_low: number; resolved: number }
  injuries: { total: number; open_injuries: number }
  workload: {
    records: number
    total_load: number
    average_load: number | null
    average_rpe: number | null
  }
  date_range: { first_session: string | null; last_session: string | null }
  high_risk_alerts: HighRiskAlert[]
  top_workloads: WorkloadSummary[]
}

export interface AthleteListItem {
  athlete_id: number
  athlete_name: string
  date_of_birth: string
  gender: 'Male' | 'Female' | 'Other'
  home_state: string | null
  status: AthleteStatus
  sport_name: string
  sport_type: 'Team' | 'Individual'
  coach_name: string
  centre_name: string
  total_sessions: number
  total_workload: number
  latest_acwr: number | null
  latest_risk_level: RiskLevel | null
  latest_alert_resolved: number | null
  open_injuries: number
}

export interface Alert {
  alert_id: number
  athlete_id: number
  athlete_name: string
  sport_name: string
  alert_date: string
  acwr_value: number
  risk_level: RiskLevel
  is_resolved: number
  acwr_low: number
  acwr_high: number
}

export interface WorkloadRecord {
  record_id: number
  athlete_id: number
  athlete_name: string
  sport_name: string
  duration_min: number
  rpe: number
  session_load: number
  session_id: number
  session_date: string
  session_type: SessionType
  venue: string | null
}

export interface RecoverySession {
  recovery_id: number
  injury_id: number
  session_date: string
  therapy_type: string
  pain_level: number
}

export interface Injury {
  injury_id: number
  athlete_id: number
  athlete_name: string
  sport_name: string
  injury_date: string
  body_part: string
  severity: Severity
  return_date: string | null
  notes: string | null
  recovery_sessions: RecoverySession[]
}

export interface AthleteDetail {
  athlete_id: number
  athlete_name: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'Male' | 'Female' | 'Other'
  home_state: string | null
  status: AthleteStatus
  sport_name: string
  sport_type: 'Team' | 'Individual'
  acwr_low: number
  acwr_high: number
  coach_name: string
  nis_certified: number
  centre_name: string
  centre_type: string
  summary: WorkloadSummary | null
  workload_records: WorkloadRecord[]
  alerts: Alert[]
  injuries: Injury[]
}

export interface WorkloadAnalytics {
  records: WorkloadRecord[]
  daily: { session_date: string; records: number; total_load: number; average_rpe: number }[]
  by_sport: {
    sport_name: string
    athletes: number
    records: number
    total_load: number
    average_load: number | null
  }[]
  by_session_type: {
    session_type: SessionType
    records: number
    total_load: number
    average_load: number
    average_rpe: number
  }[]
}
