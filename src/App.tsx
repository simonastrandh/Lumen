import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import Home from './screens/home/Home'
import NotFound from './screens/NotFound'
import ActiveWorkout from './screens/active/ActiveWorkout'
import Workouts from './screens/workouts/Workouts'
import WorkoutEditor from './screens/workouts/WorkoutEditor'
import Settings from './screens/settings/Settings'
import Statistics from './screens/statistics/Statistics'
import WorkoutOverview from './screens/workouts/WorkoutOverview'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="pass" element={<Workouts />} />
        <Route path="pass/aktivt/:id" element={<ActiveWorkout />} />
        <Route path="pass/ny" element={<WorkoutEditor />} />
        <Route path="pass/:id/redigera" element={<WorkoutEditor />} />
        <Route path="pass/:id" element={<WorkoutOverview />} />
        <Route path="statistik" element={<Statistics />} />
        <Route path="installningar" element={<Settings />} />
        <Route path="profil" element={<Navigate to="/installningar" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
