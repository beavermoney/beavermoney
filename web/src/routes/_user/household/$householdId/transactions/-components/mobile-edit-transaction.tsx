import { InvestmentIcon } from '@/components/investment-icon'
import { ComposerTransferRows } from '@/components/transaction-composer/transfer-rows'
import { FinanceDateInput } from '@/components/finance-date-input'
import { SearchSelect } from '@/components/search-select'
import { MobileTransactionComposer } from '@/components/transaction-composer/composer'
import { useComposer } from '@/components/transaction-composer/context'
import { ComposerAmount } from '@/components/transaction-composer/controls'
import { useCurrencyConfig } from '@/hooks/use-currency-config'
import { useHousehold } from '@/hooks/use-household'
import { getLogoDomainURL } from '@/lib/logo'
import { commitMutationResult } from '@/lib/relay'
import { Avatar } from '@astryxdesign/core/Avatar'
import { Button } from '@astryxdesign/core/Button'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Fragment, useState } from 'react'
import { graphql, useFragment, useMutation } from 'react-relay'
import { TransactionCategoryPicker } from './transaction-category-picker'
import type { mobileEditTransactionFragment$key } from './__generated__/mobileEditTransactionFragment.graphql'
import type { mobileEditTransactionAccountsFragment$key } from './__generated__/mobileEditTransactionAccountsFragment.graphql'
import type { mobileEditTransactionMutation } from './__generated__/mobileEditTransactionMutation.graphql'
import type { transactionCategoryPickerFragment$key } from './__generated__/transactionCategoryPickerFragment.graphql'

const transactionFragment = graphql`
  fragment mobileEditTransactionFragment on Transaction {
    id
    description
    datetime
    excludeFromReports
    user {
      name
    }
    category {
      id
      name
      type
      icon
    }
    transactionEntries {
      id
      amount
      account {
        id
        name
        icon
        type
        archived
        householdCurrency {
          code
        }
      }
    }
    investmentLots {
      id
      amount
      price
      investment {
        id
        name
        symbol
        type
        account {
          id
          name
          icon
          type
          archived
          householdCurrency {
            code
          }
        }
      }
    }
  }
`
const accountsFragment = graphql`
  fragment mobileEditTransactionAccountsFragment on Household
  @argumentDefinitions(viewUserIds: { type: "[ID!]" }) {
    accounts(where: { archived: false, userIDIn: $viewUserIds }) {
      edges {
        node {
          id
          name
          icon
          type
          archived
          householdCurrency {
            code
          }
          investments {
            id
            name
            symbol
            type
          }
        }
      }
    }
  }
`
// One GraphQL operation: the server's Transactioner commits all selected
// entry/lot edits and transaction metadata together, or rolls them all back.
const updateMutation = graphql`
  mutation mobileEditTransactionMutation(
    $id: ID!
    $input: UpdateTransactionInput!
    $entry0: ID!
    $entry0Input: UpdateTransactionEntryInput!
    $editEntry0: Boolean!
    $entry1: ID!
    $entry1Input: UpdateTransactionEntryInput!
    $editEntry1: Boolean!
    $lot0: ID!
    $lot0Input: UpdateInvestmentLotInput!
    $editLot0: Boolean!
    $lot1: ID!
    $lot1Input: UpdateInvestmentLotInput!
    $editLot1: Boolean!
  ) {
    entry0: updateTransactionEntry(id: $entry0, input: $entry0Input)
      @include(if: $editEntry0) {
      node {
        id
        amount
        accountID
        account {
          id
          balance
          value
        }
      }
    }
    entry1: updateTransactionEntry(id: $entry1, input: $entry1Input)
      @include(if: $editEntry1) {
      node {
        id
        amount
        accountID
        account {
          id
          balance
          value
        }
      }
    }
    lot0: updateInvestmentLot(id: $lot0, input: $lot0Input)
      @include(if: $editLot0) {
      node {
        id
        amount
        price
        investmentID
        investment {
          id
          amount
          value
          account {
            id
            value
          }
        }
      }
    }
    lot1: updateInvestmentLot(id: $lot1, input: $lot1Input)
      @include(if: $editLot1) {
      node {
        id
        amount
        price
        investmentID
        investment {
          id
          amount
          value
          account {
            id
            value
          }
        }
      }
    }
    updateTransaction(id: $id, input: $input) {
      node {
        id
        ...mobileEditTransactionFragment
        ...transactionCardFragment
        ...editTransactionDialogTransactionFragment
      }
    }
  }
`

