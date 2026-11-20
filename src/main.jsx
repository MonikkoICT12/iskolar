import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import App from './App.jsx'
import { initProductionInspectGuard } from './utils/prodGuard.js'
import './index.css'

initProductionInspectGuard()

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // Don't prevent default - let React Error Boundary handle it
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // Show a non-blocking notification
  const isDevelopment = import.meta.env.DEV
  if (isDevelopment) {
    console.warn('Promise rejection:', event.reason)
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
