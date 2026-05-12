import { graphql, useMutation } from 'react-relay'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { match } from 'ts-pattern'
import currency from 'currency.js'

import type { editTransactionEntryDialogUpdateMutation } from './__generated__/editTransactionEntryDialogUpdateMutation.graphql'

import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CurrencyInput } from '@/components/currency-input'
import { commitMutationResult } from '@/lib/relay'
import { getLogoDomainURL } from '@/lib/logo'
import { useCurrency } from '@/hooks/use-currency'
import { useHousehold } from '@/hooks/use-household'
import { useDisplayCurrency } from '@/hooks/use-display-currency'

const editTransactionEntryDialogUpdateMutation = graphql`
  mutation editTransactionEntryDialogUpdateMutation(
    $id: ID!
    $input: UpdateTransactionEntryInput!
  ) {
    updateTransactionEntry(id: $id, input: $input) {
      node {
        id
        amount
        accountID
        account {
          id
          balance
          value
          householdCurrency {
            id
            code
          }
        }
      }
    }
  }
`

const formSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  accountId: z.string().min(1, 'Please select an account'),
})

export type EditEntryAccount = {
  id: string
  name: string
  type: string
  icon: string | null
  value: string
  householdCurrency: { code: string }
}

type EditTransactionEntryDialogProps = {
  entryId: string
  currentAmount: string
  currentAccountId: string
  accounts: ReadonlyArray<EditEntryAccount>
  onClose: () => void
}

export function EditTransactionEntryDialog({
  entryId,
  currentAmount,
  currentAccountId,
  accounts,
  onClose,
}: EditTransactionEntryDialogProps) {
  const [commitUpdate, isUpdateInFlight] =
    useMutation<editTransactionEntryDialogUpdateMutation>(
      editTransactionEntryDialogUpdateMutation,
    )

  const { household } = useHousehold()
  const { displayCurrencyCode } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const originalSign = parseFloat(currentAmount) < 0 ? -1 : 1

  const form = useForm({
    defaultValues: {
      amount: Math.abs(parseFloat(currentAmount)),
      accountId: currentAccountId,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)
      const signedAmount = currency(formData.amount).multiply(originalSign)

      const result =
        await commitMutationResult<editTransactionEntryDialogUpdateMutation>(
          commitUpdate,
          {
            variables: {
              id: entryId,
              input: {
                amount: signedAmount.toString(),
                accountID: formData.accountId,
              },
            },
          },
        )

      match(result)
        .with({ status: 'success' }, () => {
          toast.success('Entry updated successfully!')
          onClose()
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
        })
        .exhaustive()
    },
  })

  const accountById = new Map(accounts.map((a) => [a.id, a]))

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Entry</DialogTitle>
        <DialogDescription>
          Update entry details. Switching the account also switches the
          entry&apos;s currency.
        </DialogDescription>
      </DialogHeader>

      <form
        id="edit-entry-form"
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
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Account</FieldLabel>
                  <Combobox
                    items={accounts.map((a) => a.id)}
                    itemToStringLabel={(item) =>
                      accountById.get(item)?.name ?? ''
                    }
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value || '')}
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
                          const account = accounts.find(
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
                              <span className="text-muted-foreground tabular-nums">
                                {account &&
                                  formatCurrencyWithPrivacyMode({
                                    value: account.value,
                                    currencyCode:
                                      account.householdCurrency.code,
                                    liability: account.type === 'liability',
                                  })}
                              </span>
                            </ComboboxItem>
                          )
                        }}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <form.Field
            name="amount"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              const selectedAccount = accounts.find(
                (a) => a.id === form.state.values.accountId,
              )
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                  <FieldDescription>
                    {selectedAccount
                      ? `Currency: ${selectedAccount.householdCurrency.code}`
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
                      selectedAccount?.householdCurrency.code ??
                      displayCurrencyCode
                    }
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </FieldGroup>
      </form>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-entry-form"
          disabled={isUpdateInFlight}
        >
          {isUpdateInFlight ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </>
  )
}
