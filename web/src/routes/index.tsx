import { createFileRoute, Link } from '@tanstack/react-router'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <main className="flex flex-col items-center gap-12 text-center">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center gap-6">
          <Logo size={200} className="rounded-xl" />
          <div className="flex flex-col gap-3">
            <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
              Beaver Money
            </h1>
            <p className="text-muted-foreground max-w-md text-lg">
              Log your transactions. Build your dam.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <Link to="/login">
          <Button size="lg">Get Started</Button>
        </Link>
      </main>

      {/* Footer */}
      <footer className="text-muted-foreground absolute bottom-6 text-xs">
        <p>
          &copy; {new Date().getFullYear()} Beaver Money. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
