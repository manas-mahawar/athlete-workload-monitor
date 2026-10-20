import { lazy, Suspense } from 'react'
import { Layout } from './components/Layout'
import { EmptyState, LoadingState } from './components/ui'
import { useRoute } from './lib/router'

const AlertsPage = lazy(() => import('./pages/AlertsPage').then((m) => ({ default: m.AlertsPage })))
const AthleteDetailPage = lazy(() => import('./pages/AthleteDetailPage').then((m) => ({ default: m.AthleteDetailPage })))
const AthletesPage = lazy(() => import('./pages/AthletesPage').then((m) => ({ default: m.AthletesPage })))
const InjuriesPage = lazy(() => import('./pages/InjuriesPage').then((m) => ({ default: m.InjuriesPage })))
const OverviewPage = lazy(() => import('./pages/OverviewPage').then((m) => ({ default: m.OverviewPage })))
const WorkloadPage = lazy(() => import('./pages/WorkloadPage').then((m) => ({ default: m.WorkloadPage })))

export default function App() {
  const route = useRoute()

  let page
  if (route.page === 'overview') page = <OverviewPage />
  else if (route.page === 'athletes') page = <AthletesPage />
  else if (route.page === 'athlete') page = <AthleteDetailPage key={route.id} id={route.id} />
  else if (route.page === 'workload') page = <WorkloadPage />
  else if (route.page === 'injuries') page = <InjuriesPage />
  else if (route.page === 'alerts') page = <AlertsPage />
  else page = <EmptyState title="Page not found" hint="Use the navigation to choose a page." />

  return (
    <Layout currentPage={route.page}>
      <Suspense fallback={<LoadingState />}>{page}</Suspense>
    </Layout>
  )
}
