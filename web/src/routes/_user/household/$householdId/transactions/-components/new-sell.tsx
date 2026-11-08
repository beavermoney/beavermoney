import { Grid } from '@astryxdesign/core/Grid'
import { FinanceDateInput } from '@/components/finance-date-input'
import { FormError } from '@/components/form-error'
import { Button } from '@astryxdesign/core/Button'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Stack } from '@astryxdesign/core/Stack'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm, useStore } from '@tanstack/react-form'
import currency from 'currency.js'
import { useEffect, useMemo } from 'react'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'
import type { newSellFragment$key } from './__generated__/newSellFragment.graphql'
import type { newSellMutation } from './__generated__/newSellMutation.graphql'
import { TransactionAccountPicker } from './transaction-account-picker'
import { TransactionInvestmentPicker } from './transaction-investment-picker'

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
  shares: z.number().positive('Shares must be positive'),
  pricePerShare: z.number().positive('Price per share must be positive'),
  totalReceived: z.number().positive('Total received must be positive'),
  datetime: z.date(),
  ownerUserID: z.string().min(1, 'Please select an owner'),
  accountId: z.string().min(1, 'Please select an account'),
  investmentId: z.string().min(1, 'Please select an investment'),
})

const newSellFragment = graphql`
  fragment newSellFragment on Household
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
          investments {
            id
            ...transactionInvestmentPickerFragment
          }
        }
      }
    }
    transactionCategories {
      edges {
        node {
          id
          name
          type
        }
      }
    }
  }
`

const newSellMutation = graphql`
  mutation newSellMutation($input: SellInvestmentInputCustom!) {
    sellInvestment(input: $input) {
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

type NewSellProps = {
  fragmentRef: newSellFragment$key
}

export function NewSell({ fragmentRef }: NewSellProps) {
  const showToast = useToast()

  const data = useFragment(newSellFragment, fragmentRef)

  const [commitMutation, isMutationInFlight] =
    useMutation<newSellMutation>(newSellMutation)

  const { household } = useHousehold()
  const { user } = useUser()

  const ownerOptions = useHouseholdMembers()
  const defaultOwnerUserID = useDefaultOwnerUserID(user.id)
  // Filter accounts - only investment accounts
  const investmentAccounts =
    data.accounts.edges
      ?.map((account) => {
        invariant(account?.node, 'Account node is null')
        return account.node
      })
      .filter((account) => account.type === 'investment') ?? []

  // Find "Sell" category
  const sellCategory = data.transactionCategories.edges
    ?.map((category) => {
      invariant(category?.node, 'Category node is null')
      return category.node
    })
    .find((category) => category.name === 'Sell')

  invariant(sellCategory, 'Sell category not found')

  const { displayCurrencyCode } = useDisplayCurrency()

  const form = useForm({
    defaultValues: {
      description: '',
      shares: undefined as unknown as number,
      pricePerShare: undefined as unknown as number,
      totalReceived: undefined as unknown as number,
      datetime: new Date(),
      ownerUserID: defaultOwnerUserID,
      accountId: '',
      investmentId: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      // Amount is positive for selling (cash coming in)
      const amount = currency(formData.totalReceived, { precision: 8 })

      const result = await commitMutationResult<newSellMutation>(
        commitMutation,
        {
          variables: {
            input: {
              transaction: {
                description: formData.description,
                datetime: formData.datetime.toISOString(),
                categoryID: sellCategory.id,
                userID: formData.ownerUserID,
              },
              transactionEntry: {
                amount: amount.toString(),
                accountID: formData.accountId,
              },
              investmentLot: {
                amount: currency(formData.shares, { precision: 8 })
                  .multiply(-1)
                  .toString(),
                price: formData.pricePerShare.toString(),
                investmentID: formData.investmentId,
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
            resultData.sellInvestment.node,
            'No data returned from mutation',
          )

          showToast({
            type: 'info',
            body: 'Sell transaction created successfully!',
          })
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

  const selectedAccount = investmentAccounts.find(
    (acc) => acc.id === selectedAccountId,
  )

  // Get available investments for selected account
  const availableInvestments = useMemo(() => {
    if (!selectedAccount) return []
    return selectedAccount.investments ?? []
  }, [selectedAccount])

  // Auto-calculate total received when shares or price changes
  const shares = useStore(form.store, (state) => state.values.shares)
  const pricePerShare = useStore(
    form.store,
    (state) => state.values.pricePerShare,
  )

  // Update totalReceived when shares or pricePerShare changes
  useEffect(() => {
    if (shares && pricePerShare) {
      const computed = currency(shares, { precision: 8 }).multiply(
        currency(pricePerShare, { precision: 8 }),
      )
      form.setFieldValue('totalReceived', computed.value)
    }
  }, [shares, pricePerShare, form])

  return (
    <Stack direction="vertical" gap={6}>
      <Stack direction="vertical" gap={4}>
        <Stack
          as="form"
          direction="vertical"
          gap={6}
          id="new-sell-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FormLayout>
            <form.Field
              name="accountId"
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
                    <TransactionAccountPicker
                      accounts={investmentAccounts}
                      name={field.name}
                      label="Account"
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value)
                        form.setFieldValue('investmentId', '')
                      }}
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
              name="investmentId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <TransactionInvestmentPicker
                      investments={availableInvestments}
                      name={field.name}
                      label="Investment"
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      invalid={isInvalid}
                      disabled={!selectedAccount}
                    />
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <Grid
              columns={{ minWidth: 160, max: 3 }}
              gap={4}
              align="start"
              justify="stretch"
            >
              <form.Field
                name="shares"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <NumberInput
                        data-1p-ignore
                        id={field.name}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        placeholder="10"
                        autoComplete="off"
                        label={'Shares'}

                        htmlName={field.name}
                        value={
                          field.state.value === undefined
                            ? null
                            : field.state.value
                        }
                        onChange={(value) => field.handleChange(value)}
                        step={0.0001}
                      />
                      {isInvalid && (
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
                  )
                }}
              />
              <form.Field
                name="pricePerShare"
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
                        placeholder="Please enter a price"
                        onValueChange={(e) => {
                          field.handleChange(e.floatValue!)
                        }}
                        value={field.state.value}
                        locale={household.locale}
                        currency={
                          selectedAccount?.householdCurrency.code ??
                          displayCurrencyCode
                        }
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        decimalScale={8}
                      />
                      {isInvalid && (
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
                  )
                }}
              />
              <form.Field
                name="totalReceived"
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
                        placeholder="Total amount received"
                        onValueChange={(e) => {
                          field.handleChange(e.floatValue!)
                        }}
                        value={field.state.value}
                        locale={household.locale}
                        currency={
                          selectedAccount?.householdCurrency.code ??
                          displayCurrencyCode
                        }
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        decimalScale={8}
                      />
                      {isInvalid && (
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
                  )
                }}
              />
            </Grid>
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
                      placeholder="Sell AAPL shares"
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
            <Grid
              columns={{ minWidth: 240, max: 2, repeat: 'fit' }}
              gap={4}
              align="start"
              justify="stretch"
            >
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
                    <Stack
                      direction="vertical"
                      width="100%"
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
                      {isInvalid && (
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
                  )
                }}
              />
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
            label={'Reset'}
            variant={'secondary'}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="new-sell-form"
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
