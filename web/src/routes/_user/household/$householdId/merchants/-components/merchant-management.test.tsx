// @vitest-environment jsdom
import '@/test/browser-setup'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MerchantEditor } from './merchant-editor'
import { MergeMerchant } from './merge-merchant'
const mocks = vi.hoisted(() => ({
  commit: vi.fn(),
  toast: vi.fn(),
  target: 'target-1',
}))
vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { id: 'household-1' } }),
}))
vi.mock('react-relay', async (original) => ({
  ...(await original<typeof import('react-relay')>()),
  useMutation: () => [vi.fn(), false],
}))
vi.mock('@/lib/relay', () => ({
  commitMutationResult: (...args: unknown[]) => mocks.commit(...args),
}))
vi.mock('@astryxdesign/core/Toast', () => ({ useToast: () => mocks.toast }))
vi.mock('@/components/merchant-picker', () => ({
  MerchantPicker: ({
    onChange,
    excludedIds,
  }: {
    onChange: (value: { id: string; name: string }) => void
    excludedIds: string[]
  }) => (
    <>
      <p>Excluded: {excludedIds.join(',')}</p>
      <button
        onClick={() => onChange({ id: mocks.target, name: 'Destination' })}
      >
        Choose destination
      </button>
    </>
  ),
}))
beforeEach(() => {
  vi.clearAllMocks()
  mocks.target = 'target-1'
  mocks.commit.mockResolvedValue({
    status: 'success',
    data: {
      createMerchant: { id: 'new' },
      updateMerchant: { id: 'source-1' },
      mergeMerchant: {
        reassignedCount: 72,
        targetMerchant: { id: 'target-1' },
      },
    },
  })
})
afterEach(cleanup)

it('saves an optional logo domain only after confirmation and prevents duplicate saves', async () => {
  const close = vi.fn()
  let finish!: (value: unknown) => void
  mocks.commit.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  render(<MerchantEditor onClose={close} />)
  fireEvent.change(screen.getByRole('textbox', { name: /Merchant name/ }), {
    target: { value: '  Grocery  ' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: /Website domain/ }), {
    target: { value: '  grocery.example  ' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(mocks.commit).toHaveBeenCalledTimes(1)
  expect(mocks.commit.mock.calls[0][1].variables).toEqual({
    name: 'Grocery',
    icon: 'grocery.example',
  })
  expect(close).not.toHaveBeenCalled()
  await act(async () =>
    finish({ status: 'success', data: { createMerchant: { id: 'new' } } }),
  )
  expect(close).toHaveBeenCalledOnce()
})
it('supports Unicode names up to 120 codepoints, preserves unchanged logos and leaves failures open', async () => {
  const close = vi.fn()
  mocks.commit.mockResolvedValue({
    status: 'error',
    error: new Error('duplicate'),
  })
  render(
    <MerchantEditor
      merchant={{ id: 'source-1', name: 'Old name', icon: 'old.example' }}
      onClose={close}
    />,
  )
  fireEvent.change(screen.getByRole('textbox', { name: /Merchant name/ }), {
    target: { value: '🍏'.repeat(121) },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(mocks.commit).not.toHaveBeenCalled()
  fireEvent.change(screen.getByRole('textbox', { name: /Merchant name/ }), {
    target: { value: '🍏'.repeat(120) },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledOnce())
  expect(mocks.commit.mock.calls[0][1].variables).toMatchObject({
    id: 'source-1',
    name: '🍏'.repeat(120),
    clearIcon: false,
  })
  expect(mocks.commit.mock.calls[0][1].variables.icon).toBe('old.example')
  expect(close).not.toHaveBeenCalled()
  expect(
    await screen.findByText(
      'Could not save this merchant. Check the name and website domain, then try again.',
    ),
  ).toBeTruthy()
})
it('sends explicit logo removal while preserving the merchant identity', async () => {
  render(
    <MerchantEditor
      merchant={{ id: 'source-1', name: 'Grocery', icon: 'old.example' }}
      onClose={vi.fn()}
    />,
  )
  fireEvent.change(screen.getByRole('textbox', { name: /Website domain/ }), {
    target: { value: '' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledOnce())
  expect(mocks.commit.mock.calls[0][1].variables).toEqual({
    id: 'source-1',
    name: 'Grocery',
    icon: null,
    clearIcon: true,
  })
})
it('confirms all-source count, excludes self, merges once and navigates only after success', async () => {
  const close = vi.fn(),
    merged = vi.fn().mockResolvedValue(undefined)
  let finish!: (value: unknown) => void
  mocks.commit.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  render(
    <MergeMerchant
      merchant={{ id: 'source-1', name: 'Source' }}
      transactionCount={72}
      onClose={close}
      onMerged={merged}
    />,
  )
  expect(screen.getByText(/Move all 72 transactions from Source/)).toBeTruthy()
  expect(screen.getByText('Excluded: source-1')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Merge merchants' }))
  expect(mocks.commit).not.toHaveBeenCalled()
  mocks.target = 'source-1'
  fireEvent.click(screen.getByRole('button', { name: 'Choose destination' }))
  fireEvent.click(screen.getByRole('button', { name: 'Merge merchants' }))
  expect(mocks.commit).not.toHaveBeenCalled()
  mocks.target = 'target-1'
  fireEvent.click(screen.getByRole('button', { name: 'Choose destination' }))
  expect(
    screen.getByText(/Source will be removed. This cannot be undone./),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Merge merchants' }))
  fireEvent.click(screen.getByRole('button', { name: 'Merge merchants' }))
  expect(mocks.commit).toHaveBeenCalledTimes(1)
  expect(mocks.commit.mock.calls[0][1].variables).toEqual({
    sourceID: 'source-1',
    targetID: 'target-1',
  })
  expect(merged).not.toHaveBeenCalled()
  await act(async () =>
    finish({
      status: 'success',
      data: {
        mergeMerchant: {
          reassignedCount: 72,
          targetMerchant: { id: 'target-1' },
        },
      },
    }),
  )
  expect(close).toHaveBeenCalledOnce()
  expect(merged).toHaveBeenCalledWith('target-1')
})

it('allows a merchant without a domain and has no upload controls', async () => {
  render(<MerchantEditor onClose={vi.fn()} />)
  fireEvent.change(screen.getByRole('textbox', { name: /Merchant name/ }), {
    target: { value: 'Local market' },
  })
  expect(
    screen
      .getByRole('textbox', { name: /Website domain/ })
      .getAttribute('placeholder'),
  ).toBe('example.com')
  expect(document.querySelector('input[type="file"]')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledOnce())
  expect(mocks.commit.mock.calls[0][1].variables).toEqual({
    name: 'Local market',
    icon: null,
  })
})
