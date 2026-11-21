import { X } from 'lucide-react'
import AdminLoginForm from './AdminLoginForm'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const AdminLoginDialog = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        overlayClassName="bg-[#0D1307]/45 backdrop-blur-md"
        className="w-[min(420px,calc(100%-2rem))] max-w-[420px] p-0 overflow-hidden rounded-[28px] border border-white/25 bg-[#16200D]/72 backdrop-blur-2xl backdrop-saturate-150 text-white shadow-[0_32px_90px_rgba(8,12,5,0.55)] ring-1 ring-inset ring-white/20 gap-0"
      >
        {/* Top Specular Hairline & Soft Olive-Gold Ambient Reflections */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-14 -top-14 w-52 h-52 rounded-full bg-[#71951E]/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#F4BE38]/15 blur-3xl"
        />

        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close login modal"
            className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/75 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogClose>

        <div className="relative z-10 px-6 sm:px-8 pt-8 pb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/95 p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.28)] ring-1 ring-white/60 mb-3.5 flex items-center justify-center">
              <img
                src="/logo/iskolayan-square-light.png"
                alt="IskoLayan Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <DialogHeader className="space-y-1 text-center items-center">
              <DialogTitle className="text-white text-xl font-extrabold tracking-tight text-center">
                IskoLayan Admin Login
              </DialogTitle>
              <DialogDescription className="text-white/70 text-xs text-center">
                Palayan City Scholarship Management System
              </DialogDescription>
            </DialogHeader>
          </div>

          <AdminLoginForm
            idPrefix="modal-login"
            variant="glass"
            onSuccess={() => onOpenChange(false)}
          />

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-white/55">
            <img
              src="/logo/ict-logo.png"
              alt="Palayan City ICT Division"
              className="w-4 h-4 rounded-sm object-contain bg-white/90 p-0.5"
            />
            <span>Palayan City ICT Division · Protected Session</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AdminLoginDialog
