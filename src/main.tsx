import React, { Component, ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

window.onerror = (msg, url, line, col, error) => {
  const root = document.getElementById('root')
  if (root) {
    const container = document.createElement('div')
    container.style.cssText = 'padding:20px;font-family:system-ui;color:red;'
    const title = document.createElement('h2')
    title.textContent = 'Erreur JavaScript'
    const pre = document.createElement('pre')
    pre.textContent = `${msg}\n${url}:${line}:${col}\n${error?.stack || ''}`
    container.appendChild(title)
    container.appendChild(pre)
    root.innerHTML = ''
    root.appendChild(container)
  }
  return false
}

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

const rootElement = document.getElementById('root')

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    )
  } catch (e) {
    const errDiv = document.createElement('div')
    errDiv.style.cssText = 'padding:20px;color:red;'
    const errTitle = document.createElement('h2')
    errTitle.textContent = 'Erreur de montage'
    const errPre = document.createElement('pre')
    errPre.textContent = String(e)
    errDiv.appendChild(errTitle)
    errDiv.appendChild(errPre)
    rootElement.innerHTML = ''
    rootElement.appendChild(errDiv)
  }
} else {
  console.error('[Citadelle] Root element not found!')
}
