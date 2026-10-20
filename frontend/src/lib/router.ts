import { useEffect, useState } from 'react'

// Hash-based routing: the page is chosen from the part of the URL after "#",
// e.g. http://localhost:5173/#/athletes/4. Changing the hash never reloads the
// page; the browser fires a "hashchange" event instead.

export type Route =
  | { page: 'overview' }
  | { page: 'athletes' }
  | { page: 'athlete'; id: number }
  | { page: 'workload' }
  | { page: 'injuries' }
  | { page: 'alerts' }
  | { page: 'not-found' }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  if (path === '/') return { page: 'overview' }
  if (path === '/athletes') return { page: 'athletes' }
  // Matches "/athletes/" followed by digits; the digits are the athlete id
  const athleteMatch = path.match(/^\/athletes\/(\d+)$/)
  if (athleteMatch) return { page: 'athlete', id: Number(athleteMatch[1]) }
  if (path === '/workload') return { page: 'workload' }
  if (path === '/injuries') return { page: 'injuries' }
  if (path === '/alerts') return { page: 'alerts' }
  return { page: 'not-found' }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const href = {
  overview: '#/',
  athletes: '#/athletes',
  athlete: (id: number) => `#/athletes/${id}`,
  workload: '#/workload',
  injuries: '#/injuries',
  alerts: '#/alerts',
}
