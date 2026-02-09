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

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { useHousehold } from '@/hooks/use-household'
import { CurrencyInput } from '@/components/currency-input'
import { commitMutationResult } from '@/lib/relay'
import { Calendar } from '@/components/ui/calendar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoDomainURL } from '@/lib/logo'
import { useCurrency } from '@/hooks/use-currency'

const formSchema = z.object({
  description: z
    .string()
    .max(256, 'Description must be at most 256 characters.'),
  shares: z.number().positive('Shares must be positive'),
  pricePerShare: z.number().positive('Price per share must be positive'),
  totalPaid: z.number().positive('Total paid must be positive'),
  datetime: z.date(),
  accountId: z.string().min(1, 'Please select an account'),
  investmentId: z.string().min(1, 'Please select an investment'),
})

const newBuyFragment = graphql`
  fragment newBuyFragment on Query {
    accounts {
      edges {
        node {
          id
          name
          type
          icon
          value
          currency {
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

  const { household } = useHousehold()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

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
      accountId: '',
      investmentId: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      // Amount is negative for buying (cash going out)
      const amount = currency(formData.totalPaid).multiply(-1)

      const result = await commitMutationResult<newBuyMutation>(
        commitMutation,
        {
          variables: {
            input: {
              transaction: {
                description: formData.description,
                datetime: formData.datetime.toISOString(),
                categoryID: buyCategory.id,
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
      const computed = currency(shares).multiply(pricePerShare)
      form.setFieldValue('totalPaid', computed.value)
    }
  }, [shares, pricePerShare, form])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Buy Investment</CardTitle>
        <CardDescription>Record buying shares of an investment</CardDescription>
      </CardHeader>
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

            <form.Field
              name="accountId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Account</FieldLabel>
                    <Combobox
                      items={investmentAccounts.map((account) => account.id)}
                      itemToStringLabel={(item) =>
                        investmentAccounts.find((acc) => acc.id === item)
                          ?.name || ''
                      }
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value || '')
                        // Reset investment when account changes
                        form.setFieldValue('investmentId', '')
                      }}
                    >
                      <ComboboxInput
                        data-1p-ignore
                        id={field.name}
                        name={field.name}
                        placeholder="Select an account"
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const account = investmentAccounts.find(
                              (acc) => acc.id === item,
                            )
                            return (
                              <ComboboxItem
                                key={item}
                                value={item}
                                className="flex items-center gap-2"
                              >
                                <Avatar className="size-5">
                                  <AvatarImage
                                    src={getLogoDomainURL(account?.icon || '')}
                                    alt={account?.icon || 'unknown logo'}
                                  />
                                  <AvatarFallback className="text-[8px]">
                                    {account?.name}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="flex-1">{account?.name}</span>
                                <span className="text-muted-foreground font-mono">
                                  {account &&
                                    formatCurrencyWithPrivacyMode({
                                      value: account.value,
                                      currencyCode: account.currency.code,
                                      liability: account.type === 'liability',
                                    })}
                                </span>
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
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
                    <Combobox
                      items={availableInvestments.map((inv) => inv.id)}
                      itemToStringLabel={(item) => {
                        const inv = availableInvestments.find(
                          (i) => i.id === item,
                        )
                        return inv ? `${inv.name} (${inv.symbol})` : ''
                      }}
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value || '')
                      }}
                      disabled={!selectedAccount}
                    >
                      <ComboboxInput
                        data-1p-ignore
                        id={field.name}
                        name={field.name}
                        placeholder={
                          selectedAccount
                            ? 'Select an investment'
                            : 'Select an account first'
                        }
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const inv = availableInvestments.find(
                              (i) => i.id === item,
                            )
                            return (
                              <ComboboxItem key={item} value={item}>
                                {inv ? `${inv.name} (${inv.symbol})` : ''}
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
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
                    <Input
                      data-1p-ignore
                      id={field.name}
                      name={field.name}
                      type="number"
                      step="any"
                      value={field.state.value || ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        field.handleChange(isNaN(val) ? 0 : val)
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
                    <FieldDescription>
                      {selectedAccount
                        ? `Currency: ${selectedAccount.currency.code}`
                        : 'Select an account to see currency'}
                    </FieldDescription>
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
                        selectedAccount?.currency.code ??
                        household.currency.code
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
                    <FieldDescription>
                      {selectedAccount
                        ? `Currency: ${selectedAccount.currency.code}`
                        : 'Computed from shares × price'}
                    </FieldDescription>
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
                        selectedAccount?.currency.code ??
                        household.currency.code
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
