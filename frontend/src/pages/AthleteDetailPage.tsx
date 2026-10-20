import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '../api/client'
import type { Alert, AthleteDetail } from '../api/types'
import { InjuryCard } from '../components/InjuryCard'
import { Badge, Card, EmptyState, ErrorMessage, LoadingState, StatTile } from '../components/ui'
import { AXIS_COLOR, CHART_COLOR, GRID_COLOR, RISK_TONE, STATUS_TONE } from '../lib/colors'
import { acwrZone, ageOn, formatDate, formatNumber, formatShortDate, todayIso } from '../lib/format'
import { href } from '../lib/router'

export function AthleteDetailPage({ id }: { id: number }) {
  const { data, error } = useApi<AthleteDetail>(`/api/athletes/${id}`)

  return (
    <>
      <a href={href.athletes} className="mb-4 inline-block text-sm font-medium text-blue-600 hover:underline">
        ← All athletes
      </a>
      {error ? <ErrorMessage message={error} /> : data ? <AthleteProfile athlete={data} /> : <LoadingState />}
    </>
  )
}

function AthleteProfile({ athlete }: { athlete: AthleteDetail }) {
  const summary = athlete.summary

  return (
    <>
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">{athlete.athlete_name}</h1>
          <Badge tone={STATUS_TONE[athlete.status]}>{athlete.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {athlete.sport_name} ({athlete.sport_type}) · {athlete.gender} · {ageOn(athlete.date_of_birth, todayIso())}{' '}
          yrs · born {formatDate(athlete.date_of_birth)}
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-500">Coach</dt>
            <dd className="font-medium">
              {athlete.coach_name}
              {athlete.nis_certified ? ' (NIS certified)' : ''}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Training centre</dt>
            <dd className="font-medium">
              {athlete.centre_name} ({athlete.centre_type})
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Home state</dt>
            <dd className="font-medium">{athlete.home_state ?? '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Sessions logged" value={summary?.total_sessions ?? 0} />
        <StatTile label="Total load" value={formatNumber(summary?.total_workload ?? 0)} detail="AU" />
        <StatTile label="Average load" value={formatNumber(summary?.average_workload, 2)} detail="AU per session" />
        <StatTile label="Peak session" value={formatNumber(summary?.highest_session_load)} detail="AU" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3" title="Training sessions" subtitle="Session load = duration (min) × RPE">
          {athlete.workload_records.length === 0 ? (
            <EmptyState title="No sessions recorded for this athlete" />
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={athlete.workload_records}>
                    <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                    <XAxis dataKey="session_date" tickFormatter={formatShortDate} stroke={AXIS_COLOR} fontSize={12} />
                    <YAxis stroke={AXIS_COLOR} fontSize={12} width={44} />
                    <Tooltip
                      labelFormatter={(label) => formatDate(String(label))}
                      formatter={(value) => [`${value} AU`, 'Session load']}
                    />
                    <Bar dataKey="session_load" fill={CHART_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                      <th className="px-2 py-2 font-medium">Date</th>
                      <th className="px-2 py-2 font-medium">Type</th>
                      <th className="px-2 py-2 text-right font-medium">Minutes</th>
                      <th className="px-2 py-2 text-right font-medium">RPE</th>
                      <th className="px-2 py-2 text-right font-medium">Load (AU)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {athlete.workload_records.map((record) => (
                      <tr key={record.record_id} className="border-b border-slate-100 last:border-0">
                        <td className="whitespace-nowrap px-2 py-2">{formatDate(record.session_date)}</td>
                        <td className="px-2 py-2">{record.session_type}</td>
                        <td className="px-2 py-2 text-right">{record.duration_min}</td>
                        <td className="px-2 py-2 text-right">{record.rpe}</td>
                        <td className="px-2 py-2 text-right font-medium">{formatNumber(record.session_load)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>

        <Card className="lg:col-span-2" title="Workload alerts">
          {athlete.alerts.length === 0 ? (
            <EmptyState title="No workload alerts for this athlete" />
          ) : (
            <ul className="divide-y divide-slate-200">
              {athlete.alerts.map((alert) => (
                <AlertRow key={alert.alert_id} alert={alert} />
              ))}
            </ul>
          )}
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Injuries & recovery</h2>
      {athlete.injuries.length === 0 ? (
        <EmptyState title="No injuries recorded for this athlete" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {athlete.injuries.map((injury) => (
            <InjuryCard key={injury.injury_id} injury={injury} showAthlete={false} />
          ))}
        </div>
      )}
    </>
  )
}

function AlertRow({ alert }: { alert: Alert }) {
  const zone = acwrZone(alert.acwr_value, alert.acwr_low, alert.acwr_high)
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-slate-600">{formatDate(alert.alert_date)}</span>
        <span className="flex gap-1.5">
          <Badge tone={RISK_TONE[alert.risk_level]}>{alert.risk_level} risk</Badge>
          {alert.is_resolved ? <Badge tone="gray">Resolved</Badge> : <Badge tone="blue">Open</Badge>}
        </span>
      </div>
      <p className="mt-1 text-sm">
        <span className="font-semibold">ACWR {formatNumber(alert.acwr_value, 2)}</span>
        <span className="text-slate-500">
          {' '}
          · {zone} the safe range {formatNumber(alert.acwr_low, 2)}–{formatNumber(alert.acwr_high, 2)}
        </span>
      </p>
    </li>
  )
}
