import { graphql } from 'relay-runtime'
import { useForm, useStore } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import currency from 'currency.js'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import type { newTransferMutation } from './__generated__/newTransferMutation.graphql'
import type { newTransferFragment$key } from './__generated__/newTransferFragment.graphql'

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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { useHousehold } from '@/hooks/use-household'
import { useUser } from '@/hooks/use-user'
import { useDefaultOwnerUserID } from '@/hooks/use-default-owner-user-id'
import { useHouseholdMembers } from '@/hooks/use-household-members'
import { OwnerSelect } from '../../-components/owner-select'
import { CurrencyInput } from '@/components/currency-input'
import { commitMutationResult } from '@/lib/relay'
import { Calendar } from '@/components/ui/calendar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoDomainURL } from '@/lib/logo'
import { useCurrency } from '@/hooks/use-currency'
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
          name
          type
          icon
          value
          householdCurrency {
            code
          }
          user {
            name
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
  const data = useFragment(newTransferFragment, fragmentRef)

  const [commitMutation, isMutationInFlight] =
    useMutation<newTransferMutation>(newTransferMutation)

  const { household } = useHousehold()
  const { user } = useUser()

  const ownerOptions = useHouseholdMembers()
  const defaultOwnerUserID = useDefaultOwnerUserID(user.id)
  const { formatCurrencyWithPrivacyMode } = useCurrency()

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

          toast.success('Transfer created successfully!')
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
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

  const fromAccount = availableAccounts.find((acc) => acc.id === fromAccountId)
  const toAccount = availableAccounts.find((acc) => acc.id === toAccountId)

  const isDifferentCurrency =
    fromAccount &&
    toAccount &&
    fromAccount.householdCurrency.code !== toAccount.householdCurrency.code

  return (
    <Card className="w-full">
      <CardContent>
        <form
          id="new-transfer-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="categoryId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Combobox
                      items={transferCategories.map((cat) => cat.id)}
                      itemToStringLabel={(item) =>
                        transferCategories.find((cat) => cat.id === item)
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
                              {transferCategories.find((cat) => cat.id === item)
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
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>From Account</FieldLabel>
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
                        placeholder="Select from account"
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
                            if (!account) return null
                            return (
                              <ComboboxItem key={item} value={item}>
                                <Item size="xs" className="p-0">
                                  <ItemMedia variant="image">
                                    <Avatar className="size-6">
                                      <AvatarImage
                                        src={getLogoDomainURL(
                                          account.icon || '',
                                        )}
                                        alt={account.icon || 'unknown logo'}
                                      />
                                      <AvatarFallback>
                                        {account.name}
                                      </AvatarFallback>
                                    </Avatar>
                                  </ItemMedia>
                                  <ItemContent>
                                    <ItemTitle>{account.name}</ItemTitle>
                                    <ItemDescription>
                                      <span className="tabular-nums">
                                        {formatCurrencyWithPrivacyMode({
                                          value: account.value,
                                          currencyCode:
                                            account.householdCurrency.code,
                                          liability:
                                            account.type === 'liability',
                                        })}
                                      </span>
                                      <span aria-hidden="true"> · </span>
                                      {account.user.name}
                                    </ItemDescription>
                                  </ItemContent>
                                </Item>
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
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>To Account</FieldLabel>
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
                        placeholder="Select to account"
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
                            if (!account) return null
                            return (
                              <ComboboxItem key={item} value={item}>
                                <Item size="xs" className="p-0">
                                  <ItemMedia variant="image">
                                    <Avatar className="size-6">
                                      <AvatarImage
                                        src={getLogoDomainURL(
                                          account.icon || '',
                                        )}
                                        alt={account.icon || 'unknown logo'}
                                      />
                                      <AvatarFallback>
                                        {account.name}
                                      </AvatarFallback>
                                    </Avatar>
                                  </ItemMedia>
                                  <ItemContent>
                                    <ItemTitle>{account.name}</ItemTitle>
                                    <ItemDescription>
                                      <span className="tabular-nums">
                                        {formatCurrencyWithPrivacyMode({
                                          value: account.value,
                                          currencyCode:
                                            account.householdCurrency.code,
                                          liability:
                                            account.type === 'liability',
                                        })}
                                      </span>
                                      <span aria-hidden="true"> · </span>
                                      {account.user.name}
                                    </ItemDescription>
                                  </ItemContent>
                                </Item>
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
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                      <FieldDescription>
                        {fromAccount
                          ? `Currency: ${fromAccount.householdCurrency.code}`
                          : 'Select from account to see currency'}
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
                          fromAccount?.householdCurrency.code ??
                          displayCurrencyCode
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
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Debit Amount (From Account)
                        </FieldLabel>
                        <FieldDescription>
                          {fromAccount
                            ? `Currency: ${fromAccount.householdCurrency.code}`
                            : 'Select from account to see currency'}
                        </FieldDescription>
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
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
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
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Credit Amount (To Account)
                        </FieldLabel>
                        <FieldDescription>
                          {toAccount
                            ? `Currency: ${toAccount.householdCurrency.code}`
                            : 'Select to account to see currency'}
                        </FieldDescription>
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
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
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
                      placeholder="Transfer to savings"
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
            form="new-transfer-form"
          >
            {isMutationInFlight ? 'Creating...' : 'Create'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
