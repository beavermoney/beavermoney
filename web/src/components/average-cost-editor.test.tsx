// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { AverageCostEditor } from './average-cost-editor'

const state = vi.hoisted(() => ({
  changed: null as string | null,
  amount: '10',
}))
vi.mock('react-relay', () => ({
  graphql: () => ({}),
  useLazyLoadQuery: (_query: unknown, variables: { id: string }) => ({
    node: {
      __typename: 'Investment',
      id: variables.id,
      name: variables.id,
      amount: state.amount,
      holdingsChangedAt: state.changed,
      confirmedAverageCost: '50',
      averageCostConfirmedAt: null,
      averageNeedsReview: true,
      account: { name: 'Broker' },
      householdCurrency: { code: 'CAD' },
    },
  }),
  useMutation: () => [vi.fn(), false],
}))
vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { id: 'household' } }),
}))
vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({ formatCurrencyWithPrivacyMode: () => '$50.00' }),
}))
vi.mock('@/hooks/use-privacy-mode', () => ({
  usePrivacyMode: () => ({ isPrivacyModeEnabled: false }),
}))

afterEach(() => {
  cleanup()
  state.changed = null
  state.amount = '10'
})

it('does not carry an entered average into a different holding with the same quantity', () => {
  const { rerender } = render(<AverageCostEditor investmentId="A" />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '123' } })
  rerender(<AverageCostEditor investmentId="B" />)
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('')
  expect(
    (
      screen.getByRole('button', {
        name: 'Confirm average cost',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true)
})

it('requires a fresh review when a trade changes even if the quantity stays the same', () => {
  const { rerender } = render(<AverageCostEditor investmentId="A" />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '123' } })
  state.changed = '2026-11-21T00:00:00Z'
  rerender(<AverageCostEditor investmentId="A" />)
  expect(
    (
      screen.getByRole('button', {
        name: 'Confirm average cost',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Review latest holding' }))
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('')
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '51' } })
  expect(
    (
      screen.getByRole('button', {
        name: 'Confirm average cost',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false)
})

it('shows a closed source holding without reserving an empty editor after a move', () => {
  state.amount = '0'
  const { container } = render(<AverageCostEditor investmentId="XEQT" />)
  expect(screen.getByText(/Position closed/)).toBeTruthy()
  expect(screen.queryByRole('textbox')).toBeNull()
  expect(container.querySelector('[data-average-editor]')).toBeNull()
})
