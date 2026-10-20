import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '../api/client'
import type { Alert, RiskLevel } from '../api/types'
import { Badge, Card, EmptyState, ErrorMessage, LoadingState, PageHeader, Select, StatTile } from '../components/ui'
import { AXIS_COLOR, GRID_COLOR, RISK_COLORS, RISK_TONE, SAFE_RANGE_COLOR } from '../lib/colors'
import { acwrZone, formatDate, formatNumber } from '../lib/format'
import { href } from '../lib/router'

const RISK_LEVELS: RiskLevel[] = ['High', 'Moderate', 'Low']

export function AlertsPage() {
  const { data, error } = useApi<Alert[]>('/api/alerts')

  return (
    <>
      <PageHeader
        title="Workload alerts"
        subtitle="Acute:chronic workload ratio (ACWR) alerts, as stored in the workload_alerts table"
      />
      {error ? <ErrorMessage message={error} /> : data ? <AlertList alerts={data} /> : <LoadingState />}
    </>
  )
}

function AlertList({ alerts }: { alerts: Alert[] }) {
  const [statusFilter, setStatusFilter] = useState('open')
  const [riskFilter, setRiskFilter] = useState('all')

  const openAlerts = alerts.filter((alert) => !alert.is_resolved)
  const openHigh = openAlerts.filter((alert) => alert.risk_level === 'High').length
  const openModerate = openAlerts.filter((alert) => alert.risk_level === 'Moderate').length
  const openOutsideRange = openAlerts.filter(
    (alert) => acwrZone(alert.acwr_value, alert.acwr_low, alert.acwr_high) !== 'within',
  ).length

  const visibleAlerts = alerts.filter((alert) => {
    if (statusFilter === 'open' && alert.is_resolved) return false
    if (statusFilter === 'resolved' && !alert.is_resolved) return false
    if (riskFilter !== 'all' && alert.risk_level !== riskFilter) return false
    return true
  })

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Open · high risk" value={openHigh} />
        <StatTile label="Open · moderate risk" value={openModerate} />
        <StatTile label="Open · outside safe range" value={openOutsideRange} detail={`of ${openAlerts.length} open alerts`} />
        <StatTile label="Resolved" value={alerts.length - openAlerts.length} detail={`of ${alerts.length} alerts`} />
      </div>

      <div className="my-6 flex flex-wrap gap-3">
        <Select
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'all', label: 'All' },
          ]}
        />
        <Select
          label="Risk level"
          value={riskFilter}
          onChange={setRiskFilter}
          options={[{ value: 'all', label: 'All levels' }, ...RISK_LEVELS.map((level) => ({ value: level, label: level }))]}
        />
      </div>

      {visibleAlerts.length === 0 ? (
        <EmptyState title="No alerts match these filters" />
      ) : (
        <>
          <Card title="ACWR by athlete" subtitle="Bar colour shows the recorded risk level; the green band is the safe range">
            <AcwrChart alerts={visibleAlerts} />
          </Card>
          <Card className="mt-6" title="Alert details">
            <AlertTable alerts={visibleAlerts} />
          </Card>
        </>
      )}
    </>
  )
}

function AcwrChart({ alerts }: { alerts: Alert[] }) {
  // Every sport currently uses 0.80–1.30, but the band is only drawn when all
  // shown alerts really share one range, so the chart never shows a wrong band
  const { acwr_low, acwr_high } = alerts[0]
  const sameRange = alerts.every((alert) => alert.acwr_low === acwr_low && alert.acwr_high === acwr_high)

  return (
    <>
      <div className="mb-2 flex flex-wrap gap-4 text-xs text-slate-600">
        {RISK_LEVELS.map((level) => (
          <span key={level} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: RISK_COLORS[level] }} />
            {level} risk
          </span>
        ))}
        {sameRange && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-green-100" />
            Safe range {formatNumber(acwr_low, 2)}–{formatNumber(acwr_high, 2)}
          </span>
        )}
      </div>
      <div style={{ height: alerts.length * 40 + 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={alerts} layout="vertical" margin={{ right: 40 }}>
            <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
            {sameRange && <ReferenceArea x1={acwr_low} x2={acwr_high} fill={SAFE_RANGE_COLOR} fillOpacity={0.12} />}
            <XAxis type="number" domain={[0, 2]} stroke={AXIS_COLOR} fontSize={12} />
            <YAxis type="category" dataKey="athlete_name" stroke={AXIS_COLOR} fontSize={12} width={120} />
            <Tooltip formatter={(value) => [value, 'ACWR']} />
            <Bar
              dataKey="acwr_value"
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
              isAnimationActive={false}
              label={{ position: 'right', fontSize: 12, fill: AXIS_COLOR }}
            >
              {/* One Cell per bar lets each bar take its own risk colour */}
              {alerts.map((alert) => (
                <Cell key={alert.alert_id} fill={RISK_COLORS[alert.risk_level]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

function AlertTable({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <th className="px-2 py-2 font-medium">Athlete</th>
            <th className="px-2 py-2 font-medium">Sport</th>
            <th className="px-2 py-2 font-medium">Date</th>
            <th className="px-2 py-2 text-right font-medium">ACWR</th>
            <th className="px-2 py-2 font-medium">Safe range</th>
            <th className="px-2 py-2 font-medium">Risk</th>
            <th className="px-2 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.alert_id} className="border-b border-slate-100 last:border-0">
              <td className="whitespace-nowrap px-2 py-2">
                <a href={href.athlete(alert.athlete_id)} className="text-blue-700 hover:underline">
                  {alert.athlete_name}
                </a>
              </td>
              <td className="px-2 py-2">{alert.sport_name}</td>
              <td className="whitespace-nowrap px-2 py-2">{formatDate(alert.alert_date)}</td>
              <td className="px-2 py-2 text-right font-medium">{formatNumber(alert.acwr_value, 2)}</td>
              <td className="whitespace-nowrap px-2 py-2 text-slate-600">
                {formatNumber(alert.acwr_low, 2)}–{formatNumber(alert.acwr_high, 2)} ({acwrZone(alert.acwr_value, alert.acwr_low, alert.acwr_high)})
              </td>
              <td className="px-2 py-2">
                <Badge tone={RISK_TONE[alert.risk_level]}>{alert.risk_level}</Badge>
              </td>
              <td className="px-2 py-2">
                {alert.is_resolved ? <Badge tone="gray">Resolved</Badge> : <Badge tone="blue">Open</Badge>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
