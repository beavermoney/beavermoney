import { createFileRoute, Link } from '@tanstack/react-router'
import { LoginForm } from '@/components/login-form'
import { Logo } from '@/components/logo'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-6 md:p-10">
      <div className="flex w-full max-w-xs flex-col items-center gap-6">
        <Link to="/" className="flex flex-col items-center gap-4 no-underline">
          <Logo size={96} className="rounded-xl" />
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-center text-xl font-semibold tracking-tight">
              Log your transactions.
              <br />
              Build your dam.
            </h1>
            <p className="text-muted-foreground text-center text-sm">
              Login with your Google account
            </p>
          </div>
        </Link>
        <LoginForm />
      </div>
    </div>
  )
}
