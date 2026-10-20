import { useState } from 'react'
import { useApi } from '../api/client'
import type { AthleteListItem } from '../api/types'
import { Badge, Card, EmptyState, ErrorMessage, LoadingState, PageHeader, Select } from '../components/ui'
import { RISK_TONE, STATUS_TONE } from '../lib/colors'
import { ageOn, formatNumber, todayIso } from '../lib/format'
import { href } from '../lib/router'

export function AthletesPage() {
  const { data, error } = useApi<AthleteListItem[]>('/api/athletes')

  return (
    <>
      <PageHeader title="Athletes" subtitle={data ? `${data.length} athletes registered` : undefined} />
      {error ? <ErrorMessage message={error} /> : data ? <AthleteDirectory athletes={data} /> : <LoadingState />}
    </>
  )
}

function AthleteDirectory({ athletes }: { athletes: AthleteListItem[] }) {
  const [search, setSearch] = useState('')
  const [sport, setSport] = useState('all')
  const [status, setStatus] = useState('all')

  const sportNames = [...new Set(athletes.map((athlete) => athlete.sport_name))].sort()
  const searchText = search.trim().toLowerCase()

  const visibleAthletes = athletes.filter((athlete) => {
    if (sport !== 'all' && athlete.sport_name !== sport) return false
    if (status !== 'all' && athlete.status !== status) return false
    const searchable = `${athlete.athlete_name} ${athlete.coach_name} ${athlete.centre_name} ${athlete.home_state ?? ''}`
    return searchable.toLowerCase().includes(searchText)
  })

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, coach, centre or state"
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
          />
        </label>
        <Select
          label="Sport"
          value={sport}
          onChange={setSport}
          options={[{ value: 'all', label: 'All sports' }, ...sportNames.map((name) => ({ value: name, label: name }))]}
        />
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'Active', label: 'Active' },
            { value: 'Injured', label: 'Injured' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
        />
      </div>

      <Card>
        {visibleAthletes.length === 0 ? (
          <EmptyState title="No athletes match these filters" hint="Clear the search or change a filter." />
        ) : (
          // On narrow screens the table scrolls sideways instead of squeezing the columns
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="px-3 py-2 font-medium">Athlete</th>
                  <th className="px-3 py-2 font-medium">Sport</th>
                  <th className="px-3 py-2 font-medium">Coach / centre</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Sessions</th>
                  <th className="px-3 py-2 text-right font-medium">Total load</th>
                  <th className="px-3 py-2 font-medium">Latest alert</th>
                </tr>
              </thead>
              <tbody>
                {visibleAthletes.map((athlete) => (
                  <tr key={athlete.athlete_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <a href={href.athlete(athlete.athlete_id)} className="font-medium text-blue-700 hover:underline">
                        {athlete.athlete_name}
                      </a>
                      <div className="text-xs text-slate-500">
                        {athlete.gender} · {ageOn(athlete.date_of_birth, todayIso())} yrs · {athlete.home_state ?? '—'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {athlete.sport_name}
                      <div className="text-xs text-slate-500">{athlete.sport_type}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {athlete.coach_name}
                      <div className="text-xs text-slate-500">{athlete.centre_name}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <Badge tone={STATUS_TONE[athlete.status]}>{athlete.status}</Badge>
                      {athlete.open_injuries > 0 && (
                        <div className="mt-1 text-xs text-slate-500">
                          {athlete.open_injuries} open {athlete.open_injuries === 1 ? 'injury' : 'injuries'}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">{athlete.total_sessions}</td>
                    <td className="px-3 py-2.5 text-right">{formatNumber(athlete.total_workload)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <LatestAlert athlete={athlete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

function LatestAlert({ athlete }: { athlete: AthleteListItem }) {
  if (athlete.latest_acwr === null || athlete.latest_risk_level === null) {
    return <span className="text-xs text-slate-400">No alerts</span>
  }
  return (
    <span className="flex items-center gap-2">
      <span className="font-medium">ACWR {formatNumber(athlete.latest_acwr, 2)}</span>
      {athlete.latest_alert_resolved ? (
        <span className="text-xs text-slate-500">resolved</span>
      ) : (
        <Badge tone={RISK_TONE[athlete.latest_risk_level]}>{athlete.latest_risk_level} risk</Badge>
      )}
    </span>
  )
}
