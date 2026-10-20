import { useState } from 'react'
import { useApi } from '../api/client'
import type { Injury } from '../api/types'
import { InjuryCard } from '../components/InjuryCard'
import { EmptyState, ErrorMessage, LoadingState, PageHeader, Select, StatTile } from '../components/ui'
import { daysBetween, formatNumber } from '../lib/format'

export function InjuriesPage() {
  const { data, error } = useApi<Injury[]>('/api/injuries')

  return (
    <>
      <PageHeader
        title="Injuries & recovery"
        subtitle="Injury records with their recovery sessions and reported pain levels"
      />
      {error ? <ErrorMessage message={error} /> : data ? <InjuryList injuries={data} /> : <LoadingState />}
    </>
  )
}

function InjuryList({ injuries }: { injuries: Injury[] }) {
  const [filter, setFilter] = useState('all')

  // An injury is "open" until a return date is recorded
  const openInjuries = injuries.filter((injury) => injury.return_date === null)
  const returnedInjuries = injuries.filter((injury) => injury.return_date !== null)

  let totalDaysOut = 0
  for (const injury of returnedInjuries) {
    if (injury.return_date) totalDaysOut += daysBetween(injury.injury_date, injury.return_date)
  }
  const averageDaysOut = returnedInjuries.length > 0 ? totalDaysOut / returnedInjuries.length : null

  let recoverySessionCount = 0
  for (const injury of injuries) recoverySessionCount += injury.recovery_sessions.length

  let visibleInjuries = injuries
  if (filter === 'open') visibleInjuries = openInjuries
  if (filter === 'returned') visibleInjuries = returnedInjuries

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Injuries recorded" value={injuries.length} />
        <StatTile label="Open injuries" value={openInjuries.length} detail="no return date yet" />
        <StatTile
          label="Average time to return"
          value={averageDaysOut === null ? '—' : formatNumber(averageDaysOut, 2)}
          detail={`days, across ${returnedInjuries.length} returned`}
        />
        <StatTile label="Recovery sessions" value={recoverySessionCount} />
      </div>

      <div className="my-6 w-48">
        <Select
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `All injuries (${injuries.length})` },
            { value: 'open', label: `Open (${openInjuries.length})` },
            { value: 'returned', label: `Returned (${returnedInjuries.length})` },
          ]}
        />
      </div>

      {visibleInjuries.length === 0 ? (
        <EmptyState title="No injuries in this category" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {visibleInjuries.map((injury) => (
            <InjuryCard key={injury.injury_id} injury={injury} />
          ))}
        </div>
      )}
    </>
  )
}
