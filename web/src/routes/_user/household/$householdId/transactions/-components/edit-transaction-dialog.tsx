import { graphql, useLazyLoadQuery, useMutation } from 'react-relay'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { match } from 'ts-pattern'
import invariant from 'tiny-invariant'
import { useState } from 'react'
import { AlertTriangleIcon } from 'lucide-react'

import type { editTransactionDialogUpdateMutation } from './__generated__/editTransactionDialogUpdateMutation.graphql'
import type { editTransactionDialogDeleteMutation } from './__generated__/editTransactionDialogDeleteMutation.graphql'

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogContent,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Field,
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
import { Calendar } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { commitMutationResult } from '@/lib/relay'
import { InvestmentLotCard } from './investment-lot-card'
import { TransactionEntryCard } from './transaction-entry-card'
import { useHousehold } from '@/hooks/use-household'
import { editTransactionDialogQuery } from './__generated__/editTransactionDialogQuery.graphql'
import { useNavigate } from '@tanstack/react-router'

const EditTransactionDialogQuery = graphql`
  query editTransactionDialogQuery($transactionId: ID!) {
    node(id: $transactionId) {
      __typename
      ... on Transaction {
        id
        description
        datetime
        categoryID
        category {
          id
          name
          type
        }
        investmentLots {
          ...investmentLotCardFragment
          id
        }
        transactionEntries {
          ...transactionEntryCardFragment
          id
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

const editTransactionDialogUpdateMutation = graphql`
  mutation editTransactionDialogUpdateMutation(
    $id: ID!
    $input: UpdateTransactionInput!
  ) {
    updateTransaction(id: $id, input: $input) {
      node {
        id
        description
        datetime
        categoryID
        category {
          id
          name
          type
          icon
        }
        ...transactionCardFragment
      }
    }
  }
`

const editTransactionDialogDeleteMutation = graphql`
  mutation editTransactionDialogDeleteMutation($id: ID!) {
    deleteTransaction(id: $id)
  }
`
const formSchema = z.object({
  description: z
    .string()
    .max(256, 'Description must be at most 256 characters.'),
  datetime: z.date(),
  categoryId: z.string().min(1, 'Please select a category'),
})

type EditTransactionDialogProps = {
  transactionId: string
}

export function EditTransactionDialog({
  transactionId,
}: EditTransactionDialogProps) {
  const data = useLazyLoadQuery<editTransactionDialogQuery>(
    EditTransactionDialogQuery,
    {
      transactionId,
    },
  )

  const categoriesData = data
  const transaction = data.node
  invariant(transaction?.__typename === 'Transaction')

  const navigate = useNavigate()

  const { household } = useHousehold()

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  const [commitUpdate, isUpdateInFlight] =
    useMutation<editTransactionDialogUpdateMutation>(
      editTransactionDialogUpdateMutation,
    )

  const [commitDelete, isDeleteInFlight] =
    useMutation<editTransactionDialogDeleteMutation>(
      editTransactionDialogDeleteMutation,
    )

  // Get all categories
  const allCategories =
    categoriesData.transactionCategories.edges
      ?.map((category) => {
        invariant(category?.node, 'Category node is null')
        return category.node
      })
      .filter((cat) => {
        // Filter based on current transaction category type
        return cat.type === transaction.category.type
      }) ?? []

  const form = useForm({
    defaultValues: {
      description: transaction.description ?? '',
      datetime: new Date(transaction.datetime),
      categoryId: transaction.categoryID,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const result =
        await commitMutationResult<editTransactionDialogUpdateMutation>(
          commitUpdate,
          {
            variables: {
              id: transaction.id,
              input: {
                description: formData.description || null,
                datetime: formData.datetime.toISOString(),
                categoryID: formData.categoryId,
              },
            },
          },
        )

      match(result)
        .with({ status: 'success' }, () => {
          toast.success('Transaction updated successfully!')
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
        })
        .exhaustive()
    },
  })

  const handleDelete = async () => {
    const result =
      await commitMutationResult<editTransactionDialogDeleteMutation>(
        commitDelete,
        {
          variables: {
            id: transaction.id,
          },
        },
      )

    match(result)
      .with({ status: 'success' }, () => {
        toast.success('Transaction deleted successfully!')
        navigate({
          to: '.',
          search: (old) => ({ ...old, edit_transaction_id: null }),
          replace: true,
        })
        setDeleteAlertOpen(false)
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
        setDeleteAlertOpen(false)
      })
      .exhaustive()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogDescription>
          Update transaction details. Click on entries or lots below to edit
          them individually (coming soon).
        </DialogDescription>
      </DialogHeader>

      <div>
        {(transaction.investmentLots ?? []).map((lot, index) => (
          <div>
            <InvestmentLotCard
              fragmentRef={lot}
              isFirst={index === 0}
              isLast={index === (transaction.investmentLots ?? []).length - 1}
            />
          </div>
        ))}

        {(transaction.transactionEntries ?? []).map((entry, index) => (
          <div>
            <TransactionEntryCard
              fragmentRef={entry}
              isFirst={index === 0}
              isLast={
                index === (transaction.transactionEntries ?? []).length - 1
              }
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* Edit form */}
        <form
          id="edit-transaction-form"
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
                      placeholder="Transaction description"
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

            <form.Field
              name="categoryId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Combobox
                      items={allCategories.map((cat) => cat.id)}
                      itemToStringLabel={(item) =>
                        allCategories.find((cat) => cat.id === item)?.name || ''
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
                              {allCategories.find((cat) => cat.id === item)
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
          </FieldGroup>
        </form>
      </div>

      <DialogFooter>
        <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogTrigger
            render={
              <Button
                variant="destructive"
                type="button"
                disabled={isDeleteInFlight || isUpdateInFlight}
              />
            }
          >
            Delete
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <AlertTriangleIcon className="text-destructive" />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                transaction and all associated entries and investment lots.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleteInFlight}
              >
                {isDeleteInFlight ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          type="submit"
          form="edit-transaction-form"
          disabled={isUpdateInFlight || isDeleteInFlight}
        >
          {isUpdateInFlight ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </>
  )
}
