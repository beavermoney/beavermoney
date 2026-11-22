// @vitest-environment jsdom
import '@/test/browser-setup'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { NetWorthChart } from './net-worth-chart'

const state = vi.hoisted(() => ({ privacy: false, requestedCount: 0 }))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }))
vi.mock('@/environment', () => ({ environment: {} }))
vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { id: '1', locale: 'en-CA' } }),
}))
vi.mock('@/hooks/use-display-currency', () => ({
  useDisplayCurrency: () => ({ displayCurrencyCode: 'CAD' }),
}))
vi.mock('@/hooks/use-household-view-scope', () => ({
  useHouseholdViewScope: () => ({ viewUserIds: null }),
}))
vi.mock('@/hooks/use-privacy-mode', () => ({
  usePrivacyMode: () => ({ isPrivacyModeEnabled: state.privacy }),
}))
vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatCurrencyWithPrivacyMode: () => (state.privacy ? '•••' : '$10'),
  }),
}))
vi.mock('react-relay', () => ({
  graphql: () => ({}),
  useSubscribeToInvalidationState: () => {},
  useLazyLoadQuery: (_query: unknown, variables: { count: number }) => {
    state.requestedCount = variables.count
    return {
      household: {
        snapshots: {
          pageInfo: { hasPreviousPage: variables.count === 500 },
          edges: [10, 20].map((value, index) => ({
            node: {
              id: String(index),
              createTime: new Date(
                Date.now() - (1 - index) * 86400000,
              ).toISOString(),
              review: {
                version: 2,
                complete: true,
                rates: [],
                accounts: [
                  {
                    id: '1',
                    icon: null,
                    name: 'Property',
                    type: 'property',
                    category: null,
                    ownerId: '1',
                    ownerName: 'Owner',
                    currency: 'CAD',
                    cash: String(value),
                    value: String(value),
                    holdings: [],
                  },
                ],
              },
            },
          })),
        },
      },
    }
  },
}))
vi.mock('@/components/horizontal-chip-rail', () => ({
  HorizontalChipRail: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
}))
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <svg>{children}</svg>
  ),
  Area: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

afterEach(() => {
  cleanup()
  state.privacy = false
})
function mountChart() {
  const root = createRootRoute({ component: Outlet })
  const chart = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: NetWorthChart,
  })
  const detail = createRoute({
    getParentRoute: () => root,
    path: '/detail',
    component: () => <p>Detail</p>,
  })
  const history = createMemoryHistory({ initialEntries: ['/'] })
  const router = createRouter({
    routeTree: root.addChildren([chart, detail]),
    history,
  })
  render(<RouterProvider router={router} />)
  return { router, history }
}

it('offers property history and restores series, duration, and loaded pages after Back', async () => {
  const { router, history } = mountChart()
  fireEvent.click(await screen.findByRole('button', { name: 'Property' }))
  fireEvent.click(screen.getByRole('button', { name: 'Net Worth' }))
  fireEvent.click(screen.getByRole('button', { name: 'All' }))
  fireEvent.click(screen.getByRole('button', { name: 'Load older reviews' }))
  await waitFor(() => expect(state.requestedCount).toBe(1000))
  await act(async () => {
    await router.navigate({ href: '/detail' })
  })
  await screen.findByText('Detail')
  await act(async () => {
    history.back()
  })
  await screen.findByRole('button', { name: 'Property' })
  expect(state.requestedCount).toBe(1000)
  expect(
    screen.queryByRole('button', { name: 'Load older reviews' }),
  ).toBeNull()
  expect(
    screen
      .getByRole('button', { name: 'Property' })
      .getAttribute('data-variant'),
  ).toBe('primary')
  expect(
    screen
      .getByRole('button', { name: 'Net Worth' })
      .getAttribute('data-variant'),
  ).toBe('secondary')
  expect(
    screen.getByRole('button', { name: 'All' }).getAttribute('data-variant'),
  ).toBe('primary')
})

it('does not reveal the change direction when financial values are hidden', async () => {
  state.privacy = true
  mountChart()
  await screen.findByRole('button', { name: 'Property' })
  expect(screen.getByText('••• (•••)')).toBeTruthy()
  expect(screen.queryByText('+••• (•••)')).toBeNull()
})
