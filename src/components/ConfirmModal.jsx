import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  scholarName,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger', // danger, warning, success, info
}) => {
  const typeStyles = {
    danger: {
      iconBg: 'bg-red-100 text-red-600 border-red-200',
      title: 'text-red-950',
      actionVariant: 'destructive',
    },
    warning: {
      iconBg: 'bg-highlight/25 text-foreground border-highlight/50',
      title: 'text-foreground',
      actionVariant: 'gold',
    },
    success: {
      iconBg: 'bg-brand/15 text-brand border-border',
      title: 'text-foreground',
      actionVariant: 'gradient',
    },
    info: {
      iconBg: 'bg-brand/15 text-brand border-border',
      title: 'text-foreground',
      actionVariant: 'default',
    },
  }

  const style = typeStyles[type] || typeStyles.danger

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0',
                style.iconBg
              )}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className={style.title}>
                {title}
              </AlertDialogTitle>
              {scholarName && (
                <p className="text-sm font-semibold text-foreground">
                  {scholarName}
                </p>
              )}
              <AlertDialogDescription className="text-muted-foreground">
                {message}
              </AlertDialogDescription>
              <p className="text-xs font-semibold text-foreground/80 pt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={cn(buttonVariants({ variant: style.actionVariant }))}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmModal
