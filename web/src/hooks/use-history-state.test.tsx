// @vitest-environment jsdom
import '@/test/browser-setup'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { useHistoryState } from './use-history-state'
import {
  getHistoryViewKey,
  preserveHistoryViewKey,
} from '@/lib/history-view-key'
import { HistoryCollapsible } from '@/components/history-collapsible'

afterEach(cleanup)
function List() {
  const [search, setSearch] = useHistoryState('search', '')
  return (
    <>
      <input
        aria-label="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <HistoryCollapsible historyId="liquidity" trigger="Liquidity">
        <p>Cash accounts</p>
      </HistoryCollapsible>
      <HistoryCollapsible historyId="investments" trigger="Investments">
        <p>Holdings</p>
      </HistoryCollapsible>
    </>
  )
}
it('restores folds and search independently for Back and Forward entries', async () => {
  const root = createRootRoute({ component: Outlet })
  const list = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: List,
  })
  const detail = createRoute({
    getParentRoute: () => root,
    path: '/detail',
    component: () => <p>Detail</p>,
  })
  const history = createMemoryHistory({ initialEntries: ['/'] })
  const router = createRouter({
    routeTree: root.addChildren([list, detail]),
    history,
  })
  render(<RouterProvider router={router} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Liquidity' }))
  fireEvent.change(screen.getByLabelText('Search'), {
    target: { value: 'Savings' },
  })
  expect(
    screen
      .getByRole('button', { name: 'Liquidity' })
      .getAttribute('aria-expanded'),
  ).toBe('false')
  await act(async () => {
    await router.navigate({ href: '/detail' })
  })
  await screen.findByText('Detail')
  await act(async () => history.back())
  await waitFor(() =>
    expect(screen.getByLabelText<HTMLInputElement>('Search').value).toBe(
      'Savings',
    ),
  )
  expect(
    screen
      .getByRole('button', { name: 'Liquidity' })
      .getAttribute('aria-expanded'),
  ).toBe('false')
  expect(
    screen
      .getByRole('button', { name: 'Investments' })
      .getAttribute('aria-expanded'),
  ).toBe('true')
  // A fresh visit to the same URL gets its own presentation state.
  await act(async () => {
    await router.navigate({ href: '/detail' })
    await router.navigate({ to: '/' })
  })
  await waitFor(() =>
    expect(screen.getByLabelText<HTMLInputElement>('Search').value).toBe(''),
  )
  expect(
    screen
      .getByRole('button', { name: 'Liquidity' })
      .getAttribute('aria-expanded'),
  ).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: 'Investments' }))
  await act(async () => history.back())
  await screen.findByText('Detail')
  await act(async () => history.forward())
  await waitFor(() =>
    expect(
      screen
        .getByRole('button', { name: 'Investments' })
        .getAttribute('aria-expanded'),
    ).toBe('false'),
  )
})

it('keeps folds, loaded state, and scroll identity through palette replacements', async () => {
  const root = createRootRoute({ component: Outlet })
  const list = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: (search: Record<string, unknown>) => ({
      command_open: search.command_open === true,
    }),
    component: List,
  })
  const detail = createRoute({
    getParentRoute: () => root,
    path: '/detail',
    component: () => <p>Detail</p>,
  })
  const history = createMemoryHistory({ initialEntries: ['/'] })
  const router = createRouter({
    routeTree: root.addChildren([list, detail]),
    history,
    getScrollRestorationKey: getHistoryViewKey,
  })
  render(<RouterProvider router={router} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Liquidity' }))
  fireEvent.change(screen.getByLabelText('Search'), {
    target: { value: 'Savings' },
  })
  const originalKey = getHistoryViewKey(router.state.location)
  const originalRouterKey = router.state.location.state.__TSR_key
  for (const open of [true, false, true, false]) {
    await act(async () => {
      await router.navigate({
        to: '/',
        search: { command_open: open },
        replace: true,
        state: preserveHistoryViewKey,
        resetScroll: false,
      })
    })
    expect(router.state.location.state.__TSR_key).not.toBe(originalRouterKey)
    expect(getHistoryViewKey(router.state.location)).toBe(originalKey)
    expect(screen.getByLabelText<HTMLInputElement>('Search').value).toBe(
      'Savings',
    )
    expect(
      screen
        .getByRole('button', { name: 'Liquidity' })
        .getAttribute('aria-expanded'),
    ).toBe('false')
  }
  // Selecting a command opens a fresh detail, then Back restores its origin.
  await act(async () => {
    await router.navigate({ href: '/detail' })
  })
  await screen.findByText('Detail')
  expect(getHistoryViewKey(router.state.location)).not.toBe(originalKey)
  await act(async () => history.back())
  await waitFor(() =>
    expect(screen.getByLabelText<HTMLInputElement>('Search').value).toBe(
      'Savings',
    ),
  )
  expect(getHistoryViewKey(router.state.location)).toBe(originalKey)
  expect(
    screen
      .getByRole('button', { name: 'Liquidity' })
      .getAttribute('aria-expanded'),
  ).toBe('false')
})
