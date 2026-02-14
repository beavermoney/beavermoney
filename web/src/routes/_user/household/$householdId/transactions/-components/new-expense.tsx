import { graphql } from 'relay-runtime'
import { useForm, useStore } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import currency from 'currency.js'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
// import { useNavigate } from '@tanstack/react-router'
import type { newExpenseMutation } from './__generated__/newExpenseMutation.graphql'
import type { newExpenseFragment$key } from './__generated__/newExpenseFragment.graphql'

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
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
  amount: z.number().positive('Amount must be positive'),
  datetime: z.date(),
  accountId: z.string().min(1, 'Please select an account'),
  categoryId: z.string().min(1, 'Please select a category'),
  excludeFromReports: z.boolean(),
})

const newExpenseFragment = graphql`
  fragment newExpenseFragment on Query {
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

const newExpenseMutation = graphql`
  mutation newExpenseMutation($input: CreateExpenseInputCustom!) {
    createExpense(input: $input) {
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

type NewExpenseProps = {
  fragmentRef: newExpenseFragment$key
}

export function NewExpense({ fragmentRef }: NewExpenseProps) {
  const data = useFragment(newExpenseFragment, fragmentRef)
  // const navigate = useNavigate()

  const [commitMutation, isMutationInFlight] =
    useMutation<newExpenseMutation>(newExpenseMutation)

  const { household } = useHousehold()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  // Filter accounts - show all non-investment accounts
  const availableAccounts =
    data.accounts.edges?.map((account) => {
      invariant(account?.node, 'Account node is null')
      return account.node
    }) ?? []

  // Filter categories - only expense categories
  const expenseCategories =
    data.transactionCategories.edges
      ?.map((category) => {
        invariant(category?.node, 'Category node is null')
        return category.node
      })
      .filter((category) => category.type === 'expense') ?? []

  const form = useForm({
    defaultValues: {
      description: '',
      amount: undefined as unknown as number,
      datetime: new Date(),
      accountId: '',
      categoryId: '',
      excludeFromReports: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      // Amount is negative for expenses
      const amount = currency(formData.amount).multiply(-1)

      const result = await commitMutationResult<newExpenseMutation>(
        commitMutation,
        {
          variables: {
            input: {
              transaction: {
                description: formData.description,
                datetime: formData.datetime.toISOString(),
                categoryID: formData.categoryId,
                excludeFromReports: formData.excludeFromReports,
              },
              transactionEntry: {
                amount: amount.toString(),
                accountID: formData.accountId,
              },
              fees: [],
            },
          },
        },
      )

      match(result)
        .with({ status: 'success' }, ({ data: resultData }) => {
          invariant(
            resultData.createExpense.node,
            'No data returned from mutation',
          )

          // form.reset()
          // navigate({
          //   from: '/household/$householdId/transactions/new',
          //   to: '/household/$householdId/transactions',
          // })
          toast.success('Expense created successfully!')
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

  const selectedAccount = availableAccounts.find(
    (acc) => acc.id === selectedAccountId,
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Expense</CardTitle>
        <CardDescription>Record a new expense transaction</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="new-expense-form"
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
                      placeholder="Coffee at Starbucks"
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
              name="categoryId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Combobox
                      items={expenseCategories.map((cat) => cat.id)}
                      itemToStringLabel={(item) =>
                        expenseCategories.find((cat) => cat.id === item)
                          ?.name || ''
                      }
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value || '')
                      }}
                    >
                      <ComboboxInput
                        data-1p-ignore
                        id={field.name}
                        name={field.name}
                        placeholder="Select a category"
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => (
                            <ComboboxItem key={item} value={item}>
                              {expenseCategories.find((cat) => cat.id === item)
                                ?.name || ''}
                            </ComboboxItem>
                          )}
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
              name="accountId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Account</FieldLabel>
                    <Combobox
                      items={availableAccounts.map((account) => account.id)}
                      itemToStringLabel={(item) =>
                        availableAccounts.find((acc) => acc.id === item)
                          ?.name || ''
                      }
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value || '')
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
                            const account = availableAccounts.find(
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
              name="amount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                    <FieldDescription>
                      {selectedAccount
                        ? `Currency: ${selectedAccount.currency.code}`
                        : 'Select an account to see currency'}
                    </FieldDescription>
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
                        selectedAccount?.currency.code ??
                        household.currency.code
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
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

            <FieldSet>
              <FieldLegend variant="label">Options</FieldLegend>
              <FieldGroup data-slot="checkbox-group">
                <form.Field
                  name="excludeFromReports"
                  children={(field) => {
                    return (
                      <Field orientation={'horizontal'}>
                        <Checkbox
                          id={field.name}
                          name={field.name}
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked === true)
                          }
                          onBlur={field.handleBlur}
                        />
                        <FieldLabel htmlFor={field.name}>
                          Exclude from reports
                        </FieldLabel>
                      </Field>
                    )
                  }}
                />
              </FieldGroup>
            </FieldSet>
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
            form="new-expense-form"
          >
            {isMutationInFlight ? 'Creating...' : 'Create'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
