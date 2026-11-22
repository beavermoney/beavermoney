import { expect, it } from 'vitest'
import { presentedLocation } from './presented-location'
it('retains the visible page layout and history entry while the URL loads', () => {
  const old = { pathname: '/transactions', state: { key: 'old' } }
  const next = { pathname: '/accounts', state: { key: 'new' } }
  expect(
    presentedLocation({
      location: next,
      resolvedLocation: old,
      isLoading: true,
    }),
  ).toBe(old)
  expect(
    presentedLocation({
      location: next,
      resolvedLocation: old,
      isLoading: false,
    }),
  ).toBe(next)
  expect(presentedLocation({ location: next, isLoading: true })).toBe(next)
})
