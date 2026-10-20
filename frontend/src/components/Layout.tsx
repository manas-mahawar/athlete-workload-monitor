
import type { ReactNode } from 'react'
import { href, type Route } from '../lib/router'

const NAV_LINKS: {
  label: string
  href: string
  pages: Route['page'][]
  marker: string
}[] = [
  { label: 'Overview', href: href.overview, pages: ['overview'], marker: '▦' },
  { label: 'Athletes', href: href.athletes, pages: ['athletes', 'athlete'], marker: '◎' },
  { label: 'Workload', href: href.workload, pages: ['workload'], marker: '↗' },
  { label: 'Injuries & recovery', href: href.injuries, pages: ['injuries'], marker: '+' },
  { label: 'Alerts', href: href.alerts, pages: ['alerts'], marker: '!' },
]

export function Layout({
  currentPage,
  children,
}: {
  currentPage: Route['page']
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:flex">
      <aside className="border-b border-slate-800 bg-slate-950 p-4 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <a
          href={href.overview}
          className="flex items-center gap-3 rounded-xl px-2 py-3"
          aria-label="Athlete Workload Monitor home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-lg font-bold text-slate-950">
            A
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold tracking-tight text-white">
              Athlete Workload
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">
              Monitoring system
            </span>
          </span>
        </a>

        <div className="mt-5 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 lg:block">
          Workspace
        </div>

        <nav
          aria-label="Main navigation"
          className="mt-3 flex flex-wrap gap-1 lg:flex-col"
        >
          {NAV_LINKS.map((link) => {
            const isActive = link.pages.includes(currentPage)

            return (
              <a
                key={link.label}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                  isActive
                    ? 'bg-emerald-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-base ${
                    isActive
                      ? 'bg-slate-950/10'
                      : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                  }`}
                  aria-hidden="true"
                >
                  {link.marker}
                </span>
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className="mt-6 hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:mt-auto lg:block">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Monitoring workspace
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Workload, recovery, and athlete status in one place.
          </p>
        </div>

        <div className="hidden px-3 pb-1 pt-4 text-[11px] text-slate-600 lg:block">
          Athlete Workload Monitor · Demo
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Performance workspace
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Athlete insights · Training load · Recovery
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Demo environment
            </span>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
