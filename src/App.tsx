import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/Layout'
import Onboarding from './components/Onboarding'
import Planner from './pages/Planner'
import Tasks from './pages/Tasks'
import Journal from './pages/Journal'
import Rewards from './pages/Rewards'
import Settings from './pages/Settings'
import PlanningWizard from './pages/PlanningWizard'

function AppRoutes() {
  const { state } = useApp()

  if (!state.profile.name) {
    return <Onboarding />
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/plan" element={<PlanningWizard />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Planner />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
