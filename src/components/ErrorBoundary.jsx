import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV

      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: '#F5F5F7' }}
        >
          <div
            className="max-w-lg w-full p-8 rounded-2xl shadow-lg text-center"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5EA' }}
          >
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: '#EF4444' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1D1D1F' }}>
              Something went wrong
            </h1>

            <p className="mb-6" style={{ color: '#AAAAAA' }}>
              We encountered an unexpected error. Please try reloading the page.
            </p>

            {isDevelopment && this.state.error && (
              <div
                className="mb-6 p-4 rounded-lg text-left overflow-auto max-h-40"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}
              >
                <p className="text-xs font-mono text-red-600 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs font-mono text-red-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-2 rounded-lg font-semibold text-white transition-all"
                style={{ backgroundColor: '#007AFF' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0051D5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007AFF')}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-2 rounded-lg font-semibold transition-all"
                style={{ color: '#007AFF', border: '1px solid #E5E5EA' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F7')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
