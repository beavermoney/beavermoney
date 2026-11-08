import { useLogTransaction } from '@/hooks/use-log-transaction'
import { MobileTransactionComposer } from '@/components/transaction-composer/composer'
import { useIsMobile } from '@/hooks/use-mobile'
import { useRef } from 'react'
import { Grid } from '@astryxdesign/core/Grid'
import { Text } from '@astryxdesign/core/Text'
import { FinanceDateInput } from '@/components/finance-date-input'
import { FormError } from '@/components/form-error'
import { Button } from '@astryxdesign/core/Button'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Stack } from '@astryxdesign/core/Stack'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm, useStore } from '@tanstack/react-form'
import currency from 'currency.js'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'
import type { newIncomeFragment$key } from './__generated__/newIncomeFragment.graphql'
import type { newIncomeMutation } from './__generated__/newIncomeMutation.graphql'
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
  amount: z.number().positive('Amount must be positive'),
  datetime: z.date(),
  ownerUserID: z.string().min(1, 'Please select an owner'),
  accountId: z.string().min(1, 'Please select an account'),
  categoryId: z.string().min(1, 'Please select a category'),
  excludeFromReports: z.boolean(),
})

const newIncomeFragment = graphql`
  fragment newIncomeFragment on Household
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

const newIncomeMutation = graphql`
  mutation newIncomeMutation($input: CreateIncomeInputCustom!) {
    createIncome(input: $input) {
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

type NewIncomeProps = {
  fragmentRef: newIncomeFragment$key
}

export function NewIncome({ fragmentRef }: NewIncomeProps) {
  const showToast = useToast()
  const isMobile = useIsMobile()
  const mobileSubmission = useRef<'close' | 'again' | null>(null)
  const { close: closeComposer } = useLogTransaction()

  const data = useFragment(newIncomeFragment, fragmentRef)

  const [commitMutation, isMutationInFlight] =
    useMutation<newIncomeMutation>(newIncomeMutation)

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

  // Filter categories - only income categories
  const incomeCategories =
    data.transactionCategories.edges
      ?.map((category) => {
        invariant(category?.node, 'Category node is null')
        return category.node
      })
      .filter((category) => category.type === 'income') ?? []
  const { displayCurrencyCode } = useDisplayCurrency()

  const form = useForm({
    defaultValues: {
      description: '',
      amount: undefined as unknown as number,
      datetime: new Date(),
      ownerUserID: defaultOwnerUserID,
      accountId: '',
      categoryId: '',
      excludeFromReports: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      // Amount is positive for income
      const amount = currency(formData.amount)

      const result = await commitMutationResult<newIncomeMutation>(
        commitMutation,
        {
          variables: {
            input: {
              transaction: {
                description: formData.description,
                datetime: formData.datetime.toISOString(),
                categoryID: formData.categoryId,
                excludeFromReports: formData.excludeFromReports,
                userID: formData.ownerUserID,
              },
              transactionEntry: {
                amount: amount.toString(),
                accountID: formData.accountId,
              },
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
            resultData.createIncome.node,
            'No data returned from mutation',
          )

          showToast({ type: 'info', body: 'Income created successfully!' })
          if (mobileSubmission.current === 'close') closeComposer()
          if (mobileSubmission.current === 'again') {
            form.reset({
              ...value,
              description: '',
              amount: undefined as unknown as number,
            })
          }
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  const selectedAccountId = useStore(
    form.store,
    (state) => state.values.accountId,
  )

  const selectedAccount = availableAccounts.find(
    (acc) => acc.id === selectedAccountId,
  )

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
                categories={incomeCategories}
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
    accountId: (
      <form.Field
        name="accountId"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              <TransactionAccountPicker
                preferredTypes={['liquidity', 'investment']}
                accounts={availableAccounts}
                name={field.name}
                label="Account"
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
    amount: (
      <form.Field
        name="amount"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
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
                  selectedAccount?.householdCurrency.code ?? displayCurrencyCode
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
                placeholder="Monthly salary"
                autoComplete="off"
                label={'Description'}

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
                label="Date"
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
    excludeFromReports: (
      <form.Field
        name="excludeFromReports"
        children={(field) => {
          return (
            <Stack direction="vertical" gap={2}>
              <CheckboxInput
                id={field.name}
                htmlName={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                label={'Exclude from reports'}
              />
            </Stack>
          )
        }}
      />
    ),
  }

  if (isMobile)
    return (
      <MobileTransactionComposer
        kind="income"
        category={fields.categoryId}
        firstAmount={'amount'}
        amounts={<>{fields.amount}</>}
        chips={
          <>
            {fields.accountId}
            {ownerOptions.length > 1 && fields.ownerUserID}
          </>
        }
        date={fields.datetime}
        details={
          <>
            {fields.description}
            {fields.excludeFromReports}
          </>
        }
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
          id="new-income-form"
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
              {fields.accountId}
              {fields.amount}
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
            <fieldset>
              <legend className="mb-2">
                <Text type="label">Options</Text>
              </legend>
              <Stack direction="vertical" gap={4} data-slot="checkbox-group">
                {fields.excludeFromReports}
              </Stack>
            </fieldset>
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
            form="new-income-form"
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
