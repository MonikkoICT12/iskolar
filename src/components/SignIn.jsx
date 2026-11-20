import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import AdminLoginForm from './AdminLoginForm'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const SignIn = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-frosted-canvas min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="w-72 h-72 rounded-full bg-brand/20 blur-3xl absolute -top-12 -left-12 pointer-events-none animate-float-slow" />
      <div className="w-72 h-72 rounded-full bg-highlight/25 blur-3xl absolute -bottom-12 -right-12 pointer-events-none animate-float-slow" />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img
              src="/logo/iskolayan-square-light.png"
              alt="IskoLayan Logo"
              className="w-24 h-24 rounded-3xl object-contain shadow-xl shadow-[#587529]/20"
            />
          </div>
          <Badge variant="gold" className="mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Portal
          </Badge>
          <h1 className="text-2xl font-extrabold text-foreground">
            IskoLayan Admin Login
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Palayan City Scholarship Management System
          </p>
        </div>

        <Card className="p-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sign in to continue</CardTitle>
            <CardDescription>
              Use your authorized LGU Supabase administrator credentials.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <AdminLoginForm idPrefix="page-login" />

            <div className="mt-5 text-center">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Public Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SignIn
