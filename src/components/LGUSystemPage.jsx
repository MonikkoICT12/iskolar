import { useState, useEffect } from 'react'
import { ExternalLink, AlertCircle, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const LGUSystemPage = () => {
  const [showIframe, setShowIframe] = useState(true)
  const [iframeError, setIframeError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [logoError, setLogoError] = useState(false)
  const lguUrl = 'https://palayancity.golgu.ph/login'
  const logoPath = '/logo/iskolayan-square-light.png'

  useEffect(() => {
    if (showIframe) {
      setIsLoading(true)
      setIframeError(false)
      const loadingTimer = setTimeout(() => {
        setIsLoading(false)
      }, 15000)
      return () => clearTimeout(loadingTimer)
    }
  }, [showIframe])

  const openInNewTab = () => {
    window.open(lguUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between gap-4">
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
                  className="w-12 h-12 rounded-xl border-2 border-highlight shadow transition-transform group-hover:scale-105 object-cover bg-white"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl gradient-emerald-gold border-2 border-highlight/60 flex items-center justify-center shadow transition-transform group-hover:scale-105">
                  <Award className="w-6 h-6 text-white" />
                </div>
              )}
            </a>
            <div>
              <a
                href={lguUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-foreground hover:text-brand transition-colors flex items-center gap-1.5"
              >
                Palayan City LGU System
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-xs text-muted-foreground">
                Official Government System Portal
              </p>
            </div>
          </div>

          <Button variant="gradient" size="sm" onClick={openInNewTab}>
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Open Full Site</span>
          </Button>
        </CardContent>
      </Card>

      <Card
        className="overflow-hidden"
        style={{ minHeight: 'calc(100vh - 250px)' }}
      >
        <div className="gradient-emerald-gold px-6 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">System Preview</h2>
          <Button variant="gold" size="sm" onClick={openInNewTab}>
            <ExternalLink className="w-3.5 h-3.5" />
            Open Full Site
          </Button>
        </div>

        <div className="relative bg-muted/50">
          {!showIframe || iframeError ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/15 mb-4">
                <AlertCircle className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                External System Access
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                The Palayan City LGU System is an external secure portal. Click below to open it directly.
              </p>
              <Button variant="gradient" onClick={openInNewTab}>
                <ExternalLink className="w-4 h-4" />
                Open Palayan City LGU System
              </Button>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand border-t-highlight mb-3" />
                    <p className="text-sm text-brand">
                      Loading system preview...
                    </p>
                  </div>
                </div>
              )}
              <div style={{ height: '600px' }}>
                <iframe
                  src={lguUrl}
                  title="Palayan City LGU System Preview"
                  className="w-full h-full border-0"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    setIframeError(true)
                    setIsLoading(false)
                  }}
                  onLoad={() => setIsLoading(false)}
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

export default LGUSystemPage
