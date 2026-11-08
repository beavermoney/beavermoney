// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AccountTypePicker, type AccountType } from './account-type-picker'

afterEach(cleanup)

function Picker() {
  const [value, setValue] = useState<AccountType | ''>('')

  return (
    <>
      <span id="account-type-label">Type</span>
      <AccountTypePicker
        value={value}
        onValueChange={setValue}
        onBlur={vi.fn()}
        labelledBy="account-type-label"
      />
    </>
  )
}

describe('AccountTypePicker', () => {
  it('shows every available account type without opening a menu', () => {
    render(<Picker />)

    expect(
      screen.getByRole('radiogroup', { name: /Account type/ }),
    ).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Liquidity/ })).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Investment/ })).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Receivable/ })).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Liability/ })).toBeTruthy()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('keeps one account type selected', () => {
    render(<Picker />)
    const investment = screen.getByRole('radio', { name: /Investment/ })

    fireEvent.click(investment)
    expect((investment as HTMLInputElement).checked).toBe(true)

    fireEvent.click(investment)
    expect((investment as HTMLInputElement).checked).toBe(true)
  })
})
