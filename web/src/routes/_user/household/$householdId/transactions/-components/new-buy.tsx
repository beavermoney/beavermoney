import { TransactionAccountPicker } from './transaction-account-picker'
import { TransactionInvestmentPicker } from './transaction-investment-picker'
import { graphql } from 'relay-runtime'
import { useForm, useStore } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import currency from 'currency.js'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import { useEffect, useMemo } from 'react'
import type { newBuyMutation } from './__generated__/newBuyMutation.graphql'
import type { newBuyFragment$key } from './__generated__/newBuyFragment.graphql'
import { useLogTransaction } from '@/hooks/use-log-transaction'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useHousehold } from '@/hooks/use-household'
import { useUser } from '@/hooks/use-user'
import { useDefaultOwnerUserID } from '@/hooks/use-default-owner-user-id'
import { useHouseholdMembers } from '@/hooks/use-household-members'
import { OwnerSelect } from '../../-components/owner-select'
import { CurrencyInput } from '@/components/currency-input'
import { commitMutationResult } from '@/lib/relay'
import { Calendar } from '@/components/ui/calendar'
import { useDisplayCurrency } from '@/hooks/use-display-currency'

const formSchema = z.object({
  description: z
    .string()
    .max(256, 'Description must be at most 256 characters.'),
  shares: z.number().positive('Shares must be positive'),
  pricePerShare: z.number().positive('Price per share must be positive'),
  totalPaid: z.number().positive('Total paid must be positive'),
  datetime: z.date(),
  ownerUserID: z.string().min(1, 'Please select an owner'),
  accountId: z.string().min(1, 'Please select an account'),
  investmentId: z.string().min(1, 'Please select an investment'),
})

const newBuyFragment = graphql`
  fragment newBuyFragment on Household
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

const newBuyMutation = graphql`
  mutation newBuyMutation($input: BuyInvestmentInputCustom!) {
    buyInvestment(input: $input) {
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

type NewBuyProps = {
  fragmentRef: newBuyFragment$key
}

export function NewBuy({ fragmentRef }: NewBuyProps) {
  const data = useFragment(newBuyFragment, fragmentRef)

  const [commitMutation, isMutationInFlight] =
    useMutation<newBuyMutation>(newBuyMutation)

  const { displayCurrencyCode } = useDisplayCurrency()

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

  // Find "Buy" category
  const buyCategory = data.transactionCategories.edges
    ?.map((category) => {
      invariant(category?.node, 'Category node is null')
      return category.node
    })
    .find((category) => category.name === 'Buy')

  invariant(buyCategory, 'Buy category not found')

  const form = useForm({
    defaultValues: {
      description: '',
      shares: undefined as unknown as number,
      pricePerShare: undefined as unknown as number,
      totalPaid: undefined as unknown as number,
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

      // Amount is negative for buying (cash going out)
      const amount = currency(formData.totalPaid, { precision: 8 }).multiply(-1)

      const result = await commitMutationResult<newBuyMutation>(
        commitMutation,
        {
          variables: {
            input: {
              transaction: {
                description: formData.description,
                datetime: formData.datetime.toISOString(),
                categoryID: buyCategory.id,
                userID: formData.ownerUserID,
              },
              transactionEntry: {
                amount: amount.toString(),
                accountID: formData.accountId,
              },
              investmentLot: {
                amount: formData.shares.toString(),
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
            resultData.buyInvestment.node,
            'No data returned from mutation',
          )

          toast.success('Buy transaction created successfully!')
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
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

  // Auto-calculate total paid when shares or price changes
  const shares = useStore(form.store, (state) => state.values.shares)
  const pricePerShare = useStore(
    form.store,
    (state) => state.values.pricePerShare,
  )

  // Update totalPaid when shares or pricePerShare changes
  useEffect(() => {
    if (shares && pricePerShare) {
      const computed = currency(shares, { precision: 8 }).multiply(
        currency(pricePerShare, { precision: 8 }),
      )
      form.setFieldValue('totalPaid', computed.value)
    }
  }, [shares, pricePerShare, form])

  const { defaults, setDefaults } = useLogTransaction()
  useEffect(() => {
    if (!defaults) return
    if (defaults.accountId !== undefined) {
      form.setFieldValue('accountId', defaults.accountId)
    }
    setDefaults(undefined)
  }, [defaults, form, setDefaults])

  return (
    <Card className="w-full">
      <CardContent>
        <form
          id="new-buy-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="accountId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field
                    data-invalid={isInvalid}
                    data-transaction-initial-focus
                  >
                    <FieldLabel htmlFor={field.name}>Account</FieldLabel>
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
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="investmentId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Investment</FieldLabel>
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
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="shares"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Shares</FieldLabel>
                    <CurrencyInput
                      data-1p-ignore
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      locale={household.locale}
                      currency={
                        selectedAccount?.householdCurrency.code ??
                        displayCurrencyCode
                      }
                      decimalScale={8}
                      showCurrencySymbol={false}
                      onBlur={field.handleBlur}
                      onValueChange={(values) => {
                        field.handleChange(values.floatValue!)
                      }}
                      aria-invalid={isInvalid}
                      placeholder="10"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="pricePerShare"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Price per Share
                    </FieldLabel>
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
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="totalPaid"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Total Paid</FieldLabel>
                    <CurrencyInput
                      id={field.name}
                      name={field.name}
                      placeholder="Total amount paid"
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
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="description"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Input
                      data-1p-ignore
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Buy AAPL shares"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
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
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Owner</FieldLabel>
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
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
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
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            id={field.name}
                            name={field.name}
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
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
                        }
                      />
                      <DropdownMenuContent className="w-auto p-0" side="top">
                        <Calendar
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            disabled={isMutationInFlight}
            type="submit"
            form="new-buy-form"
          >
            {isMutationInFlight ? 'Creating...' : 'Create'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
