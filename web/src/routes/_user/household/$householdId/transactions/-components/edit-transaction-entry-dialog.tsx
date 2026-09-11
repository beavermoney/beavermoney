import { graphql, useFragment, useMutation } from 'react-relay'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { match } from 'ts-pattern'
import currency from 'currency.js'

import type { editTransactionEntryDialogUpdateMutation } from './__generated__/editTransactionEntryDialogUpdateMutation.graphql'
import type { editTransactionEntryDialogAccountsFragment$key } from './__generated__/editTransactionEntryDialogAccountsFragment.graphql'

import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { CurrencyInput } from '@/components/currency-input'
import { commitMutationResult } from '@/lib/relay'
import { useHousehold } from '@/hooks/use-household'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { TransactionAccountPicker } from './transaction-account-picker'

const editTransactionEntryDialogAccountsFragment = graphql`
  fragment editTransactionEntryDialogAccountsFragment on Household
  @argumentDefinitions(viewUserIds: { type: "[ID!]" }) {
    accounts(where: { archived: false, userIDIn: $viewUserIds }) {
      edges {
        node {
          id
          householdCurrency {
            code
          }
          ...transactionAccountPickerFragment
        }
      }
    }
  }
`

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

type EditTransactionEntryDialogProps = {
  entryId: string
  currentAmount: string
  currentAccountId: string
  householdRef: editTransactionEntryDialogAccountsFragment$key
  onClose: () => void
}

export function EditTransactionEntryDialog({
  entryId,
  currentAmount,
  currentAccountId,
  householdRef,
  onClose,
}: EditTransactionEntryDialogProps) {
  const accountsData = useFragment(
    editTransactionEntryDialogAccountsFragment,
    householdRef,
  )
  const accounts =
    accountsData.accounts.edges?.flatMap((edge) =>
      edge?.node ? [edge.node] : [],
    ) ?? []

  const [commitUpdate, isUpdateInFlight] =
    useMutation<editTransactionEntryDialogUpdateMutation>(
      editTransactionEntryDialogUpdateMutation,
    )

  const { household } = useHousehold()
  const { displayCurrencyCode } = useDisplayCurrency()

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
            updater: (store) => {
              store.get(household.id)?.invalidateRecord()
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
                  <TransactionAccountPicker
                    accounts={accounts}
                    name={field.name}
                    value={field.state.value}
                    label="Account"
                    onValueChange={field.handleChange}
                    onBlur={field.handleBlur}
                    invalid={isInvalid}
                  />
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
