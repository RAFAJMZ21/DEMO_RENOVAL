import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Captura global de errores JS no controlados para que un fallo aislado no
// deje la pantalla en negro sin información en consola.
window.addEventListener('error', (event) => {
  console.error('[GlobalError]', event.error ?? event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UnhandledRejection]', event.reason)
})

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  console.error('[Bootstrap] No se encontró el elemento #root en index.html')
}
