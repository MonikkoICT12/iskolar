import { Toaster as Sonner, toast } from 'sonner'
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react'

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <div className="w-8 h-8 rounded-lg bg-[#EEF4E3] border border-[#587529]/25 text-[#587529] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2.25} />
          </div>
        ),
        error: (
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" strokeWidth={2.25} />
          </div>
        ),
        warning: (
          <div className="w-8 h-8 rounded-lg bg-[#FEF5DC] border border-[#F4BE38]/45 text-[#9A6E00] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" strokeWidth={2.25} />
          </div>
        ),
        info: (
          <div className="w-8 h-8 rounded-lg bg-[#F4F5EC] border border-[#587529]/25 text-[#587529] flex items-center justify-center">
            <Info className="w-4 h-4" strokeWidth={2.25} />
          </div>
        ),
        loading: (
          <div className="w-8 h-8 rounded-lg bg-[#F4F5EC] border border-border text-[#587529] flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.25} />
          </div>
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast !rounded-2xl !border !border-border/90 !bg-white/95 backdrop-blur-xl !text-[#1A1A14] !shadow-[0_16px_40px_-10px_rgba(26,26,20,0.2),0_4px_14px_rgba(88,117,41,0.08)]',
          title: '!text-[13px] !font-semibold !leading-snug !text-[#1A1A14]',
          description: '!text-xs !text-[#6A6A5F]',
          actionButton:
            '!bg-[#587529] !text-white hover:!bg-[#4A6322] !font-semibold !rounded-lg !px-3 !h-7 !text-xs !transition-colors',
          cancelButton:
            '!bg-[#F2F4EA] !text-[#1A1A14] !rounded-lg !px-2.5 !h-7 !text-xs',
          closeButton: '!text-[#6A6A5F] hover:!text-[#1A1A14]',
          success:
            '!border-[#587529]/30 ![box-shadow:inset_3px_0_0_#587529,0_16px_40px_-10px_rgba(26,26,20,0.18)]',
          warning:
            '!border-[#F4BE38]/55 ![box-shadow:inset_3px_0_0_#F4BE38,0_16px_40px_-10px_rgba(26,26,20,0.18)]',
          error:
            '!border-red-200 ![box-shadow:inset_3px_0_0_#DC2626,0_16px_40px_-10px_rgba(26,26,20,0.18)]',
          info:
            '!border-[#71951E]/35 ![box-shadow:inset_3px_0_0_#71951E,0_16px_40px_-10px_rgba(26,26,20,0.18)]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
