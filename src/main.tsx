import React, { Component, ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Debug: log au démarrage
console.log('[Citadelle] main.tsx starting...')
console.log('[Citadelle] Location:', window.location.href)
console.log('[Citadelle] User Agent:', navigator.userAgent)
console.log('[Citadelle] Tauri available:', typeof (window as unknown as Record<string, unknown>).__TAURI__ !== 'undefined')
console.log('[Citadelle] Tauri IPC:', typeof (window as unknown as Record<string, unknown>).__TAURI_IPC__ !== 'undefined')
window.onerror = (msg, url, line, col, error) => {
  console.error('[Citadelle] Global error:', { msg, url, line, col, error })
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `<div style="padding:20px;font-family:system-ui;color:red;">
      <h2>Erreur JavaScript</h2>
      <pre>${msg}\n${url}:${line}:${col}\n${error?.stack || ''}</pre>
    </div>`
  }
  return false
}
console.log('[Citadelle] Error handler installed')

// Error Boundary pour capturer les erreurs de rendu
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          fontFamily: 'system-ui',
          backgroundColor: '#fff',
          color: '#1d1d1f',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#ff3b30' }}>Erreur de rendu</h1>
          <p>Une erreur s'est produite dans l'application :</p>
          <pre style={{
            padding: '12px',
            backgroundColor: '#f5f5f7',
            borderRadius: '8px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#007aff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Recharger l'application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

console.log('[Citadelle] About to mount React...')
const rootElement = document.getElementById('root')
console.log('[Citadelle] Root element:', rootElement)

if (rootElement) {
  try {
    console.log('[Citadelle] Creating React root...')
    const root = ReactDOM.createRoot(rootElement)
    console.log('[Citadelle] Rendering App...')
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    )
    console.log('[Citadelle] React render called successfully')
  } catch (e) {
    console.error('[Citadelle] Error during React mount:', e)
    rootElement.innerHTML = `<div style="padding:20px;color:red;"><h2>Erreur de montage</h2><pre>${e}</pre></div>`
  }
} else {
  console.error('[Citadelle] Root element not found!')
}
