import { useLingui } from '@lingui/react/macro'
import { SearchSelect } from '@/components/search-select'
import { InvestmentIcon } from '@/components/investment-icon'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { graphql } from 'react-relay'
import { readInlineData } from 'relay-runtime'
import type { transactionInvestmentPickerFragment$key } from './__generated__/transactionInvestmentPickerFragment.graphql'

const investmentFragment = graphql`
  fragment transactionInvestmentPickerFragment on Investment @inline {
    name
    symbol
    type
    amount
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
  showAvailableShares?: boolean
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
  showAvailableShares = false,
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
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const shareQuantity = (investment: Investment) =>
    isPrivacyModeEnabled ? '•••' : investmentData(investment).amount
  const availableShares = (investment: Investment) => {
    const shares = shareQuantity(investment)
    return t`Shares available: ${shares}`
  }
  const selected = investments.find((investment) => investment.id === value)
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
        <InvestmentIcon
          name={investmentData(investment).name}
          symbol={investmentData(investment).symbol}
          type={investmentData(investment).type}
        />
      )}
      hideChipLabel
      chipDescriptionLayout="inline"
      getChipDescription={
        showAvailableShares
          ? (investment) => {
              const shares = shareQuantity(investment)
              return t`${shares} shares`
            }
          : undefined
      }
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
          <InvestmentIcon
            name={investmentData(investment).name}
            symbol={investmentData(investment).symbol}
            type={investmentData(investment).type}
          />
          <VStack gap={0.5}>
            <Text maxLines={2}>{title(investment)}</Text>
            {showAvailableShares && (
              <Text type="supporting" color="secondary">
                {availableShares(investment)}
              </Text>
            )}
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
