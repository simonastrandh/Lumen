import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { migrateStorage } from './store/migrate'
import { SettingsProvider } from './store/SettingsStore'
import { WorkoutStoreProvider } from './store/WorkoutStore'
import './styles/tokens.css'
import './styles/global.css'

migrateStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SettingsProvider>
        <WorkoutStoreProvider>
          <App />
        </WorkoutStoreProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
