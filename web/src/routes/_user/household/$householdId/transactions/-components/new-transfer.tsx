import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { ComposerTransferRows } from '@/components/transaction-composer/transfer-rows'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { MobileTransactionComposer } from '@/components/transaction-composer/composer'
import { useIsMobile } from '@/hooks/use-mobile'
import { useRef } from 'react'
import { Grid } from '@astryxdesign/core/Grid'
import { FinanceDateInput } from '@/components/finance-date-input'
import { FormError } from '@/components/form-error'
import { Button } from '@astryxdesign/core/Button'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Stack } from '@astryxdesign/core/Stack'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm, useStore } from '@tanstack/react-form'
import currency from 'currency.js'
import { useState } from 'react'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'
import type { newTransferFragment$key } from './__generated__/newTransferFragment.graphql'
import type { newTransferMutation } from './__generated__/newTransferMutation.graphql'
import { TransactionAccountPicker } from './transaction-account-picker'
import { TransactionCategoryPicker } from './transaction-category-picker'

import { CurrencyInput } from '@/components/currency-input'
import { useDefaultOwnerUserID } from '@/hooks/use-default-owner-user-id'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdMembers } from '@/hooks/use-household-members'
import { useUser } from '@/hooks/use-user'
import { commitMutationResult } from '@/lib/relay'
import { OwnerSelect } from '../../-components/owner-select'

import { useDisplayCurrency } from '@/hooks/use-display-currency'

const newTransferFragment = graphql`
  fragment newTransferFragment on Household
  @argumentDefinitions(viewUserIds: { type: "[ID!]" }) {
    accounts(where: { archived: false, userIDIn: $viewUserIds }) {
      edges {
        node {
          id
          type
          ...transactionAccountPickerFragment
          householdCurrency {
            code
          }
        }
      }
    }
    transactionCategories {
      edges {
        node {
          id
          type
          ...transactionCategoryPickerFragment
        }
      }
    }
  }
`

const newTransferMutation = graphql`
  mutation newTransferMutation($input: CreateTransferInputCustom!) {
    createTransfer(input: $input) {
      node {
        ...transactionCardFragment
        id
        description
        datetime
        category {
          name
        }
      }
    }
  }
`

type NewTransferProps = {
  fragmentRef: newTransferFragment$key
}

