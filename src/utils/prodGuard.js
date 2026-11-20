/**
 * Restricts common DevTools / Inspect shortcuts and context menu in production builds.
 * No-ops completely during local development (import.meta.env.DEV).
 */
export function initProductionInspectGuard() {
  if (!import.meta.env.PROD || typeof window === 'undefined') {
    return
  }

  document.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault()
    },
    { capture: true }
  )

  document.addEventListener(
    'keydown',
    (e) => {
      const key = (e.key || '').toUpperCase()

      // F12
      if (key === 'F12' || e.keyCode === 123) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      // Ctrl+Shift+I / J / C / K (Inspect, Console, Element Picker)
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      // macOS Cmd+Option+I / J / C / U
      if (e.metaKey && e.altKey && ['I', 'J', 'C', 'U'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      // Ctrl+U / Cmd+U (View Page Source)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && key === 'U') {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    { capture: true }
  )
}
