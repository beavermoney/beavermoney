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
import { useBackNavigation } from './use-back-navigation'

afterEach(cleanup)
function Detail() {
  const goBack = useBackNavigation()
  return <button onClick={() => goBack({ to: '/' })}>Back</button>
}
function setup(entries: string[]) {
  const root = createRootRoute({ component: Outlet })
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <p>Fallback list</p>,
  })
  const origin = createRoute({
    getParentRoute: () => root,
    path: '/origin/$source',
    component: () => <p>Original page</p>,
  })
  const detail = createRoute({
    getParentRoute: () => root,
    path: '/detail',
    component: Detail,
  })
  const history = createMemoryHistory({ initialEntries: entries })
  const router = createRouter({
    routeTree: root.addChildren([home, origin, detail]),
    history,
  })
  render(<RouterProvider router={router} />)
  return { router, history }
}
it.each([
  'accounts',
  'investments',
  'categories',
  'subscriptions',
  'journal',
  'transactions',
])(
  'returns to the actual %s origin and preserves its filters',
  async (source) => {
    const original = `/origin/${source}?group=category&sort=value#selected`
    const { router, history } = setup([original, '/detail'])
    fireEvent.click(await screen.findByRole('button', { name: 'Back' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/origin/${source}`),
    )
    expect(router.state.location.search).toEqual({
      group: 'category',
      sort: 'value',
    })
    expect(router.state.location.hash).toBe('selected')
    expect(history.length).toBe(2)
    expect(history.location.state.__TSR_index).toBe(0)
    await act(async () => history.forward())
    await waitFor(() => expect(router.state.location.pathname).toBe('/detail'))
  },
)
it('uses a replacement fallback for directly opened pages without a back-loop', async () => {
  const { router, history } = setup(['/detail'])
  fireEvent.click(await screen.findByRole('button', { name: 'Back' }))
  await screen.findByText('Fallback list')
  expect(router.state.location.pathname).toBe('/')
  expect(history.length).toBe(1)
  expect(history.location.state.__TSR_index).toBe(0)
})
