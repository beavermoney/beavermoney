import { DesktopSelectionPopover } from '@/components/desktop-selection-popover'
import { MobileSelectionDrawer } from '@/components/mobile-selection-drawer'
import { graphql } from 'react-relay'
import type { transactionAccountPickerFragment$key } from './__generated__/transactionAccountPickerFragment.graphql'
import { readInlineData } from 'relay-runtime'
import { useEffect } from 'react'
import { WalletIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useCurrency } from '@/hooks/use-currency'
import { getLogoDomainURL } from '@/lib/logo'
import { cn } from '@/lib/utils'
import { newestActivityFirst } from '@/lib/sort-by-update-time'

const accountFragment = graphql`
  fragment transactionAccountPickerFragment on Account @inline {
    id
    type
    name
    icon
    balance
    householdCurrency {
      code
    }
    user {
      name
    }
    latestTransaction {
      datetime
    }
  }
`

type Account = transactionAccountPickerFragment$key

type TransactionAccountPickerProps = {
  accounts: ReadonlyArray<Account>
  name: string
  label: string
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  invalid: boolean
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
  disabled = false,
  preferredTypes,
}: TransactionAccountPickerProps) {
  const isMobile = useIsMobile()
  const selected = accounts.find((account) => accountData(account).id === value)
  const selectionAvailable = !value || selected !== undefined

  useEffect(() => {
    if (!selectionAvailable) onValueChange('')
  }, [onValueChange, selectionAvailable])

  const orderedAccounts = newestAccountsFirst(accounts)
  const preferredTypeSet = new Set(preferredTypes)
  const groups = ACCOUNT_TYPES.map(([type, title], typeIndex) => ({
    type,
    title,
    typeIndex,
    accounts: orderedAccounts.filter(
      (account) => accountData(account).type === type,
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
  if (!isMobile) {
    return (
      <DesktopSelectionPopover
        groups={groups.map((group) => ({
          label: group.title,
          items: group.accounts,
        }))}
        name={name}
        value={value}
        label={label}
        placeholder={
          disabled ? 'Select a source account first' : 'Select an account'
        }
        emptyMessage="No accounts available."
        getValue={(account) => accountData(account).id}
        getLabel={(account) => accountData(account).name}
        renderItem={(account) => (
          <AccountDetails
            account={account}
            selected={value === accountData(account).id}
          />
        )}
        onValueChange={onValueChange}
        onBlur={onBlur}
        invalid={invalid}
        disabled={disabled}
        triggerClassName="h-12 justify-start p-2"
      />
    )
  }

  return (
    <MobileSelectionDrawer
      groups={groups.map((group) => ({
        label: group.title,
        items: group.accounts,
      }))}
      name={name}
      value={value}
      label={label}
      placeholder={
        disabled ? 'Select a source account first' : 'Select an account'
      }
      emptyMessage="No accounts available."
      getValue={(account) => accountData(account).id}
      getLabel={(account) => accountData(account).name}
      renderItem={(account) => (
        <AccountDetails
          account={account}
          selected={value === accountData(account).id}
        />
      )}
      onValueChange={onValueChange}
      onBlur={onBlur}
      invalid={invalid}
      disabled={disabled}
    />
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
  selected = false,
}: {
  account: Account
  selected?: boolean
}) {
  const data = accountData(account)
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <Avatar size="sm">
        {data.icon && <AvatarImage src={getLogoDomainURL(data.icon)} alt="" />}
        <AvatarFallback>
          <WalletIcon className="size-4" aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-1 flex-col text-xs leading-4">
        <span className="truncate" title={data.name}>
          {data.name}
        </span>
        <span
          className={cn(
            'wrap-anywhere tabular-nums',
            selected ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {formatCurrencyWithPrivacyMode({
            value: data.balance,
            currencyCode: data.householdCurrency.code,
            liability: data.type === 'liability',
          })}
          <span> {data.householdCurrency.code}</span>
          <span aria-hidden="true"> · </span>
          <span>{data.user.name}</span>
        </span>
      </span>
    </span>
  )
}
