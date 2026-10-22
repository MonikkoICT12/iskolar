import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import useScholarStore from '../store/scholarStore'

const Toast = () => {
  const { toast } = useScholarStore()

  if (!toast) return null

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  }

  const styles = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div
        className={`${
          styles[toast.type]
        } px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px] max-w-md`}
      >
        {icons[toast.type]}
        <span className="font-medium text-sm">{toast.message}</span>
      </div>
    </div>
  )
}

export default Toast
