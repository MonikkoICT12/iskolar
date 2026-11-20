import { Toaster } from '@/components/ui/sonner'

const Toast = () => {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      visibleToasts={4}
      gap={10}
    />
  )
}

export default Toast