type Account = {
  id: string
  name: string
  icon?: string | null
  type: string
  archived: boolean
  householdCurrency: { code: string }
  investments?: ReadonlyArray<{
    id: string
    name: string
    type?: string
    symbol?: string | null
  }> | null
}
const absolute = (value: string) => value.replace(/^-/, '')
const signed = (value: string, original: string) =>
  original.startsWith('-') ? `-${value}` : value
const isPositive = (value: string) =>
  /^\d+(\.\d+)?$/.test(value) && /[1-9]/.test(value)
const scaleFor = (value: string, minimum: number) =>
  Math.max(minimum, value.split('.')[1]?.length ?? 0)

export function MobileEditTransaction({
  transactionRef,
  householdRef,
  categories,
  onClose,
  onDelete,
  deleting,
  onPendingChange,
}: {
  transactionRef: mobileEditTransactionFragment$key
  householdRef: mobileEditTransactionAccountsFragment$key
  categories: ReadonlyArray<
    transactionCategoryPickerFragment$key & { id: string; type: string }
  >
  onClose?: () => void
  onDelete: () => Promise<void>
  deleting: boolean
  onPendingChange?: (pending: boolean) => void
}) {
  const transaction = useFragment(transactionFragment, transactionRef)
  const household = useFragment(accountsFragment, householdRef)
  const originalEntries = transaction.transactionEntries ?? []
  const originalLots = transaction.investmentLots ?? []
  const [entries, setEntries] = useState(() =>
    originalEntries.map((e) => ({
      id: e.id,
      amount: absolute(e.amount),
      accountId: e.account.id,
    })),
  )
  const [lots, setLots] = useState(() =>
    originalLots.map((l) => ({
      id: l.id,
      amount: absolute(l.amount),
      price: l.price,
      investmentId: l.investment.id,
      accountId: l.investment.account.id,
    })),
  )
  const [description, setDescription] = useState(transaction.description ?? '')
  const [date, setDate] = useState(new Date(transaction.datetime))
  const [categoryId, setCategoryId] = useState(transaction.category.id)
  const [excluded, setExcluded] = useState(transaction.excludeFromReports)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [commit, pending] =
    useMutation<mobileEditTransactionMutation>(updateMutation)
  // Retain existing archived/out-of-scope accounts; never silently substitute one.
  const available =
    household.accounts.edges?.flatMap((e) => (e?.node ? [e.node] : [])) ?? []
  const accountMap = new Map<string, Account>([
    ...originalEntries.map((e) => [e.account.id, e.account] as const),
    ...originalLots.map(
      (l) => [l.investment.account.id, l.investment.account] as const,
    ),
    ...available.map((a) => [a.id, a] as const),
  ])
  const transfer =
    originalLots.length === 0 &&
    entries.length === 2 &&
    originalEntries.some((e) => e.amount.startsWith('-')) &&
    originalEntries.some((e) => !e.amount.startsWith('-'))
  const sameCurrency =
    transfer &&
    accountMap.get(entries[0].accountId)?.householdCurrency.code ===
      accountMap.get(entries[1].accountId)?.householdCurrency.code
  const sharedAmount = sameCurrency && entries[0].amount === entries[1].amount
  const firstEntry = transfer
    ? originalEntries.findIndex((e) => e.amount.startsWith('-'))
    : 0
  const firstAmount = lots.length ? 'lot-0-shares' : `entry-${firstEntry}`
  const updateEntry = (index: number, amount: string) =>
    setEntries((current) =>
      current.map((e, i) =>
        i === index || sharedAmount ? { ...e, amount } : e,
      ),
    )

  async function save() {
    setAttempted(true)
    if (
      !categoryId ||
      description.length > 256 ||
      entries.some(
        (e) => !isPositive(e.amount) || !accountMap.has(e.accountId),
      ) ||
      lots.some(
        (l) =>
          !isPositive(l.amount) ||
          !/^\d+(\.\d+)?$/.test(l.price) ||
          !l.investmentId,
      )
    )
      return false
    const entryInput = (index: number) => {
      const e = entries[index],
        original = originalEntries[index]
      if (!e || !original) return {}
      return {
        amount: signed(e.amount, original.amount),
        ...(e.accountId !== original.account.id
          ? { accountID: e.accountId }
          : {}),
      }
    }
    const lotInput = (index: number) => {
      const l = lots[index],
        original = originalLots[index]
      if (!l || !original) return {}
      return {
        amount: signed(l.amount, original.amount),
        price: l.price,
        ...(l.investmentId !== original.investment.id
          ? { investmentID: l.investmentId }
          : {}),
      }
    }
    const result = await commitMutationResult<mobileEditTransactionMutation>(
      commit,
      {
        variables: {
          id: transaction.id,
          input: {
            description: description || null,
            clearDescription: !description,
            datetime: date.toISOString(),
            categoryID: categoryId,
            excludeFromReports: excluded,
          },
          entry0: entries[0]?.id ?? transaction.id,
          entry0Input: entryInput(0),
          editEntry0:
            !!entries[0] &&
            (signed(entries[0].amount, originalEntries[0].amount) !==
              originalEntries[0].amount ||
              entries[0].accountId !== originalEntries[0].account.id),
          entry1: entries[1]?.id ?? transaction.id,
          entry1Input: entryInput(1),
          editEntry1:
            !!entries[1] &&
            (signed(entries[1].amount, originalEntries[1].amount) !==
              originalEntries[1].amount ||
              entries[1].accountId !== originalEntries[1].account.id),
          lot0: lots[0]?.id ?? transaction.id,
          lot0Input: lotInput(0),
          editLot0:
            !!lots[0] &&
            (signed(lots[0].amount, originalLots[0].amount) !==
              originalLots[0].amount ||
              lots[0].price !== originalLots[0].price ||
              lots[0].investmentId !== originalLots[0].investment.id),
          lot1: lots[1]?.id ?? transaction.id,
          lot1Input: lotInput(1),
          editLot1:
            !!lots[1] &&
            (signed(lots[1].amount, originalLots[1].amount) !==
              originalLots[1].amount ||
              lots[1].price !== originalLots[1].price ||
              lots[1].investmentId !== originalLots[1].investment.id),
        },
        updater: (store) => store.invalidateStore(),
      },
    )
    if (result.status === 'error') throw result.error
    onClose?.()
    return true
  }

  const entryAmount = (i: number) => {
    const entry = entries[i]
    return (
      <EditAmount
        key={entry.id}
        name={`entry-${i}`}
        label={
          lots.length
            ? originalEntries[i].amount.startsWith('-')
              ? 'Total paid'
              : 'Total received'
            : transfer && !sharedAmount
              ? originalEntries[i].amount.startsWith('-')
                ? 'From amount'
                : 'To amount'
              : 'Amount'
        }
        value={entry.amount}
        currencyCode={accountMap.get(entry.accountId)!.householdCurrency.code}
        scale={scaleFor(originalEntries[i].amount, 2)}
        invalid={attempted && !isPositive(entry.amount)}
        onChange={(amount) => updateEntry(i, amount)}
      />
    )
  }
  const entryAccount = (i: number) => {
    const entry = entries[i]
    return (
      <EditAccount
        key={entry.id}
        disabled={lots.length > 0}
        amountName={firstAmount}
        name={`account-${i}`}
        label={
          transfer
            ? originalEntries[i].amount.startsWith('-')
              ? 'From account'
              : 'To account'
            : 'Account'
        }
        value={accountMap.get(entry.accountId)!}
        accounts={available.filter(
          (a) =>
            !transfer ||
            entries.every((e, index) => index === i || e.accountId !== a.id),
        )}
        onChange={(account) =>
          setEntries((current) =>
            current.map((e, index) =>
              index === i ? { ...e, accountId: account.id } : e,
            ),
          )
        }
      />
    )
  }

  const sourceLot = Math.max(
    0,
    originalLots.findIndex((lot) => lot.amount.startsWith('-')),
  )
  const investmentAccount = (i: number) => (
    <EditAccount
      disabled
      amountName={`lot-${i}-shares`}
      name={`investment-account-${i}`}
      label="Investment account"
      value={accountMap.get(lots[i].accountId)!}
      accounts={[]}
      onChange={() => {}}
    />
  )
  const investmentSymbol = (i: number) => (
    <SearchSelect
      isDisabled
      hideChipLabel
      name={`investment-${i}`}
      label="Investment"
      items={[originalLots[i].investment]}
      value={originalLots[i].investment}
      getLabel={(inv) => inv.symbol || inv.name}
      renderChipIcon={(inv) => <InvestmentIcon {...inv} />}
    />
  )

  return (
    <MobileTransactionComposer
      mode="edit"
      header={
        lots.length ? (
          lots.length === 2 ? (
            <>
              <Text type="label">Move</Text>
              {investmentSymbol(sourceLot)}
              <Text type="supporting">from</Text>
              {investmentAccount(sourceLot)}
              <Text type="supporting">to</Text>
              {investmentAccount(1 - sourceLot)}
            </>
          ) : (
            <>
              {investmentAccount(0)}
              <Text type="label">{transaction.category.name}</Text>
              {investmentSymbol(0)}
            </>
          )
        ) : undefined
      }
      stableAmounts={lots.length > 0}
      embedded
      kind={transaction.category.type}
      initialCategory={transaction.category}
      firstAmount={firstAmount}
      pending={pending || deleting}
      onPendingChange={onPendingChange}
      onSave={save}
      category={
        <TransactionCategoryPicker
          categories={categories}
          name="category"
          value={categoryId}
          onValueChange={setCategoryId}
          onBlur={() => {}}
          invalid={attempted && !categoryId}
        />
      }
      entryRows={
        transfer ? (
          <ComposerTransferRows
            fromAccount={entryAccount(firstEntry)}
            fromAmount={entryAmount(firstEntry)}
            toAccount={entryAccount(1 - firstEntry)}
            toAmount={sharedAmount ? undefined : entryAmount(1 - firstEntry)}
          />
        ) : undefined
      }
      amounts={
        <>
          {lots.map((lot, i) => (
            <Fragment key={lot.id}>
              <EditAmount
                name={`lot-${i}-shares`}
                label={
                  lots.length > 1
                    ? `${i === 0 ? 'From' : 'To'} shares`
                    : 'Shares'
                }
                value={lot.amount}
                currencyCode={
                  accountMap.get(lot.accountId)!.householdCurrency.code
                }
                shares
                scale={scaleFor(originalLots[i].amount, 8)}
                invalid={attempted && !isPositive(lot.amount)}
                onChange={(amount) =>
                  setLots((current) =>
                    current.map((l, index) =>
                      index === i ? { ...l, amount } : l,
                    ),
                  )
                }
              />
            </Fragment>
          ))}
          {lots.map((lot, i) => (
            <Fragment key={lot.id}>
              <EditAmount
                name={`lot-${i}-price`}
                label="Price per share"
                value={lot.price}
                currencyCode={
                  accountMap.get(lot.accountId)!.householdCurrency.code
                }
                scale={scaleFor(originalLots[i].price, 8)}
                invalid={attempted && !/^\d+(\.\d+)?$/.test(lot.price)}
                onChange={(price) =>
                  setLots((current) =>
                    current.map((l, index) =>
                      index === i ? { ...l, price } : l,
                    ),
                  )
                }
              />
            </Fragment>
          ))}
          {!transfer && entries.map((_, i) => entryAmount(i))}
        </>
      }
      chips={
        <>
          {!transfer && !lots.length && entries.map((_, i) => entryAccount(i))}
          <Button
            label={`Owner: ${transaction.user.name}`}
            isDisabled
            variant="secondary"
            tooltip="The transaction owner cannot be changed."
          >
            {transaction.user.name}
          </Button>
        </>
      }
      date={
        <FinanceDateInput
          id="date"
          label="Date"
          value={date}
          onChange={setDate}
          onBlur={() => {}}
          disabledDate={(d) => d > new Date() || d < new Date('1900-01-01')}
        />
      }
      details={
        <>
          <TextInput
            label="Description"
            value={description}
            onChange={setDescription}
          />
          <CheckboxInput
            label="Exclude from reports"
            value={excluded}
            onChange={setExcluded}
          />
          {confirmDelete ? (
            <Stack gap={3}>
              <Text>
                Delete this transaction and all its entries? This cannot be
                undone.
              </Text>
              <Button
                label="Cancel deletion"
                onClick={() => setConfirmDelete(false)}
              />
              <Button
                label="Delete permanently"
                variant="destructive"
                onClick={() => void onDelete()}
              />
            </Stack>
          ) : (
            <Button
              label="Delete transaction"
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            />
          )}
        </>
      }
    />
  )
}

