import { useLingui } from '@lingui/react/macro'
import { SearchSelect } from '@/components/search-select'
import { InvestmentIcon } from '@/components/investment-icon'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { useEffect } from 'react'
import { graphql } from 'react-relay'
import { readInlineData } from 'relay-runtime'
import type { transactionInvestmentPickerFragment$key } from './__generated__/transactionInvestmentPickerFragment.graphql'

const investmentFragment = graphql`
  fragment transactionInvestmentPickerFragment on Investment @inline {
    name
    symbol
    type
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
  inline?: boolean
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
  inline = false,
  name,
  label,
  value,
  onValueChange,
  onBlur,
  invalid,
  disabled = false,
  disabledMessage,
}: Props) {
  const { t } = useLingui()
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
      renderChipIcon={(investment) => (
        <InvestmentIcon {...investmentData(investment)} />
      )}
      hideChipLabel
      inline={inline}
      items={ordered}
      value={selected ?? null}
      label={label}
      id={name}
      name={name}
      placeholder={t`Search investments`}
      isDisabled={disabled}
      disabledMessage={disabledMessage ?? t`Select an account first`}
      getLabel={title}
      getSearchText={(investment) => investmentData(investment).symbol}
      invalid={invalid}
      onBlur={onBlur}
      onChange={(investment) => onValueChange(investment?.id ?? '')}
      emptyText={t`No matching investments available.`}
      renderOption={(investment) => (
        <HStack gap={2} vAlign="center">
          <InvestmentIcon {...investmentData(investment)} />
          <VStack gap={0.5}>
            <Text maxLines={2}>{title(investment)}</Text>
            {investmentData(investment).name !==
              investmentData(investment).symbol && (
              <Text type="supporting" color="secondary">
                {investmentData(investment).symbol}
              </Text>
            )}
          </VStack>
        </HStack>
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
