import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SettingsProvider } from './settings'
import { ToastProvider } from './ui/Toast'
import { TooltipProvider } from './ui/Tooltip'
import './styles.css'
import './workspace.css'
import './design/tailwind.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Missing #root element')
}

createRoot(container).render(
  <StrictMode>
    <TooltipProvider>
      <SettingsProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </SettingsProvider>
    </TooltipProvider>
  </StrictMode>,
)
