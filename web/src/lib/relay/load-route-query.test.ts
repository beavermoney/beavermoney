import { expect, it, vi } from 'vitest'
import { loadRouteQuery } from './load-route-query'
import type { IEnvironment, GraphQLTaggedNode } from 'relay-runtime'
const { loadQuery } = vi.hoisted(() => ({ loadQuery: vi.fn() }))
vi.mock('react-relay', () => ({ loadQuery }))
const environment = {} as IEnvironment
const query = {} as GraphQLTaggedNode

it('does not publish the route reference until its network data arrives', async () => {
  let resolve!: () => void
  const response = new Promise<void>((done) => {
    resolve = done
  })
  const reference = { source: { toPromise: () => response }, dispose: vi.fn() }
  loadQuery.mockReturnValue(reference)
  let ready = false
  const pending = loadRouteQuery(environment, query, {}).then((result) => {
    ready = true
    return result
  })
  await Promise.resolve()
  expect(ready).toBe(false)
  resolve()
  expect(await pending).toBe(reference)
  expect(reference.dispose).not.toHaveBeenCalled()
})

it('returns cached references without a network wait', async () => {
  const reference = { source: null, dispose: vi.fn() }
  loadQuery.mockReturnValue(reference)
  expect(await loadRouteQuery(environment, query, {})).toBe(reference)
})

it('disposes a failed preload and propagates the error to the route boundary', async () => {
  const error = new Error('offline')
  const reference = {
    source: { toPromise: () => Promise.reject(error) },
    dispose: vi.fn(),
  }
  loadQuery.mockReturnValue(reference)
  await expect(loadRouteQuery(environment, query, {})).rejects.toBe(error)
  expect(reference.dispose).toHaveBeenCalledOnce()
})
