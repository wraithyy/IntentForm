import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <div>
      <h1>IntentForm Playground</h1>
      <p>Coming soon — Phase 2</p>
    </div>
  </StrictMode>
)
