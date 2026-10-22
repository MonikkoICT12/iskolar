import { useState, useEffect } from 'react'
import { ExternalLink, AlertCircle, Award } from 'lucide-react'

const LGUSystemPage = () => {
  const [iframeError, setIframeError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [logoError, setLogoError] = useState(false)
  const lguUrl = 'https://palayancity.golgu.ph/login'
  const logoPath = '/palayan-logo.png' // Path relative to public folder

  useEffect(() => {
    // Reset states when component mounts
    setIframeError(false)
    setIsLoading(true)

    // Set a timeout to stop loading indicator
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(loadingTimer)
  }, [])

  const handleIframeError = () => {
    setIframeError(true)
    setIsLoading(false)
  }

  const openInNewTab = () => {
    window.open(lguUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header Card with Logo */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
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
                  className="w-20 h-20 rounded-xl border-4 border-amber-400 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105 object-cover bg-white"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-lgu-navy to-lgu-blue border-4 border-amber-400 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                  <Award className="w-10 h-10 text-amber-400" />
                </div>
              )}
            </a>
            <div>
              <a
                href={lguUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-lgu-navy hover:text-lgu-blue transition-colors flex items-center gap-2 group"
              >
                Palayan City LGU System
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <p className="text-sm text-slate-600 mt-1">
                Official Government System Portal
              </p>
            </div>
          </div>

          {/* Open in New Tab Button */}
          <button
            onClick={openInNewTab}
            className="bg-lgu-blue hover:bg-lgu-navy text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all shadow flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Full Site
          </button>
        </div>

        {/* Logo Placement Instructions */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">Note:</span> To use the official Palayan City LGU logo, 
            place the logo image file at: <code className="bg-blue-100 px-1 py-0.5 rounded">public/palayan-logo.png</code>
          </p>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-lgu-navy to-lgu-blue px-6 py-4 border-b-4 border-amber-400">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            System Preview
            <span className="text-xs font-normal text-slate-300">(Top Navigation Only)</span>
          </h2>
        </div>

        {/* Iframe or Error Message */}
        <div className="relative bg-slate-50">
          {isLoading && !iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-lgu-blue border-t-transparent mb-3"></div>
                <p className="text-sm text-slate-600">Loading system preview...</p>
              </div>
            </div>
          )}

          {!iframeError ? (
            <div className="relative" style={{ height: '250px', overflow: 'hidden' }}>
              <iframe
                src={lguUrl}
                title="Palayan City LGU System Preview"
                className="w-full border-0"
                style={{ 
                  width: '100%', 
                  height: '800px', // Tall enough to capture full page
                  border: 'none',
                  transform: 'scale(1)',
                  transformOrigin: 'top left'
                }}
                onError={handleIframeError}
                onLoad={() => setIsLoading(false)}
                sandbox="allow-same-origin allow-scripts"
              />
              {/* Overlay to prevent interaction with iframe */}
              <div className="absolute inset-0 bg-transparent pointer-events-none"></div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Preview Not Available
              </h3>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                The external system cannot be embedded due to security restrictions (X-Frame-Options or CSP frame-ancestors). 
                This is a normal security feature to protect the official website.
              </p>
              <button
                onClick={openInNewTab}
                className="inline-flex items-center gap-2 bg-lgu-blue hover:bg-lgu-navy text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="w-5 h-5" />
                Open Palayan City LGU System
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        {!iframeError && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              This preview shows only the top portion of the external system. Click "Open Full Site" for complete access.
            </p>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">About This Integration</h3>
        <ul className="text-xs text-slate-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>This page provides quick access to the official Palayan City LGU System</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>The preview shows the top navigation area for reference</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>For full functionality, click the logo or "Open Full Site" button</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>All external links open in a new tab for security</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default LGUSystemPage
