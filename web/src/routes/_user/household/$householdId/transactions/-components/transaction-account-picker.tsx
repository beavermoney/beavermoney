import { Avatar } from '@astryxdesign/core/Avatar'
import { Button } from '@astryxdesign/core/Button'
import {
  DropdownMenu,
  DropdownMenuDivider,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@astryxdesign/core/DropdownMenu'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList'
import { ScrollableArea } from '@astryxdesign/core/ScrollableArea'
import { Stack } from '@astryxdesign/core/Stack'
import { Tab, TabList } from '@astryxdesign/core/TabList'
import { Text } from '@astryxdesign/core/Text'

import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { graphql } from 'react-relay'
import { readInlineData } from 'relay-runtime'
import type { transactionAccountPickerFragment$key } from './__generated__/transactionAccountPickerFragment.graphql'

import { useCurrency } from '@/hooks/use-currency'
import { useIsMobile } from '@/hooks/use-mobile'
import { getLogoDomainURL } from '@/lib/logo'
import { newestActivityFirst } from '@/lib/sort-by-update-time'

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

const ACCOUNT_TYPES = [
  ['liquidity', 'Liquidity'],
  ['investment', 'Investment'],
  ['property', 'Property'],
  ['receivable', 'Receivable'],
  ['liability', 'Liability'],
] as const

export function TransactionAccountPicker({
  accounts,
  name,
  label,
  value,
  onValueChange,
  onBlur,
  invalid,
  expanded: controlledExpanded,
  onExpand,
  disabled = false,
  preferredTypes,
}: TransactionAccountPickerProps) {
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const accountBalance = (account: Account) => {
    const data = accountData(account)
    return `${formatCurrencyWithPrivacyMode({ value: data.balance, currencyCode: data.householdCurrency.code, liability: account.type === 'liability' })} ${data.householdCurrency.code}`
  }
  const isMobile = useIsMobile()
  const [typeFilter, setTypeFilter] = useState<{
    type: string
    accountValue: string
  } | null>(null)
  const [editing, setEditing] = useState(false)
  const isControlled = controlledExpanded !== undefined
  const expanded = controlledExpanded ?? (!value || editing)
  const summaryRef = useRef<HTMLButtonElement>(null)
  const wasExpanded = useRef(expanded)

  useEffect(() => {
    if (isMobile && wasExpanded.current && !expanded) {
      summaryRef.current?.focus({ preventScroll: true })
    }
    wasExpanded.current = expanded
  }, [expanded, isMobile])
  const selected = accounts.find((account) => account.id === value)
  const selectionAvailable = !value || selected !== undefined

  useEffect(() => {
    if (!selectionAvailable) onValueChange('')
  }, [onValueChange, selectionAvailable])

  const preferredTypeSet = new Set(preferredTypes)
  const groups = ACCOUNT_TYPES.map(([type, title], typeIndex) => ({
    type,
    title,
    typeIndex,
    accounts: newestAccountsFirst(
      accounts.filter((account) => account.type === type),
    ),
  }))
    .filter((group) => group.accounts.length > 0)
    .sort((a, b) => {
      const aPreferred = preferredTypes
        ? preferredTypeSet.has(a.type)
          ? 0
          : 1
        : 0
      const bPreferred = preferredTypes
        ? preferredTypeSet.has(b.type)
          ? 0
          : 1
        : 0
      const aActivityTime = accountActivityTime(a.accounts[0])
      const bActivityTime = accountActivityTime(b.accounts[0])
      return (
        aPreferred - bPreferred ||
        bActivityTime.localeCompare(aActivityTime) ||
        a.typeIndex - b.typeIndex
      )
    })
  const requestedType =
    typeFilter?.accountValue === value ? typeFilter.type : selected?.type
  const activeType =
    groups.find((group) => group.type === requestedType)?.type ??
    groups.find((group) => preferredTypes?.includes(group.type))?.type ??
    groups[0]?.type

  if (!isMobile) {
    return (
      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) onBlur()
        }}
        alignment={'start'}
        renderTrigger={(triggerProps) => (
          <Button
            {...triggerProps}
            id={name}
            name={name}
            type="button"
            aria-invalid={invalid}

            label={`${label}: ${selected ? `${accountData(selected).name} · ${accountBalance(selected)}` : disabled ? 'Select a source account first' : 'Select an account'}`}
            variant={'secondary'}

            isDisabled={disabled}
            endContent={
              <AstryxIcon icon={ChevronDownIcon} data-icon="inline-end" />
            }
          >
            {selected ? (
              <AccountDetails account={selected} />
            ) : (
              <span>
                {disabled
                  ? 'Select a source account first'
                  : 'Select an account'}
              </span>
            )}
          </Button>
        )}
      >
        <ScrollableArea label="Scrollable content">
          <Text as="div" display="block">
            {groups.map((group, index) => (
              <Stack direction="vertical" gap={4} key={group.type}>
                {index > 0 ? <DropdownMenuDivider /> : null}
                <DropdownMenuGroup title={<>{group.title}</>}>
                  <DropdownMenuRadioGroup
                    value={value}
                    onChange={(nextValue) => {
                      if (typeof nextValue === 'string')
                        onValueChange(nextValue)
                    }}
                    label="Options"
                    hasCloseOnSelect
                  >
                    {group.accounts.map((account) => (
                      <DropdownMenuRadioItem
                        key={account.id}
                        value={account.id}
                        aria-label={accountData(account).name}

                        label={
                          <>
                            <AccountDetails
                              account={account}
                              selected={value === account.id}
                            />
                          </>
                        }
                      />
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </Stack>
            ))}
          </Text>
        </ScrollableArea>
      </DropdownMenu>
    )
  }

  if (!expanded || disabled) {
    return (
      <Button
        ref={summaryRef}
        type="button"
        id={name}
        isDisabled={disabled}
        aria-expanded={false}
        label={`${label}: ${selected ? `${accountData(selected).name} · ${accountBalance(selected)}` : disabled ? 'Select a source account first' : 'Select an account'}`}
        variant="secondary"
        width="100%"
        icon={<AstryxIcon icon={ChevronDownIcon} />}
        onClick={() => {
          if (isControlled) onExpand?.()
          else setEditing(true)
        }}
      />
    )
  }

  const renderGroups = (accountGroups: typeof groups) =>
    accountGroups.map((group) => (
      <Stack direction="vertical" gap={0.5} key={group.type}>
        <RadioList
          label={`${group.title} accounts`}
          htmlName={name}
          value={value}
          status={invalid ? { type: 'error' } : undefined}
          onChange={(next) => {
            onValueChange(next)
            if (!isControlled) setEditing(false)
          }}
        >
          {group.accounts.map((account) => (
            <RadioListItem
              key={account.id}
              value={account.id}
              label={accountData(account).name}
              description={accountBalance(account)}
              onClick={() => {
                if (value !== account.id) return
                if (isControlled) onValueChange(account.id)
                else setEditing(false)
              }}
            />
          ))}
        </RadioList>
      </Stack>
    ))

  return (
    <fieldset
      id={name}
      aria-invalid={invalid}

      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur()
      }}
    >
      <legend>{label}</legend>
      {accounts.length === 0 ? (
        <Text as="p" display="block" color="secondary">
          No accounts available.
        </Text>
      ) : groups.length === 1 ? (
        renderGroups(groups)
      ) : (
        <Stack direction="vertical" gap={3}>
          <TabList
            value={activeType}
            onChange={(type) => setTypeFilter({ type, accountValue: value })}
            aria-label={`${label} type`}
            overflow="scroll"
          >
            {groups.map((group) => (
              <Tab
                key={group.type}
                value={group.type}
                label={group.title}
                endContent={
                  <span aria-label={`${group.accounts.length} accounts`}>
                    {group.accounts.length}
                  </span>
                }
              />
            ))}
          </TabList>
          <Stack
            direction="vertical"
            gap={4}
            role="tabpanel"
            aria-label={`${label} ${activeType}`}
          >
            {renderGroups(groups.filter((group) => group.type === activeType))}
          </Stack>
        </Stack>
      )}
    </fieldset>
  )
}

function newestAccountsFirst(accounts: ReadonlyArray<Account>): Account[] {
  return newestActivityFirst(
    accounts.map((account) => ({
      account,
      latestTransaction: accountData(account).latestTransaction,
    })),
  ).map(({ account }) => account)
}

function accountActivityTime(account: Account | undefined): string {
  if (!account) return ''
  return accountData(account).latestTransaction?.datetime ?? ''
}

function accountData(account: Account) {
  return readInlineData<transactionAccountPickerFragment$key>(
    accountFragment,
    account,
  )
}

function AccountDetails({
  account,
  selected: _selected = false,
}: {
  account: Account
  selected?: boolean
}) {
  const data = accountData(account)
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  return (
    <HStack gap={2} vAlign="center">
      <Avatar
        name={data.name}
        src={data.icon ? getLogoDomainURL(data.icon) : undefined}
      />
      <VStack gap={1}>
        <Text maxLines={1}>{data.name}</Text>
        <span>
          {formatCurrencyWithPrivacyMode({
            value: data.balance,
            currencyCode: data.householdCurrency.code,
            liability: account.type === 'liability',
          })}
          <span> {data.householdCurrency.code}</span>
        </span>
      </VStack>
    </HStack>
  )
}
