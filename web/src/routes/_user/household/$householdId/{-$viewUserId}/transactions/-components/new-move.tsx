import { graphql } from 'relay-runtime'
import { useForm, useStore } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import currency from 'currency.js'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import { useMemo } from 'react'
import type { newMoveMutation } from './__generated__/newMoveMutation.graphql'
import type { newMoveFragment$key } from './__generated__/newMoveFragment.graphql'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { Calendar } from '@/components/ui/calendar'

const formSchema = z.object({
  description: z
    .string()
    .max(256, 'Description must be at most 256 characters.'),
  shares: z.number().positive('Shares must be positive'),
  pricePerShare: z.number().positive('Price per share must be positive'),
  datetime: z.date(),
  fromInvestmentId: z.string().min(1, 'Please select a from investment'),
  toInvestmentId: z.string().min(1, 'Please select a to investment'),
})

const newMoveFragment = graphql`
  fragment newMoveFragment on Household
  @argumentDefinitions(viewUserId: { type: "ID" }) {
    accounts(where: { archived: false, userID: $viewUserId }) {
      edges {
        node {
          id
          name
          type
          value
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

const newMoveMutation = graphql`
  mutation newMoveMutation($input: MoveInvestmentInputCustom!) {
    moveInvestment(input: $input) {
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

type NewMoveProps = {
  fragmentRef: newMoveFragment$key
}

export function NewMove({ fragmentRef }: NewMoveProps) {
  const data = useFragment(newMoveFragment, fragmentRef)

  const [commitMutation, isMutationInFlight] =
    useMutation<newMoveMutation>(newMoveMutation)

  const { household } = useHousehold()
  const { displayCurrencyCode } = useDisplayCurrency()

  // Get all investments from all investment accounts
  const allInvestments = useMemo(() => {
    return (
      data.accounts.edges
        ?.map((account) => {
          invariant(account?.node, 'Account node is null')
          return account.node
        })
        .filter((account) => account.type === 'investment')
        .flatMap((account) =>
          (account.investments ?? []).map((investment) => ({
            ...investment,
            accountName: account.name,
            currencyCode: account.householdCurrency.code,
          })),
        ) ?? []
    )
  }, [data.accounts.edges])

  // Find "Move" category
  const moveCategory = data.transactionCategories.edges
    ?.map((category) => {
      invariant(category?.node, 'Category node is null')
      return category.node
    })
    .find((category) => category.name === 'Move')

  invariant(moveCategory, 'Move category not found')

  const form = useForm({
    defaultValues: {
      description: '',
      shares: undefined as unknown as number,
      pricePerShare: undefined as unknown as number,
      datetime: new Date(),
      fromInvestmentId: '',
      toInvestmentId: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const fromInvestment = allInvestments.find(
        (inv) => inv.id === value.fromInvestmentId,
      )
      const toInvestment = allInvestments.find(
        (inv) => inv.id === value.toInvestmentId,
      )

      invariant(fromInvestment, 'From investment not found')
      invariant(toInvestment, 'To investment not found')

      // Validate same symbol
      if (fromInvestment.symbol !== toInvestment.symbol) {
        toast.error('Investments must have the same symbol')
        return
      }

      const result = await commitMutationResult<newMoveMutation>(
        commitMutation,
        {
          variables: {
            input: {
              transaction: {
                description: value.description,
                datetime: value.datetime.toISOString(),
                categoryID: moveCategory.id,
              },
              investmentLots: [
                {
                  amount: currency(value.shares).multiply(-1).toString(),
                  investmentID: value.fromInvestmentId,
                  price: value.pricePerShare.toString(),
                },
                {
                  amount: currency(value.shares).toString(),
                  investmentID: value.toInvestmentId,
                  price: value.pricePerShare.toString(),
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
            resultData.moveInvestment.node,
            'No data returned from mutation',
          )

          toast.success('Investment moved successfully!')
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
        })
        .exhaustive()
    },
  })

  const fromInvestmentId = useStore(
    form.store,
    (state) => state.values.fromInvestmentId,
  )

  const fromInvestment = allInvestments.find(
    (inv) => inv.id === fromInvestmentId,
  )

  // Filter to investments - only show investments with same symbol as fromInvestment
  const toInvestments = useMemo(() => {
    if (!fromInvestment) {
      return []
    }
    return allInvestments.filter(
      (inv) =>
        inv.symbol === fromInvestment.symbol && inv.id !== fromInvestment.id, // Exclude the from investment
    )
  }, [allInvestments, fromInvestment])

  return (
    <Card className="w-full">
      <CardContent>
        <form
          id="new-move-form"
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
                      placeholder="Move AAPL shares"
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
              name="fromInvestmentId"
              validators={{
                onChange: ({ value, fieldApi }) => {
                  if (!value) {
                    return undefined
                  }
                  const toInvestmentId =
                    fieldApi.form.getFieldValue('toInvestmentId')
                  if (toInvestmentId && value === toInvestmentId) {
                    // Trigger validation on toInvestmentId field
                    fieldApi.form.validateField('toInvestmentId', 'change')
                  } else if (toInvestmentId) {
                    // Clear error on toInvestmentId if it exists
                    fieldApi.form.validateField('toInvestmentId', 'change')
                  }
                  return undefined
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      From Investment
                    </FieldLabel>
                    <Combobox
                      items={allInvestments.map((inv) => inv.id)}
                      itemToStringLabel={(item) => {
                        const inv = allInvestments.find((i) => i.id === item)
                        return inv
                          ? `${inv.symbol} - ${inv.name} (${inv.accountName})`
                          : ''
                      }}
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value || '')
                        // Reset toInvestmentId when fromInvestmentId changes
                        form.setFieldValue('toInvestmentId', '')
                      }}
                    >
                      <ComboboxInput
                        data-1p-ignore
                        id={field.name}
                        name={field.name}
                        placeholder="Select investment to move from"
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No investments found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const inv = allInvestments.find(
                              (i) => i.id === item,
                            )
                            return (
                              <ComboboxItem key={item} value={item}>
                                {inv
                                  ? `${inv.symbol} - ${inv.name} (${inv.accountName})`
                                  : ''}
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
              name="toInvestmentId"
              validators={{
                onChange: ({ value, fieldApi }) => {
                  if (!value) {
                    return undefined
                  }
                  const fromInvestmentId =
                    fieldApi.form.getFieldValue('fromInvestmentId')
                  if (fromInvestmentId && value === fromInvestmentId) {
                    return {
                      message: 'Cannot move to the same investment',
                    }
                  }
                  return undefined
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>To Investment</FieldLabel>
                    <FieldDescription>
                      {fromInvestment
                        ? `Only showing investments with symbol: ${fromInvestment.symbol}`
                        : 'Select from investment first'}
                    </FieldDescription>
                    <Combobox
                      items={toInvestments.map((inv) => inv.id)}
                      itemToStringLabel={(item) => {
                        const inv = toInvestments.find((i) => i.id === item)
                        return inv
                          ? `${inv.symbol} - ${inv.name} (${inv.accountName})`
                          : ''
                      }}
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value || '')
                      }}
                      disabled={!fromInvestment}
                    >
                      <ComboboxInput
                        data-1p-ignore
                        id={field.name}
                        name={field.name}
                        placeholder={
                          fromInvestment
                            ? 'Select investment to move to'
                            : 'Select from investment first'
                        }
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        disabled={!fromInvestment}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>
                          No matching investments found.
                        </ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const inv = toInvestments.find((i) => i.id === item)
                            return (
                              <ComboboxItem key={item} value={item}>
                                {inv
                                  ? `${inv.symbol} - ${inv.name} (${inv.accountName})`
                                  : ''}
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
                    <FieldDescription>
                      Number of shares to move
                    </FieldDescription>
                    <Input
                      data-1p-ignore
                      id={field.name}
                      name={field.name}
                      type="number"
                      step="0.0001"
                      placeholder="0"
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const value = e.target.value
                        field.handleChange(value === '' ? 0 : Number(value))
                      }}
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
                      {fromInvestment
                        ? `Currency: ${fromInvestment.currencyCode}`
                        : 'Select from investment to see currency'}
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
                        fromInvestment?.currencyCode ?? displayCurrencyCode
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
            form="new-move-form"
          >
            {isMutationInFlight ? 'Moving...' : 'Move'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
