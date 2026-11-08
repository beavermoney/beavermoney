import { SearchSelect } from '@/components/search-select'
import { VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { useEffect } from 'react'
import { graphql } from 'react-relay'
import { readInlineData } from 'relay-runtime'
import type { transactionInvestmentPickerFragment$key } from './__generated__/transactionInvestmentPickerFragment.graphql'

const investmentFragment = graphql`
  fragment transactionInvestmentPickerFragment on Investment @inline {
    name
    symbol
    latestTransaction {
      datetime
    }
  }
`

type Investment = transactionInvestmentPickerFragment$key & {
  id: string
  accountName?: string
}

type Props = {
  investments: ReadonlyArray<Investment>
  name: string
  label: string
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  invalid: boolean
  disabled?: boolean
  disabledMessage?: string
}

export function TransactionInvestmentPicker({
  investments,
  name,
  label,
  value,
  onValueChange,
  onBlur,
  invalid,
  disabled = false,
  disabledMessage = 'Select an account first',
}: Props) {
  const selected = investments.find((investment) => investment.id === value)
  useEffect(() => {
    if (value && !selected) onValueChange('')
  }, [value, selected, onValueChange])
  const ordered = [...investments].sort((a, b) =>
    (investmentData(b).latestTransaction?.datetime ?? '').localeCompare(
      investmentData(a).latestTransaction?.datetime ?? '',
    ),
  )
  const title = (investment: Investment) =>
    `${investmentData(investment).name}${investment.accountName ? ` · ${investment.accountName}` : ''}`
  return (
    <SearchSelect
      items={ordered}
      value={selected ?? null}
      label={label}
      id={name}
      name={name}
      placeholder="Search investments"
      isDisabled={disabled}
      disabledMessage={disabledMessage}
      getLabel={title}
      getSearchText={(investment) => investmentData(investment).symbol}
      invalid={invalid}
      onBlur={onBlur}
      onChange={(investment) => onValueChange(investment?.id ?? '')}
      emptyText="No matching investments available."
      renderOption={(investment) => (
        <VStack gap={0.5}>
          <Text maxLines={2}>{title(investment)}</Text>
          {investmentData(investment).name !==
            investmentData(investment).symbol && (
            <Text type="supporting" color="secondary">
              {investmentData(investment).symbol}
            </Text>
          )}
        </VStack>
      )}
    />
  )
}
function investmentData(investment: Investment) {
  return readInlineData<transactionInvestmentPickerFragment$key>(
    investmentFragment,
    investment,
  )
}
