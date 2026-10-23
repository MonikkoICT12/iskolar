import { useState, useEffect } from 'react'
import { ExternalLink, AlertCircle, Award } from 'lucide-react'

const LGUSystemPage = () => {
  const [showIframe, setShowIframe] = useState(true) // Changed to true to show iframe by default
  const [iframeError, setIframeError] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Changed to true for loading state
  const [logoError, setLogoError] = useState(false)
  const lguUrl = 'https://palayancity.golgu.ph/login'
  const logoPath = '/palayan-logo.png' // Path relative to public folder

  useEffect(() => {
    if (showIframe) {
      setIsLoading(true)
      setIframeError(false)
      
      // Set a longer timeout - 15 seconds to allow iframe to load
      const loadingTimer = setTimeout(() => {
        setIsLoading(false)
        // Don't automatically set error - let the iframe load
      }, 15000)

      return () => clearTimeout(loadingTimer)
    }
  }, [showIframe])

  const handleIframeError = () => {
    setIframeError(true)
    setIsLoading(false)
  }

  const openInNewTab = () => {
    window.open(lguUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4">
      {/* Compact Header Card with Logo */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-row items-center justify-between gap-4">
          {/* Logo and Title - Compact */}
          <div className="flex items-center gap-3">
            <a
              href={lguUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex-shrink-0"
              title="Click to open Palayan City LGU System"
            >
              {!logoError ? (
                <img
                  src={logoPath}
                  alt="Palayan City LGU Logo"
                  className="w-14 h-14 rounded-lg border-2 border-amber-400 shadow group-hover:shadow-lg transition-all group-hover:scale-105 object-cover bg-white"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-lgu-navy to-lgu-blue border-2 border-amber-400 flex items-center justify-center shadow group-hover:shadow-lg transition-all group-hover:scale-105">
                  <Award className="w-7 h-7 text-amber-400" />
                </div>
              )}
            </a>
            <div>
              <a
                href={lguUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-lgu-navy hover:text-lgu-blue transition-colors flex items-center gap-2 group"
              >
                Palayan City LGU System
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <p className="text-xs text-slate-600">
                Official Government System Portal
              </p>
            </div>
          </div>

          {/* Open in New Tab Button - Compact */}
          <a
            href={lguUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-lgu-blue hover:bg-lgu-navy text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all shadow flex items-center gap-2 whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Open Full Site</span>
          </a>
        </div>
      </div>

      {/* Iframe Container - Full Height */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" style={{ minHeight: 'calc(100vh - 250px)' }}>
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-lgu-navy to-lgu-blue px-6 py-3 border-b-2 border-amber-400">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              System Preview
            </h2>
            <button
              onClick={openInNewTab}
              className="text-xs bg-amber-400 hover:bg-amber-300 text-lgu-navy font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3" />
              Open Full Site
            </button>
          </div>
        </div>

        {/* Iframe or Error Message */}
        <div className="relative bg-slate-50">
          {!showIframe || iframeError ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                External System Access
              </h3>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                The Palayan City LGU System is an external secure website. For security reasons, 
                it cannot be embedded in this preview. Click the button below to access the full system.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <button
                  onClick={openInNewTab}
                  className="inline-flex items-center gap-2 bg-lgu-blue hover:bg-lgu-navy text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open Palayan City LGU System
                </button>
                
                {!showIframe && !iframeError && (
                  <button
                    onClick={() => setShowIframe(true)}
                    className="inline-flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-lg transition-all"
                  >
                    Try Preview (May Not Work)
                  </button>
                )}
              </div>

              {iframeError && (
                <div className="text-xs text-slate-500 max-w-md mx-auto">
                  <p className="mb-2">
                    <span className="font-semibold">Why can't I see a preview?</span>
                  </p>
                  <p>
                    The external system has security settings (X-Frame-Options or CSP frame-ancestors) 
                    that prevent embedding for your protection. This is normal and expected for secure government websites.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-lgu-blue border-t-transparent mb-3"></div>
                    <p className="text-sm text-slate-600">Loading system preview...</p>
                  </div>
                </div>
              )}
              
              <div className="relative" style={{ height: '600px', overflow: 'auto' }}>
                <iframe
                  src={lguUrl}
                  title="Palayan City LGU System Preview"
                  className="w-full border-0"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    minHeight: '600px',
                    border: 'none'
                  }}
                  onError={handleIframeError}
                  onLoad={() => {
                    setIsLoading(false)
                    // Successfully loaded, don't check for cross-origin
                  }}
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              </div>
            </>
          )}
        </div>

        {/* Info Footer */}
        {showIframe && !iframeError && (
          <div className="px-6 py-2 bg-slate-50 border-t border-slate-200">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
              <AlertCircle className="w-3 h-3" />
              For full functionality, click "Open Full Site" button above
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LGUSystemPage