export function NewTransfer({ fragmentRef }: NewTransferProps) {
  const { t } = useLingui()
  const formSchema = z.object({
    description: z
      .string()
      .max(256, t`Description must be at most 256 characters.`),
    amount: z.number().optional(),
    debitAmount: z.number().optional(),
    creditAmount: z.number().optional(),
    datetime: z.date(),
    ownerUserID: z.string().min(1, t`Please select an owner`),
    fromAccountId: z.string().min(1, t`Please select a from account`),
    toAccountId: z.string().min(1, t`Please select a to account`),
    categoryId: z.string().min(1, t`Please select a category`),
  })

  const showToast = useToast()
  const isMobile = useIsMobile()
  const mobileSubmission = useRef<'close' | 'again' | null>(null)
  const { close: closeComposer } = useLogTransaction()

  const data = useFragment(newTransferFragment, fragmentRef)

  const [commitMutation, isMutationInFlight] =
    useMutation<newTransferMutation>(newTransferMutation)

  const { household } = useHousehold()
  const { user } = useUser()

  const ownerOptions = useHouseholdMembers()
  const defaultOwnerUserID = useDefaultOwnerUserID(user.id)
  // Filter accounts - show all non-investment accounts
  const availableAccounts =
    data.accounts.edges?.map((account) => {
      invariant(account?.node, 'Account node is null')
      return account.node
    }) ?? []

  // Filter categories - only transfer categories
  const transferCategories =
    data.transactionCategories.edges
      ?.map((category) => {
        invariant(category?.node, 'Category node is null')
        return category.node
      })
      .filter((category) => category.type === 'transfer') ?? []

  const defaultValues: z.infer<typeof formSchema> = {
    description: '',
    amount: undefined,
    debitAmount: undefined,
    creditAmount: undefined,
    datetime: new Date(),
    ownerUserID: defaultOwnerUserID,
    fromAccountId: '',
    toAccountId: '',
    categoryId: '',
  }

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const fromAccount = availableAccounts.find(
        (acc) => acc.id === value.fromAccountId,
      )
      const toAccount = availableAccounts.find(
        (acc) => acc.id === value.toAccountId,
      )

      invariant(fromAccount, t`From account not found`)
      invariant(toAccount, t`To account not found`)

      const isDifferentCurrency =
        fromAccount.householdCurrency.code !== toAccount.householdCurrency.code

      // For transfers:
      // - From account gets negative amount (money going out)
      // - To account gets positive amount (money coming in)
      const fromAmount = isDifferentCurrency
        ? currency(value.debitAmount!).multiply(-1)
        : currency(value.amount!).multiply(-1)
      const toAmount = isDifferentCurrency
        ? currency(value.creditAmount!)
        : currency(value.amount!)

      const result = await commitMutationResult<newTransferMutation>(
        commitMutation,
        {
          variables: {
            input: {
              transaction: {
                description: value.description,
                datetime: value.datetime.toISOString(),
                categoryID: value.categoryId,
                userID: value.ownerUserID,
              },
              transactionEntries: [
                {
                  amount: fromAmount.toString(),
                  accountID: value.fromAccountId,
                },
                {
                  amount: toAmount.toString(),
                  accountID: value.toAccountId,
                },
              ],
              fees: [],
            },
          },

          updater: (store) => {
            store.get(household.id)?.invalidateRecord()
          },
        },
      )

      match(result)
        .with({ status: 'success' }, ({ data: resultData }) => {
          invariant(
            resultData.createTransfer.node,
            'No data returned from mutation',
          )

          showToast({ type: 'info', body: t`Transfer created successfully!` })
          if (mobileSubmission.current === 'close') closeComposer()
          if (mobileSubmission.current === 'again') {
            form.reset({
              ...value,
              description: '',
              amount: undefined as unknown as number,
              debitAmount: undefined as unknown as number,
              creditAmount: undefined as unknown as number,
            })
          }
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  const { displayCurrencyCode } = useDisplayCurrency()

  const fromAccountId = useStore(
    form.store,
    (state) => state.values.fromAccountId,
  )

  const toAccountId = useStore(form.store, (state) => state.values.toAccountId)

  const [editingAccount, setEditingAccount] = useState<
    'fromAccountId' | 'toAccountId' | null
  >(null)
  const activeAccountPicker = !fromAccountId
    ? 'fromAccountId'
    : (editingAccount ?? (!toAccountId ? 'toAccountId' : null))

  const fromAccount = availableAccounts.find((acc) => acc.id === fromAccountId)
  const toAccount = availableAccounts.find((acc) => acc.id === toAccountId)

  const isDifferentCurrency =
    fromAccount &&
    toAccount &&
    fromAccount.householdCurrency.code !== toAccount.householdCurrency.code

  const fields = {
    categoryId: (
      <form.Field
        name="categoryId"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack
              direction="vertical"
              gap={2}
              data-invalid={isInvalid}
              data-transaction-initial-focus
            >
              <TransactionCategoryPicker
                categories={transferCategories}
                name={field.name}
                value={field.state.value}
                onValueChange={field.handleChange}
                onBlur={field.handleBlur}
                invalid={isInvalid}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    fromAccountId: (
      <form.Field
        name="fromAccountId"
        validators={{
          onChange: ({ value, fieldApi }) => {
            if (!value) {
              return undefined
            }
            const toAccountId = fieldApi.form.getFieldValue('toAccountId')
            if (toAccountId && value === toAccountId) {
              // Trigger validation on toAccountId field to show error there
              fieldApi.form.validateField('toAccountId', 'change')
            } else if (toAccountId) {
              // Clear error on toAccountId if it exists
              fieldApi.form.validateField('toAccountId', 'change')
            }
            return undefined
          },
        }}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              <TransactionAccountPicker
                accounts={availableAccounts}
                name={field.name}
                label={t`From Account`}
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value)
                  setEditingAccount(null)
                  if (value === toAccountId)
                    form.setFieldValue('toAccountId', '')
                }}
                onBlur={field.handleBlur}
                invalid={isInvalid}
                expanded={activeAccountPicker === 'fromAccountId'}
                onExpand={() => setEditingAccount('fromAccountId')}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    amount: (
      <form.Field
        name="amount"
        validators={{
          onChange: ({ value }) => {
            if (!value || value <= 0) {
              return { message: t`Amount must be positive` }
            }
            return undefined
          },
        }}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              <CurrencyInput
                aria-label={t`Amount`}
                id={field.name}
                name={field.name}
                placeholder={t`Please enter an amount`}
                onValueChange={(e) => {
                  field.handleChange(e.floatValue!)
                }}
                value={field.state.value}
                locale={household.locale}
                currency={
                  fromAccount?.householdCurrency.code ?? displayCurrencyCode
                }
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    debitAmount: (
      <form.Field
        name="debitAmount"
        validators={{
          onChange: ({ value }) => {
            if (!value || value <= 0) {
              return { message: t`Debit amount must be positive` }
            }
            return undefined
          },
        }}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              <CurrencyInput
                aria-label={t`Debit Amount`}
                id={field.name}
                name={field.name}
                placeholder={t`Amount to debit`}
                onValueChange={(e) => {
                  field.handleChange(e.floatValue!)
                }}
                value={field.state.value}
                locale={household.locale}
                currency={
                  fromAccount?.householdCurrency.code ?? displayCurrencyCode
                }
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    toAccountId: (
      <form.Field
        name="toAccountId"
        validators={{
          onChange: ({ value, fieldApi }) => {
            if (!value) {
              return undefined // Let zod handle the "required" validation
            }
            const fromAccountId = fieldApi.form.getFieldValue('fromAccountId')
            if (fromAccountId && value === fromAccountId) {
              return {
                message: t`Cannot transfer to the same account`,
              }
            }
            return undefined
          },
        }}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              <TransactionAccountPicker
                accounts={availableAccounts.filter(
                  (account) => account.id !== fromAccountId,
                )}
                name={field.name}
                label={t`To Account`}
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value)
                  setEditingAccount(null)
                }}
                onBlur={field.handleBlur}
                invalid={isInvalid}
                expanded={activeAccountPicker === 'toAccountId'}
                onExpand={() => setEditingAccount('toAccountId')}
                disabled={!fromAccountId}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    creditAmount: (
      <form.Field
        name="creditAmount"
        validators={{
          onChange: ({ value }) => {
            if (!value || value <= 0) {
              return { message: t`Credit amount must be positive` }
            }
            return undefined
          },
        }}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              <CurrencyInput
                aria-label={t`Credit Amount`}
                id={field.name}
                name={field.name}
                placeholder={t`Amount to credit`}
                onValueChange={(e) => {
                  field.handleChange(e.floatValue!)
                }}
                value={field.state.value}
                locale={household.locale}
                currency={
                  toAccount?.householdCurrency.code ?? displayCurrencyCode
                }
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    description: (
      <form.Field
        name="description"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              <TextInput
                data-1p-ignore
                id={field.name}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
                placeholder={t`Transfer to savings`}
                autoComplete="off"
                label={t`Description`}

                value={String(field.state.value ?? '')}
                onChange={(_value, event) =>
                  ((e) => field.handleChange(e.target.value))(event)
                }
                htmlName={field.name}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    ownerUserID: (
      <form.Field
        name="ownerUserID"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              <OwnerSelect
                id={field.name}
                name={field.name}
                options={ownerOptions}
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
                onBlur={field.handleBlur}
                ariaInvalid={isInvalid}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    datetime: (
      <form.Field
        name="datetime"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack
              direction="vertical"
              width={isMobile ? undefined : '100%'}
              gap={2}
              data-invalid={isInvalid}
            >
              <FinanceDateInput
                id={field.name}
                label={t`Date`}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                disabledDate={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
  }

  if (isMobile)
    return (
      <MobileTransactionComposer
        kind="transfer"
        category={fields.categoryId}
        firstAmount={isDifferentCurrency ? 'debitAmount' : 'amount'}
        entryRows={
          <ComposerTransferRows
            fromAccount={fields.fromAccountId}
            fromAmount={
              isDifferentCurrency ? fields.debitAmount : fields.amount
            }
            toAccount={fields.toAccountId}
            toAmount={isDifferentCurrency ? fields.creditAmount : undefined}
          />
        }
        chips={ownerOptions.length > 1 && fields.ownerUserID}
        date={fields.datetime}
        details={<>{fields.description}</>}
        pending={isMutationInFlight}
        onSave={async (again) => {
          mobileSubmission.current = again ? 'again' : 'close'
          try {
            await form.handleSubmit()
            return form.state.isValid
          } finally {
            mobileSubmission.current = null
          }
        }}
      />
    )

  return (
    <Stack direction="vertical" gap={6}>
      <Stack direction="vertical" gap={4}>
        <Stack
          as="form"
          direction="vertical"
          gap={6}
          id="new-transfer-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FormLayout>
            {fields.categoryId}
            <Grid
              columns={{ minWidth: 240, max: 2 }}
              gap={4}
              align="start"
              justify="stretch"
            >
              {fields.fromAccountId}
              {!isDifferentCurrency ? fields.amount : fields.debitAmount}
            </Grid>
            <Grid
              columns={isDifferentCurrency ? { minWidth: 240, max: 2 } : 1}
              gap={4}
              align="start"
              justify="stretch"
            >
              {fields.toAccountId}
              {isDifferentCurrency && fields.creditAmount}
            </Grid>
            {fields.description}
            <Grid
              columns={{ minWidth: 240, max: 2, repeat: 'fit' }}
              gap={4}
              align="start"
              justify="stretch"
            >
              {ownerOptions.length > 1 && fields.ownerUserID}
              {fields.datetime}
            </Grid>
          </FormLayout>
        </Stack>
      </Stack>
      <Stack
        direction="horizontal"
        gap={3}
        align="center"
        wrap="wrap"
        justify="end"
        as="footer"
      >
        <Stack direction="horizontal" gap={2} wrap="wrap">
          <Button
            type="button"
            onClick={() => form.reset()}
            label={t`Reset`}
            variant={'secondary'}
          >
            <Trans>Reset</Trans>
          </Button>
          <Button
            type="submit"
            form="new-transfer-form"
            label={String(isMutationInFlight ? t`Creating...` : t`Create`)}
            variant={'primary'}

            isDisabled={isMutationInFlight}
          >
            {isMutationInFlight ? t`Creating...` : t`Create`}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
