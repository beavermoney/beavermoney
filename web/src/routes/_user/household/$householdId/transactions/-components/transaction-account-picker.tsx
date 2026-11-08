import { useComposer } from '@/components/transaction-composer/context'
import { SearchSelect } from '@/components/search-select'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { Avatar } from '@astryxdesign/core/Avatar'
import { useCurrency } from '@/hooks/use-currency'
import { getLogoDomainURL } from '@/lib/logo'
import { useEffect } from 'react'
import { graphql } from 'react-relay'
import { readInlineData } from 'relay-runtime'
import type { transactionAccountPickerFragment$key } from './__generated__/transactionAccountPickerFragment.graphql'

const accountFragment = graphql`
  fragment transactionAccountPickerFragment on Account @inline {
    name
    icon
    balance
    householdCurrency {
      code
    }
    latestTransaction {
      datetime
    }
  }
`

type Account = transactionAccountPickerFragment$key & {
  id: string
  type: string
}

type TransactionAccountPickerProps = {
  accounts: ReadonlyArray<Account>
  name: string
  label: string
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  invalid: boolean
  expanded?: boolean
  onExpand?: () => void
  disabled?: boolean
  preferredTypes?: ReadonlyArray<string>
}

export function TransactionAccountPicker({
  accounts,
  name,
  label,
  value,
  onValueChange,
  onBlur,
  invalid,
  disabled = false,
  preferredTypes,
}: TransactionAccountPickerProps) {
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const selected = accounts.find((account) => account.id === value)
  const isComposer = !!useComposer()
  const ordered = [...accounts].sort((a, b) => {
    const preference =
      Number(!preferredTypes?.includes(a.type)) -
      Number(!preferredTypes?.includes(b.type))
    return (
      preference ||
      (accountData(b).latestTransaction?.datetime ?? '').localeCompare(
        accountData(a).latestTransaction?.datetime ?? '',
      )
    )
  })
  const defaultID = isComposer && !disabled ? ordered[0]?.id : undefined
  useEffect(() => {
    if (!selected && (value || defaultID)) onValueChange(defaultID ?? '')
  }, [value, selected, defaultID, onValueChange])
  return (
    <SearchSelect
      confirmSelection
      hideChipLabel
      renderChipIcon={(account) => {
        const data = accountData(account)
        return (
          <Avatar
            size="xsm"
            name={data.name}
            src={data.icon ? getLogoDomainURL(data.icon) : undefined}
          />
        )
      }}
      items={ordered}
      value={selected ?? null}
      label={label}
      id={name}
      name={name}
      placeholder="Search accounts"
      getLabel={(account) => accountData(account).name}
      getSearchText={(account) =>
        `${account.type} ${accountData(account).householdCurrency.code}`
      }
      isDisabled={disabled}
      disabledMessage="Select a source account first"
      invalid={invalid}
      onBlur={onBlur}
      onChange={(account) => onValueChange(account?.id ?? '')}
      emptyText="No matching accounts."
      renderOption={(account) => {
        const data = accountData(account)
        return (
          <HStack gap={2} vAlign="center">
            <Avatar
              name={data.name}
              src={data.icon ? getLogoDomainURL(data.icon) : undefined}
            />
            <VStack gap={0.5}>
              <Text maxLines={2}>{data.name}</Text>
              <Text type="supporting" color="secondary">
                {account.type} ·{' '}
                {formatCurrencyWithPrivacyMode({
                  value: data.balance,
                  currencyCode: data.householdCurrency.code,
                  liability: account.type === 'liability',
                })}{' '}
                {data.householdCurrency.code}
              </Text>
            </VStack>
          </HStack>
        )
      }}
    />
  )
}
function accountData(account: Account) {
  return readInlineData<transactionAccountPickerFragment$key>(
    accountFragment,
    account,
  )
}
