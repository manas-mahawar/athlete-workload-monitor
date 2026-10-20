import type { AthleteStatus, RiskLevel, Severity } from '../api/types'

// Recharts draws SVG, so it needs real colour values rather than Tailwind
// classes. These hex codes are the matching Tailwind colours.
export const CHART_COLOR = '#2563eb' // blue-600
export const GRID_COLOR = '#e2e8f0' // slate-200
export const AXIS_COLOR = '#64748b' // slate-500
export const SAFE_RANGE_COLOR = '#16a34a' // green-600

export const RISK_COLORS: Record<RiskLevel, string> = {
  Low: '#16a34a', // green-600
  Moderate: '#f59e0b', // amber-500
  High: '#dc2626', // red-600
}

// Badge tones, so a risk level or status always gets the same colour
export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'gray'

export const RISK_TONE: Record<RiskLevel, Tone> = { Low: 'green', Moderate: 'amber', High: 'red' }
export const SEVERITY_TONE: Record<Severity, Tone> = { Mild: 'gray', Moderate: 'amber', Severe: 'red' }
export const STATUS_TONE: Record<AthleteStatus, Tone> = { Active: 'green', Injured: 'red', Inactive: 'gray' }
