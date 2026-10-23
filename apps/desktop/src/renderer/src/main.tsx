import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SettingsProvider } from './settings'
import './styles.css'
import './workspace.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Missing #root element')
}

createRoot(container).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
)
