// @vitest-environment jsdom
import { Suspense } from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RelayEnvironmentProvider, useLazyLoadQuery } from 'react-relay'
import {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
} from 'relay-runtime'
import type { GraphQLResponse } from 'relay-runtime'
import query from '../__generated__/accountsSettingsQuery.graphql'
import type { accountsSettingsQuery } from '../__generated__/accountsSettingsQuery.graphql'
import { AccountSettings } from './account-settings'

vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { id: 'household-1', locale: 'en-US' } }),
}))
vi.mock('@astryxdesign/core/Toast', () => ({ useToast: () => vi.fn() }))

afterEach(cleanup)

function setup(hasAccounts = true) {
  let mutationSink:
    | {
        next: (response: GraphQLResponse) => void
        complete: () => void
        error: (error: Error) => void
      }
    | undefined
  const environment = new Environment({
    store: new Store(new RecordSource()),
    network: Network.create((operation) => {
      if (operation.operationKind === 'mutation') {
        return Observable.create((sink) => {
          mutationSink = sink
        })
      }
      return Observable.from({
        data: {
          household: { id: 'household-1' },
          accounts: {
            edges: hasAccounts
              ? [
                  {
                    node: {
                      id: 'account-1',
                      name: 'Old savings',
                      type: 'liquidity',
                      archived: true,
                      user: { id: 'user-1', name: 'Joey' },
                      householdCurrency: { id: 'currency-1', code: 'CAD' },
                    },
                  },
                ]
              : [],
          },
        },
      })
    }),
  })
  function Harness() {
    const data = useLazyLoadQuery<accountsSettingsQuery>(query, {})
    return <AccountSettings fragmentRef={data} />
  }
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Loading">
        <Harness />
      </Suspense>
    </RelayEnvironmentProvider>,
  )
  return {
    succeed: () =>
      act(() => {
        mutationSink?.next({
          data: { unarchiveAccount: { id: 'account-1', archived: false } },
        })
        mutationSink?.complete()
      }),
    fail: () =>
      act(() => {
        mutationSink?.error(new Error('Offline'))
      }),
  }
}

describe('Account settings', () => {
  it('restores an account and removes it from the archive without a reload', async () => {
    const request = setup()
    const button = await screen.findByRole('button', {
      name: 'Unarchive Old savings',
    })
    fireEvent.click(button)
    expect(button.hasAttribute('disabled')).toBe(true)
    expect(screen.getByText('Unarchiving…')).toBeTruthy()
    request.succeed()
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Unarchive Old savings' }),
      ).toBeNull(),
    )
    expect(screen.getByText('No archived accounts')).toBeTruthy()
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'Old savings is active again',
      ),
    )
  })

  it('keeps the account available to retry after a failed mutation', async () => {
    const request = setup()
    const button = await screen.findByRole('button', {
      name: 'Unarchive Old savings',
    })
    fireEvent.click(button)
    request.fail()
    await waitFor(() => expect(button.hasAttribute('disabled')).toBe(false))
    expect(screen.getByText('Old savings')).toBeTruthy()
  })

  it('explains the empty archive', async () => {
    setup(false)
    expect(await screen.findByText('No archived accounts')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })
})
