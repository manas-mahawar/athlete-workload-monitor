import type { ReactNode } from 'react'
import { href, type Route } from '../lib/router'

const NAV_LINKS: { label: string; href: string; pages: Route['page'][] }[] = [
  { label: 'Overview', href: href.overview, pages: ['overview'] },
  { label: 'Athletes', href: href.athletes, pages: ['athletes', 'athlete'] },
  { label: 'Workload', href: href.workload, pages: ['workload'] },
  { label: 'Injuries & recovery', href: href.injuries, pages: ['injuries'] },
  { label: 'Alerts', href: href.alerts, pages: ['alerts'] },
]

export function Layout({ currentPage, children }: { currentPage: Route['page']; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Sidebar on large screens; a top bar with wrapping links on small screens */}
      <aside className="bg-slate-900 p-4 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0">
        <div className="text-sm font-semibold text-white">Athlete Workload Monitor</div>
        <nav className="mt-3 flex flex-wrap gap-1 lg:mt-8 lg:flex-col">
          {NAV_LINKS.map((link) => {
            const isActive = link.pages.includes(currentPage)
            return (
              <a
                key={link.label}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
