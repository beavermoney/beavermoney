import { Logo } from '@/components/logo'
import { Button } from '@astryxdesign/core/Button'
import { Grid } from '@astryxdesign/core/Grid'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { createFileRoute, Link } from '@tanstack/react-router'

import {
  BarChartIcon,
  CodeIcon,
  CoinsIcon,
  ReceiptTextIcon,
  TrendingUpIcon,
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
    <Stack direction="vertical" gap={3} align="center" className="text-center">
      <Stack direction="horizontal" align="center" justify="center">
        {icon}
      </Stack>
      <Heading level={3}>{title}</Heading>
      <Text as="p" display="block" color="secondary">
        {description}
      </Text>
    </Stack>
  )
}

function App() {
  return (
    <Stack direction="vertical" className="app-safe-area app-scroll-content">
      <Stack direction="vertical" gap={10} padding={6}>
        <Stack as="main" direction="vertical" gap={10}>
          {/* Logo and Branding */}
          <Stack direction="vertical" gap={6} align="center">
            <Logo size={200} />
            <Stack
              direction="vertical"
              gap={3}
              align="center"
              className="text-center"
            >
              <Heading level={1}>Beaver Money</Heading>
              <Text as="p" display="block" color="secondary">
                Log your transactions. Build your dam.
              </Text>
            </Stack>
          </Stack>

          {/* Call to Action */}
          <Stack direction="horizontal" justify="center">
            <Link to="/login">
              <Button label={'Get Started'} variant={'primary'}>
                Get Started
              </Button>
            </Link>
          </Stack>

          {/* Features */}
          <Grid columns={{ minWidth: 240, max: 3, repeat: 'fit' }} gap={4}>
            <FeatureCard
              icon={<AstryxIcon icon={UsersIcon} />}
              title="Household Management"
              description="Track finances together with multiple people in one household"
            />
            <FeatureCard
              icon={<AstryxIcon icon={ReceiptTextIcon} />}
              title="Transaction Logging"
              description="Log income, expenses, transfers, and investments effortlessly"
            />
            <FeatureCard
              icon={<AstryxIcon icon={TrendingUpIcon} />}
              title="Investment Tracking"
              description="Monitor your portfolio with stocks and crypto support"
            />
            <FeatureCard
              icon={<AstryxIcon icon={CoinsIcon} />}
              title="Multi-Currency"
              description="Track finances in multiple currencies with automatic conversion"
            />
            <FeatureCard
              icon={<AstryxIcon icon={BarChartIcon} />}
              title="Financial Insights"
              description="Get clear reports and visualizations of your money flow"
            />
            <FeatureCard
              icon={<AstryxIcon icon={CodeIcon} />}
              title="Open Source"
              description="Fully open source and self-hostable for complete control"
            />
          </Grid>
        </Stack>

        {/* Footer */}
        <Stack
          direction="horizontal"
          gap={3}
          align="center"
          wrap="wrap"
          as="footer"
          justify="center"
        >
          {/* Social Links */}
          <Stack direction="horizontal" gap={4} align="center">
            <a
              href="https://github.com/beavermoney"
              target="_blank"
              rel="noopener noreferrer"

              aria-label="GitHub"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
            </a>
            <a
              href="https://discord.gg/V6yDJrrJ6h"
              target="_blank"
              rel="noopener noreferrer"

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
          </Stack>

          {/* Copyright */}
          <Text as="p" display="block" color="secondary">
            &copy; {new Date().getFullYear()} Beaver Money. All rights reserved.
          </Text>
        </Stack>
      </Stack>
    </Stack>
  )
}
