// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { notifyError, subscribeToErrors } from './notifications'
import { handleHouseholdError } from './auth'
import { LOCAL_STORAGE_HOUSEHOLD_ID_KEY } from '@/constant'
afterEach(() => localStorage.clear())
it('delivers queued errors once and stops delivery after unsubscribe', () => {
  notifyError('before mount')
  const listener = vi.fn()
  const stop = subscribeToErrors(listener)
  expect(listener).toHaveBeenCalledExactlyOnceWith('before mount')
  notifyError('live')
  expect(listener).toHaveBeenLastCalledWith('live')
  stop()
  const again = vi.fn()
  const stopAgain = subscribeToErrors(again)
  expect(again).not.toHaveBeenCalled()
  stopAgain()
})
it('clears revoked household state and deduplicates concurrent failures', () => {
  localStorage.setItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY, 'household')
  const listener = vi.fn()
  const stop = subscribeToErrors(listener)
  handleHouseholdError(new Error('ent: household not found'))
  handleHouseholdError(new Error('ent: household not found'))
  expect(localStorage.getItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY)).toBeNull()
  expect(listener).toHaveBeenCalledExactlyOnceWith(
    'You no longer have access to this household.',
  )
  stop()
})
it('does not treat unrelated failures as revoked membership', () => {
  localStorage.setItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY, 'household')
  handleHouseholdError(new Error('network offline'))
  expect(localStorage.getItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY)).toBe('household')
})