function EditAccount({
  disabled = false,
  amountName,
  name,
  label,
  value,
  accounts,
  onChange,
}: {
  disabled?: boolean
  amountName: string
  name: string
  label: string
  value: Account
  accounts: readonly Account[]
  onChange: (account: Account) => void
}) {
  const composer = useComposer()
  const choices = accounts.some((a) => a.id === value.id)
    ? accounts
    : [value, ...accounts]
  const icon = (a: Account) => (
    <Avatar
      size="xsm"
      name={a.name}
      src={a.icon ? getLogoDomainURL(a.icon) : undefined}
    />
  )
  return (
    <SearchSelect
      name={name}
      label={label}
      isDisabled={disabled}
      items={choices}
      value={value}
      getLabel={(a) => a.name}
      getSearchText={(a) => `${a.type} ${a.householdCurrency.code}`}
      hideChipLabel
      confirmSelection
      renderChipIcon={icon}
      renderOption={(a) => (
        <Stack direction="horizontal" gap={2} vAlign="center">
          {icon(a)}
          <Stack gap={1}>
            <Text>{a.name}</Text>
            <Text type="supporting">
              {a.type} · {a.householdCurrency.code}
              {a.archived ? ' · Archived' : ''}
            </Text>
          </Stack>
        </Stack>
      )}
      onChange={(a) => {
        if (!a) return
        composer?.setActiveAmount(amountName)
        onChange(a)
      }}
    />
  )
}

function EditAmount({
  name,
  label,
  value,
  currencyCode,
  scale,
  shares,
  invalid,
  onChange,
}: {
  name: string
  label: string
  value: string
  currencyCode: string
  scale: number
  shares?: boolean
  invalid: boolean
  onChange: (value: string) => void
}) {
  const { household } = useHousehold()
  const config = useCurrencyConfig(household.locale, currencyCode)
  const decimal = config.decimalSeparator || '.'
  return (
    <ComposerAmount
      name={name}
      label={label}
      raw={value.replace('.', decimal)}
      prefix={shares ? '' : config.prefix}
      suffix={shares ? '' : config.suffix}
      currencyCode={shares ? undefined : currencyCode}
      decimal={decimal}
      scale={scale}
      invalid={invalid}
      onChange={(raw) => onChange(raw.replace(decimal, '.'))}
    />
  )
}
