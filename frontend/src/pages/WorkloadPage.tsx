import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '../api/client'
import type { WorkloadAnalytics } from '../api/types'
import { Card, EmptyState, ErrorMessage, LoadingState, PageHeader, StatTile } from '../components/ui'
import { AXIS_COLOR, CHART_COLOR, GRID_COLOR } from '../lib/colors'
import { formatDate, formatNumber, formatShortDate } from '../lib/format'
import { href } from '../lib/router'

export function WorkloadPage() {
  const { data, error } = useApi<WorkloadAnalytics>('/api/workload')

  return (
    <>
      <PageHeader
        title="Workload analytics"
        subtitle="Session load = duration (minutes) × RPE, measured in arbitrary units (AU)"
      />
      {error ? <ErrorMessage message={error} /> : data ? <WorkloadContent workload={data} /> : <LoadingState />}
    </>
  )
}

function WorkloadContent({ workload }: { workload: WorkloadAnalytics }) {
  const { records } = workload
  if (records.length === 0) return <EmptyState title="No workload records yet" />

  let totalLoad = 0
  let totalMinutes = 0
  let totalRpe = 0
  for (const record of records) {
    totalLoad += record.session_load
    totalMinutes += record.duration_min
    totalRpe += record.rpe
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Workload records" value={records.length} detail={`${workload.daily.length} training days`} />
        <StatTile label="Total load" value={formatNumber(totalLoad)} detail="AU" />
        <StatTile label="Training time" value={formatNumber(totalMinutes)} detail="minutes" />
        <StatTile
          label="Average RPE"
          value={formatNumber(totalRpe / records.length, 2)}
          detail={`average load ${formatNumber(totalLoad / records.length, 2)} AU`}
        />
      </div>

      <Card className="mt-6" title="Daily squad training load" subtitle="Sum of session load per training day">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workload.daily}>
              <CartesianGrid vertical={false} stroke={GRID_COLOR} />
              <XAxis dataKey="session_date" tickFormatter={formatShortDate} stroke={AXIS_COLOR} fontSize={12} />
              <YAxis stroke={AXIS_COLOR} fontSize={12} width={48} />
              <Tooltip
                labelFormatter={(label) => formatDate(String(label))}
                formatter={(value) => [`${value} AU`, 'Total load']}
              />
              <Bar dataKey="total_load" fill={CHART_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Load by sport" subtitle="Total session load per sport">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload.by_sport} layout="vertical" margin={{ right: 40 }}>
                <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
                <XAxis type="number" stroke={AXIS_COLOR} fontSize={12} />
                <YAxis type="category" dataKey="sport_name" stroke={AXIS_COLOR} fontSize={12} width={80} />
                <Tooltip formatter={(value) => [`${value} AU`, 'Total load']} />
                <Bar
                  dataKey="total_load"
                  fill={CHART_COLOR}
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                  label={{ position: 'right', fontSize: 12, fill: AXIS_COLOR }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Average load by session type" subtitle="Mean session load of each type of session">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload.by_session_type}>
                <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="session_type" stroke={AXIS_COLOR} fontSize={12} />
                <YAxis stroke={AXIS_COLOR} fontSize={12} width={48} />
                <Tooltip formatter={(value) => [`${value} AU`, 'Average load']} />
                <Bar dataKey="average_load" fill={CHART_COLOR} radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6" title="Session log" subtitle={`All ${records.length} workload records`}>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium">Athlete</th>
                <th className="px-2 py-2 font-medium">Sport</th>
                <th className="px-2 py-2 font-medium">Type</th>
                <th className="px-2 py-2 text-right font-medium">Minutes</th>
                <th className="px-2 py-2 text-right font-medium">RPE</th>
                <th className="px-2 py-2 text-right font-medium">Load (AU)</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.record_id} className="border-b border-slate-100 last:border-0">
                  <td className="whitespace-nowrap px-2 py-2">{formatDate(record.session_date)}</td>
                  <td className="whitespace-nowrap px-2 py-2">
                    <a href={href.athlete(record.athlete_id)} className="text-blue-700 hover:underline">
                      {record.athlete_name}
                    </a>
                  </td>
                  <td className="px-2 py-2">{record.sport_name}</td>
                  <td className="px-2 py-2">{record.session_type}</td>
                  <td className="px-2 py-2 text-right">{record.duration_min}</td>
                  <td className="px-2 py-2 text-right">{record.rpe}</td>
                  <td className="px-2 py-2 text-right font-medium">{formatNumber(record.session_load)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
