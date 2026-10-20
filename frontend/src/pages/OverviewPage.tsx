import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '../api/client'
import type { Overview } from '../api/types'
import { Badge, Card, EmptyState, ErrorMessage, LoadingState, PageHeader, StatTile } from '../components/ui'
import { AXIS_COLOR, CHART_COLOR, GRID_COLOR } from '../lib/colors'
import { formatDate, formatNumber } from '../lib/format'
import { href } from '../lib/router'

export function OverviewPage() {
  const { data, error } = useApi<Overview>('/api/overview')

  return (
    <>
      <PageHeader title="Overview" subtitle={data ? describeDateRange(data) : undefined} />
      {error ? <ErrorMessage message={error} /> : data ? <OverviewContent overview={data} /> : <LoadingState />}
    </>
  )
}

function describeDateRange(overview: Overview) {
  const { first_session, last_session } = overview.date_range
  if (!first_session) return 'No training sessions recorded yet'
  return `Training data from ${formatDate(first_session)} to ${formatDate(last_session)}`
}

function OverviewContent({ overview }: { overview: Overview }) {
  const { athletes_by_status: athletes, alerts, injuries, workload } = overview
  const active = athletes.Active ?? 0
  const injured = athletes.Injured ?? 0
  const inactive = athletes.Inactive ?? 0
  const openAlerts = alerts.open_high + alerts.open_moderate + alerts.open_low

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Athletes"
          value={active + injured + inactive}
          detail={`${active} active Â· ${injured} injured Â· ${inactive} inactive`}
        />
        <StatTile
          label="Open alerts"
          value={openAlerts}
          detail={`${alerts.open_high} high Â· ${alerts.open_moderate} moderate Â· ${alerts.open_low} low`}
        />
        <StatTile
          label="Open injuries"
          value={injuries.open_injuries}
          detail={`${injuries.total} injuries recorded`}
        />
        <StatTile
          label="Total training load"
          value={formatNumber(workload.total_load)}
          detail={`AU across ${workload.records} records Â· avg RPE ${formatNumber(workload.average_rpe, 2)}`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card
          className="lg:col-span-3"
          title="Highest cumulative workload"
          subtitle="Top 5 athletes by total session load (vw_athlete_workload_summary)"
        >
          {overview.top_workloads.length === 0 ? (
            <EmptyState title="No workload records yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.top_workloads} layout="vertical" margin={{ right: 40 }}>
                  <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
                  <XAxis type="number" stroke={AXIS_COLOR} fontSize={12} />
                  <YAxis type="category" dataKey="athlete_name" stroke={AXIS_COLOR} fontSize={12} width={110} />
                  <Tooltip formatter={(value) => [`${value} AU`, 'Total load']} />
                  <Bar
                    dataKey="total_workload"
                    fill={CHART_COLOR}
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={false}
                    label={{ position: 'right', fontSize: 12, fill: AXIS_COLOR }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card
          className="lg:col-span-2"
          title="Unresolved high-risk alerts"
          subtitle="From vw_high_risk_alerts, highest ACWR first"
          actions={
            <a href={href.alerts} className="text-xs font-medium text-emerald-700 hover:underline">
              All alerts â†’
            </a>
          }
        >
          {overview.high_risk_alerts.length === 0 ? (
            <EmptyState title="No unresolved high-risk alerts" />
          ) : (
            <ul className="divide-y divide-slate-200">
              {overview.high_risk_alerts.map((alert) => (
                <li key={`${alert.athlete_id}-${alert.alert_date}`} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <a href={href.athlete(alert.athlete_id)} className="text-sm font-medium text-slate-900 hover:text-emerald-700">
                      {alert.athlete_name}
                    </a>
                    <div className="text-xs text-slate-500">
                      {alert.sport_name} Â· {formatDate(alert.alert_date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{formatNumber(alert.acwr_value, 2)}</div>
                    <Badge tone="red">High risk</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
