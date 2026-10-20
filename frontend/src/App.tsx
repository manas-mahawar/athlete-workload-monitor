import { Layout } from './components/Layout'
import { EmptyState } from './components/ui'
import { useRoute } from './lib/router'
import { AlertsPage } from './pages/AlertsPage'
import { AthleteDetailPage } from './pages/AthleteDetailPage'
import { AthletesPage } from './pages/AthletesPage'
import { InjuriesPage } from './pages/InjuriesPage'
import { OverviewPage } from './pages/OverviewPage'
import { WorkloadPage } from './pages/WorkloadPage'

export default function App() {
  const route = useRoute()

  let page
  if (route.page === 'overview') page = <OverviewPage />
  else if (route.page === 'athletes') page = <AthletesPage />
  // key={route.id} gives each athlete a fresh component, so data from the
  // previously viewed athlete is never shown while the next one loads
  else if (route.page === 'athlete') page = <AthleteDetailPage key={route.id} id={route.id} />
  else if (route.page === 'workload') page = <WorkloadPage />
  else if (route.page === 'injuries') page = <InjuriesPage />
  else if (route.page === 'alerts') page = <AlertsPage />
  else page = <EmptyState title="Page not found" hint="Use the navigation to choose a page." />

  return <Layout currentPage={route.page}>{page}</Layout>
}
