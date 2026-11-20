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
        className="w-[min(400px,calc(100%-2rem))] max-w-[400px] sm:min-h-[400px] p-0 overflow-hidden border-0 gap-0 flex flex-col"
      >
        <div className="gradient-emerald-gold px-6 py-5 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-yellow-300/20 blur-xl pointer-events-none" />
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close login modal"
              className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-white/85 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogClose>
          <div className="relative flex items-center gap-3.5 pr-8">
            <img
              src="/logo/iskolayan-square-light.png"
              alt="IskoLayan Logo"
              className="w-14 h-14 rounded-2xl object-contain flex-shrink-0 shadow-md"
            />
            <div>
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="text-white text-lg">
                  IskoLayan Admin Login
                </DialogTitle>
                <DialogDescription className="text-white/90 text-xs">
                  Palayan City Scholarship Management System
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-center">
          <AdminLoginForm
            idPrefix="modal-login"
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AdminLoginDialog
