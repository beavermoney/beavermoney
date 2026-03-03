import { createFileRoute, Link } from '@tanstack/react-router'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import {
  GithubIcon,
  CoinsIcon,
  ReceiptTextIcon,
  TrendingUpIcon,
  BarChartIcon,
  CodeIcon,
  UsersIcon,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="border-border bg-card hover:bg-muted/50 flex flex-col items-center gap-3 rounded-lg border p-6 text-center transition-colors">
      <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-md">
        {icon}
      </div>
      <h3 className="text-foreground font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

function App() {
  return (
    <div className="bg-background flex min-h-svh flex-col px-6 py-12">
      <main className="flex flex-1 flex-col items-center justify-center gap-12 text-center">
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

        {/* Features */}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<UsersIcon />}
            title="Household Management"
            description="Track finances together with multiple people in one household"
          />
          <FeatureCard
            icon={<ReceiptTextIcon />}
            title="Transaction Logging"
            description="Log income, expenses, transfers, and investments effortlessly"
          />
          <FeatureCard
            icon={<TrendingUpIcon />}
            title="Investment Tracking"
            description="Monitor your portfolio with stocks and crypto support"
          />
          <FeatureCard
            icon={<CoinsIcon />}
            title="Multi-Currency"
            description="Track finances in multiple currencies with automatic conversion"
          />
          <FeatureCard
            icon={<BarChartIcon />}
            title="Financial Insights"
            description="Get clear reports and visualizations of your money flow"
          />
          <FeatureCard
            icon={<CodeIcon />}
            title="Open Source"
            description="Fully open source and self-hostable for complete control"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 flex flex-col items-center gap-4">
        {/* Social Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/beavermoney"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon className="size-5" />
          </a>
          <a
            href="https://discord.gg/V6yDJrrJ6h"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Discord"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} Beaver Money. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
