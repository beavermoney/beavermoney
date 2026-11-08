import { FinanceCalendar } from '@/components/finance-calendar'
import { FormError } from '@/components/form-error'
import { Button } from '@astryxdesign/core/Button'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Popover } from '@astryxdesign/core/Popover'
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

const formSchema = z.object({
  description: z
    .string()
    .max(256, 'Description must be at most 256 characters.'),
  amount: z.number().optional(),
  debitAmount: z.number().optional(),
  creditAmount: z.number().optional(),
  datetime: z.date(),
  ownerUserID: z.string().min(1, 'Please select an owner'),
  fromAccountId: z.string().min(1, 'Please select a from account'),
  toAccountId: z.string().min(1, 'Please select a to account'),
  categoryId: z.string().min(1, 'Please select a category'),
})

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
  const showToast = useToast()

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

      invariant(fromAccount, 'From account not found')
      invariant(toAccount, 'To account not found')

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

          showToast({ type: 'info', body: 'Transfer created successfully!' })
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
                    <label htmlFor={field.name}>Category</label>
                    <TransactionCategoryPicker
                      categories={transferCategories}
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
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
                    <label htmlFor={field.name}>From Account</label>
                    <TransactionAccountPicker
                      accounts={availableAccounts}
                      name={field.name}
                      label="From Account"
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
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <form.Field
              name="toAccountId"
              validators={{
                onChange: ({ value, fieldApi }) => {
                  if (!value) {
                    return undefined // Let zod handle the "required" validation
                  }
                  const fromAccountId =
                    fieldApi.form.getFieldValue('fromAccountId')
                  if (fromAccountId && value === fromAccountId) {
                    return {
                      message: 'Cannot transfer to the same account',
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
                    <label htmlFor={field.name}>To Account</label>
                    <TransactionAccountPicker
                      accounts={availableAccounts.filter(
                        (account) => account.id !== fromAccountId,
                      )}
                      name={field.name}
                      label="To Account"
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
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            {!isDifferentCurrency ? (
              <form.Field
                name="amount"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value <= 0) {
                      return { message: 'Amount must be positive' }
                    }
                    return undefined
                  },
                }}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <CurrencyInput
                        id={field.name}
                        name={field.name}
                        placeholder="Please enter an amount"
                        onValueChange={(e) => {
                          field.handleChange(e.floatValue!)
                        }}
                        value={field.state.value}
                        locale={household.locale}
                        currency={
                          fromAccount?.householdCurrency.code ??
                          displayCurrencyCode
                        }
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
                  )
                }}
              />
            ) : (
              <>
                <form.Field
                  name="debitAmount"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value <= 0) {
                        return { message: 'Debit amount must be positive' }
                      }
                      return undefined
                    },
                  }}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Stack
                        direction="vertical"
                        gap={2}
                        data-invalid={isInvalid}
                      >
                        <CurrencyInput
                          id={field.name}
                          name={field.name}
                          placeholder="Amount to debit"
                          onValueChange={(e) => {
                            field.handleChange(e.floatValue!)
                          }}
                          value={field.state.value}
                          locale={household.locale}
                          currency={
                            fromAccount?.householdCurrency.code ??
                            displayCurrencyCode
                          }
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FormError errors={field.state.meta.errors} />
                        )}
                      </Stack>
                    )
                  }}
                />

                <form.Field
                  name="creditAmount"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value <= 0) {
                        return { message: 'Credit amount must be positive' }
                      }
                      return undefined
                    },
                  }}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Stack
                        direction="vertical"
                        gap={2}
                        data-invalid={isInvalid}
                      >
                        <CurrencyInput
                          id={field.name}
                          name={field.name}
                          placeholder="Amount to credit"
                          onValueChange={(e) => {
                            field.handleChange(e.floatValue!)
                          }}
                          value={field.state.value}
                          locale={household.locale}
                          currency={
                            toAccount?.householdCurrency.code ??
                            displayCurrencyCode
                          }
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FormError errors={field.state.meta.errors} />
                        )}
                      </Stack>
                    )
                  }}
                />
              </>
            )}
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
                      placeholder="Transfer to savings"
                      autoComplete="off"
                      label={'Description'}

                      value={String(field.state.value ?? '')}
                      onChange={(_value, event) =>
                        ((e) => field.handleChange(e.target.value))(event)
                      }
                      htmlName={field.name}
                    />
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            {ownerOptions.length > 1 && (
              <form.Field
                name="ownerUserID"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <OwnerSelect
                        id={field.name}
                        name={field.name}
                        options={ownerOptions}
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value)}
                        onBlur={field.handleBlur}
                        ariaInvalid={isInvalid}
                      />
                      {isInvalid && (
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
                  )
                }}
              />
            )}
            <form.Field
              name="datetime"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <label htmlFor={field.name}>Date</label>
                    <Popover
                      label="Choose value"
                      alignment={'start'}
                      content={
                        <>
                          <FinanceCalendar
                            mode="single"
                            selected={field.state.value}
                            onSelect={(date) => {
                              if (date) {
                                field.handleChange(date)
                              }
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                          />
                        </>
                      }
                    >
                      {(triggerProps) => (
                        <Button
                          {...triggerProps}
                          id={field.name}
                          name={field.name}
                          type="button"

                          label={String(
                            field.state.value.toLocaleDateString(
                              household.locale,
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              },
                            ),
                          )}
                          variant={'secondary'}
                        >
                          {field.state.value.toLocaleDateString(
                            household.locale,
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </Button>
                      )}
                    </Popover>
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
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
            label={'Reset'}
            variant={'secondary'}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="new-transfer-form"
            label={String(isMutationInFlight ? 'Creating...' : 'Create')}
            variant={'primary'}

            isDisabled={isMutationInFlight}
          >
            {isMutationInFlight ? 'Creating...' : 'Create'}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
