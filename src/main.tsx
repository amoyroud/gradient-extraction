import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Router from './Router.tsx'
import MinimalApp from './MinimalApp.tsx'
import TransitionalApp from './TransitionalApp.tsx'
import './index.css'

console.log('main.tsx is executing')

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
            <p className="font-mono text-sm">{this.state.error?.toString()}</p>
          </div>
          <p className="mb-2">Please check the console for more details.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Fallback component that will render even if App fails
const FallbackApp: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gradient Extraction App</h1>
      <p className="mb-4">The application is loading...</p>
      <p className="text-sm text-gray-600">If nothing appears, there may be an issue with the application.</p>
    </div>
  )
}

try {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  
  // Use the Router component instead of App directly
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
    </React.StrictMode>
  )
  
  console.log('React app rendered')
} catch (error) {
  console.error('Failed to render React app:', error)
  
  // Render fallback if the main app completely fails
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = ''
    const fallbackRoot = ReactDOM.createRoot(rootElement)
    fallbackRoot.render(<FallbackApp />)
  }
} 