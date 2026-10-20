import type { Injury } from '../api/types'
import { SEVERITY_TONE } from '../lib/colors'
import { daysBetween, formatDate } from '../lib/format'
import { href } from '../lib/router'
import { Badge } from './ui'

/** One injury with its recovery sessions. Used on the Injuries page and the athlete page. */
export function InjuryCard({ injury, showAthlete = true }: { injury: Injury; showAthlete?: boolean }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">
            {injury.body_part}
            {showAthlete && (
              <>
                {' · '}
                <a href={href.athlete(injury.athlete_id)} className="hover:text-blue-600">
                  {injury.athlete_name}
                </a>
              </>
            )}
          </h3>
          <p className="text-xs text-slate-500">
            {showAthlete && `${injury.sport_name} · `}Injured {formatDate(injury.injury_date)}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Badge tone={SEVERITY_TONE[injury.severity]}>{injury.severity}</Badge>
          {injury.return_date ? <Badge tone="green">Returned</Badge> : <Badge tone="red">Open</Badge>}
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-600">
        {injury.return_date
          ? `Returned ${formatDate(injury.return_date)} after ${daysBetween(injury.injury_date, injury.return_date)} days.`
          : 'No return date recorded yet.'}
        {injury.notes && ` Notes: ${injury.notes}`}
      </p>

      <h4 className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
        Recovery sessions ({injury.recovery_sessions.length})
      </h4>
      {injury.recovery_sessions.length === 0 ? (
        <p className="py-3 text-sm text-slate-500">No recovery sessions recorded.</p>
      ) : (
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Therapy</th>
              <th className="py-2 text-right font-medium">Pain (0–10)</th>
            </tr>
          </thead>
          <tbody>
            {injury.recovery_sessions.map((session) => (
              <tr key={session.recovery_id} className="border-b border-slate-100 last:border-0">
                <td className="py-2">{formatDate(session.session_date)}</td>
                <td className="py-2">{session.therapy_type}</td>
                <td className="py-2 text-right">{session.pain_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  )
}
