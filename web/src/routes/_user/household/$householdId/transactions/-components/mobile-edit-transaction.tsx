import { AccountAvatar } from '@/components/account-avatar'
import { useCurrency } from '@/hooks/use-currency'
import { TransactionFormFields } from '@/components/transaction-form-fields'
import { CurrencyInput } from '@/components/currency-input'
import { Grid } from '@astryxdesign/core/Grid'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import { DialogHeader } from '@astryxdesign/core/Dialog'
import { useFinanceLabel } from '@/hooks/use-finance-label'
import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { TransactionDeleteConfirmation } from '@/components/transaction-composer/delete-confirmation'
import { InvestmentIcon } from '@/components/investment-icon'
import { ComposerTransferRows } from '@/components/transaction-composer/transfer-rows'
import { FinanceDateInput } from '@/components/finance-date-input'
import { SearchSelect } from '@/components/search-select'
import { MobileTransactionComposer } from '@/components/transaction-composer/composer'
import { useComposer } from '@/components/transaction-composer/context'
import { ComposerAmount } from '@/components/transaction-composer/controls'
import { useCurrencyConfig } from '@/hooks/use-currency-config'
import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'
import { Button } from '@astryxdesign/core/Button'
import { TransactionOption } from '@/components/transaction-options'
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
    pending
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
        balance
        user {
          name
        }
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
          balance
          user {
            name
          }
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
          balance
          user {
            name
          }
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
          user {
            name
          }
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
          user {
            name
          }
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
  user: { name: string }
  id: string
  name: string
  icon?: string | null
  type: string
  archived: boolean
  balance?: string
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
  desktop = false,
  transactionRef,
  householdRef,
  categories,
  onClose,
  onDelete,
  deleting,
  onPendingChange,
}: {
  desktop?: boolean
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
  const { t } = useLingui()
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
  const [transactionPending, setTransactionPending] = useState(
    transaction.pending,
  )
  const [excluded, setExcluded] = useState(transaction.excludeFromReports)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
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
            pending: transactionPending,
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
              ? t`Total paid`
              : t`Total received`
            : transfer && !sharedAmount
              ? originalEntries[i].amount.startsWith('-')
                ? t`From amount`
                : t`To amount`
              : t`Amount`
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
        showBalance={transfer && !desktop}
        disabled={lots.length > 0}
        amountName={firstAmount}
        name={`account-${i}`}
        label={
          transfer
            ? originalEntries[i].amount.startsWith('-')
              ? t`From account`
              : t`To account`
            : t`Account`
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
      label={t`Investment account`}
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
      label={t`Investment`}
      items={[originalLots[i].investment]}
      value={originalLots[i].investment}
      getLabel={(inv) => inv.symbol || inv.name}
      renderChipIcon={(inv) => <InvestmentIcon {...inv} />}
    />
  )

  if (desktop) {
    const editLotAccount = (i: number) => {
      const lot = lots[i]
      const choices = [...accountMap.values()].filter(
        (a) => a.type === 'investment',
      )
      return (
        <EditAccount
          name={`investment-account-${i}`}
          amountName={`lot-${i}-shares`}
          label={
            lots.length > 1
              ? i === sourceLot
                ? t`From account`
                : t`To account`
              : t`Account`
          }
          value={accountMap.get(lot.accountId)!}
          accounts={choices}
          onChange={(account) => {
            setLots((current) =>
              current.map((l, index) =>
                index === i
                  ? { ...l, accountId: account.id, investmentId: '' }
                  : l,
              ),
            )
            if (lots.length === 1)
              setEntries((current) =>
                current.map((e) => ({ ...e, accountId: account.id })),
              )
          }}
        />
      )
    }
    const editLotInvestment = (i: number) => {
      const lot = lots[i]
      const original = originalLots[i].investment
      const account = available.find((a) => a.id === lot.accountId)
      const choices = account?.investments ?? []
      const investments =
        original.account.id === lot.accountId &&
        !choices.some((inv) => inv.id === original.id)
          ? [original, ...choices]
          : choices
      return (
        <SearchSelect
          name={`investment-${i}`}
          label={t`Investment`}
          items={investments}
          value={investments.find((inv) => inv.id === lot.investmentId) ?? null}
          getLabel={(inv) => inv.symbol || inv.name}
          renderChipIcon={(inv) => <InvestmentIcon {...inv} />}
          renderOption={(inv) => (
            <Stack direction="horizontal" gap={2} vAlign="center">
              <InvestmentIcon {...inv} />
              <Text>{inv.symbol || inv.name}</Text>
            </Stack>
          )}
          onChange={(inv) =>
            setLots((current) =>
              current.map((l, index) =>
                index === i ? { ...l, investmentId: inv?.id ?? '' } : l,
              ),
            )
          }
        />
      )
    }
    const submit = async () => {
      setSaveError(null)
      onPendingChange?.(true)
      try {
        if (!(await save()))
          setSaveError(t`Please check the transaction details.`)
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : String(error))
      } finally {
        onPendingChange?.(false)
      }
    }
    return (
      <>
        <Stack height="min(620px, calc(100dvh - var(--spacing-8)))">
          <Layout
            padding={4}
            header={
              <DialogHeader
                title={t`Edit Transaction`}
                onOpenChange={() => onClose?.()}
              />
            }
            footer={
              <LayoutFooter hasDivider padding={4}>
                <Stack
                  direction="horizontal"
                  hAlign="between"
                  vAlign="center"
                  gap={3}
                >
                  <Button
                    label={t`Delete`}
                    variant="destructive"
                    isDisabled={pending || deleting}
                    onClick={() => setConfirmDelete(true)}
                  />
                  <Stack direction="horizontal" gap={2}>
                    <Button
                      label={t`Cancel`}
                      isDisabled={pending || deleting}
                      onClick={() => onClose?.()}
                    />
                    <Button
                      label={pending ? t`Saving...` : t`Save Changes`}
                      variant="primary"
                      type="submit"
                      form="edit-shared-transaction-form"
                      isDisabled={pending || deleting}
                    />
                  </Stack>
                </Stack>
              </LayoutFooter>
            }
          >
            <LayoutContent>
              <Stack
                as="form"
                id="edit-shared-transaction-form"
                paddingBlock={4}
                gap={4}
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!pending && !deleting) void submit()
                }}
              >
                <TransactionFormFields
                  note={
                    <TextInput
                      label={t`Note`}
                      value={description}
                      onChange={setDescription}
                    />
                  }
                  date={
                    <FinanceDateInput
                      id="edit-date"
                      label={t`Date`}
                      value={date}
                      onChange={setDate}
                      onBlur={() => {}}
                      disabledDate={(d) =>
                        d > new Date() || d < new Date('1900-01-01')
                      }
                    />
                  }
                  options={
                    <>
                      <TransactionOption
                        option="pending"
                        value={transactionPending}
                        onChange={setTransactionPending}
                      />
                      <TransactionOption
                        option="exclude"
                        value={excluded}
                        onChange={setExcluded}
                      />
                    </>
                  }
                >
                  {!lots.length && (
                    <TransactionCategoryPicker
                      categories={categories}
                      name="category"
                      value={categoryId}
                      onValueChange={setCategoryId}
                      onBlur={() => {}}
                      invalid={attempted && !categoryId}
                    />
                  )}
                  {lots.map((lot, i) => (
                    <Fragment key={lot.id}>
                      <Grid columns={2} gap={4} align="start">
                        {editLotAccount(i)}
                        {editLotInvestment(i)}
                      </Grid>
                      <Grid columns={{ minWidth: 160, max: 3 }} gap={4}>
                        <EditAmount
                          name={`lot-${i}-shares`}
                          label={t`Shares`}
                          value={lot.amount}
                          currencyCode={
                            accountMap.get(lot.accountId)!.householdCurrency
                              .code
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
                        <EditAmount
                          name={`lot-${i}-price`}
                          label={t`Price per share`}
                          value={lot.price}
                          currencyCode={
                            accountMap.get(lot.accountId)!.householdCurrency
                              .code
                          }
                          scale={scaleFor(originalLots[i].price, 8)}
                          invalid={
                            attempted && !/^\d+(\.\d+)?$/.test(lot.price)
                          }
                          onChange={(price) =>
                            setLots((current) =>
                              current.map((l, index) =>
                                index === i ? { ...l, price } : l,
                              ),
                            )
                          }
                        />
                        {lots.length === 1 &&
                          entries.length === 1 &&
                          entryAmount(0)}
                      </Grid>
                    </Fragment>
                  ))}
                  {!(lots.length === 1 && entries.length === 1) &&
                    entries
                      .map((_, index) =>
                        transfer
                          ? index === 0
                            ? firstEntry
                            : 1 - firstEntry
                          : index,
                      )
                      .map((i) => (
                        <Grid
                          key={entries[i].id}
                          columns={{ minWidth: 240, max: 2 }}
                          gap={4}
                        >
                          {entryAccount(i)}
                          {(!sharedAmount || i === firstEntry) &&
                            entryAmount(i)}
                        </Grid>
                      ))}
                </TransactionFormFields>
                {saveError && <Text role="alert">{saveError}</Text>}
              </Stack>
            </LayoutContent>
          </Layout>
        </Stack>
        <TransactionDeleteConfirmation
          isOpen={confirmDelete}
          onOpenChange={setConfirmDelete}
          pending={pending || deleting}
          onDelete={onDelete}
        />
      </>
    )
  }

  return (
    <>
      <MobileTransactionComposer
        mode="edit"
        header={
          lots.length ? (
            lots.length === 2 ? (
              <>
                <Text type="label">
                  <Trans>Move</Trans>
                </Text>
                {investmentSymbol(sourceLot)}
                <Text type="supporting">
                  <Trans>from</Trans>
                </Text>
                {investmentAccount(sourceLot)}
                <Text type="supporting">
                  <Trans>to</Trans>
                </Text>
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
        onDeleteRequest={() => setConfirmDelete(true)}
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
                      ? t`${i === 0 ? t`From` : t`To`} shares`
                      : t`Shares`
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
                  label={t`Price per share`}
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
            {!transfer &&
              !lots.length &&
              entries.map((_, i) => entryAccount(i))}
            <Button
              label={t`Owner: ${transaction.user.name}`}
              isDisabled
              variant="secondary"
              tooltip={t`The transaction owner cannot be changed.`}
            >
              {transaction.user.name}
            </Button>
          </>
        }
        date={
          <FinanceDateInput
            id="date"
            label={t`Date`}
            value={date}
            onChange={setDate}
            onBlur={() => {}}
            disabledDate={(d) => d > new Date() || d < new Date('1900-01-01')}
          />
        }
        noteText={description}
        selectedOptions={[
          ...(transactionPending ? [t`Pending`] : []),
          ...(excluded ? [t`Exclude from reports`] : []),
        ]}
        note={
          <TextInput
            label={t`Note`}
            value={description}
            onChange={setDescription}
          />
        }
        options={
          <>
            <TransactionOption
              option="pending"
              value={transactionPending}
              onChange={setTransactionPending}
            />
            <TransactionOption
              option="exclude"
              value={excluded}
              onChange={setExcluded}
            />
          </>
        }
      />
      <TransactionDeleteConfirmation
        isOpen={confirmDelete}
        onOpenChange={setConfirmDelete}
        pending={pending || deleting}
        onDelete={onDelete}
      />
    </>
  )
}

function EditAccount({
  showBalance = false,
  disabled = false,
  amountName,
  name,
  label,
  value,
  accounts,
  onChange,
}: {
  showBalance?: boolean
  disabled?: boolean
  amountName: string
  name: string
  label: string
  value: Account
  accounts: readonly Account[]
  onChange: (account: Account) => void
}) {
  const financeLabel = useFinanceLabel()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const composer = useComposer()
  const choices = accounts.some((a) => a.id === value.id)
    ? accounts
    : [value, ...accounts]
  const icon = (a: Account) => (
    <AccountAvatar account={a} size={showBalance ? 'large' : 'small'} />
  )
  return (
    <SearchSelect
      name={name}
      label={label}
      isDisabled={disabled}
      items={choices}
      value={value}
      getLabel={(a) => a.name}
      getSearchText={(a) =>
        `${financeLabel(a.type)} ${a.householdCurrency.code}`
      }
      hideChipLabel
      confirmSelection
      renderChipIcon={icon}
      getChipDescription={
        showBalance
          ? (a) =>
              a.balance == null
                ? undefined
                : formatCurrencyWithPrivacyMode({
                    value: a.balance,
                    currencyCode: a.householdCurrency.code,
                  })
          : undefined
      }
      renderOption={(a) => (
        <Stack direction="horizontal" gap={2} vAlign="center">
          {icon(a)}
          <Stack gap={1}>
            <Text>{a.name}</Text>
            <Text type="supporting">
              {financeLabel(a.type)} · {a.householdCurrency.code}
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
  const composer = useComposer()
  if (!composer)
    return (
      <CurrencyInput
        id={name}
        aria-label={label}
        locale={household.locale}
        currency={currencyCode}
        value={value.replace('.', decimal)}
        decimalScale={scale}
        showCurrencySymbol={!shares}
        aria-invalid={invalid}
        onValueChange={({ value: raw }) => onChange(raw.replace(decimal, '.'))}
      />
    )
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
