import {
  graphql,
  useFragment,
  useMutation,
  usePreloadedQuery,
} from 'react-relay'
import type { PreloadedQuery } from 'react-relay'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { match } from 'ts-pattern'
import invariant from 'tiny-invariant'
import { Fragment, useMemo, useState } from 'react'
import { AlertTriangleIcon } from 'lucide-react'

import type { editTransactionDialogUpdateMutation } from './__generated__/editTransactionDialogUpdateMutation.graphql'
import type { editTransactionDialogDeleteMutation } from './__generated__/editTransactionDialogDeleteMutation.graphql'
import type { editTransactionDialogTransactionFragment$key } from './__generated__/editTransactionDialogTransactionFragment.graphql'
import type { editTransactionDialogCategoriesFragment$key } from './__generated__/editTransactionDialogCategoriesFragment.graphql'
import type { editTransactionDialogHouseholdFragment$key } from './__generated__/editTransactionDialogHouseholdFragment.graphql'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { commitMutationResult } from '@/lib/relay'
import { InvestmentLotCard } from './investment-lot-card'
import { TransactionEntryCard } from './transaction-entry-card'
import { EditTransactionEntryDialog } from './edit-transaction-entry-dialog'
import { EditInvestmentLotDialog } from './edit-investment-lot-dialog'
import { useHousehold } from '@/hooks/use-household'
import { editTransactionDialogQuery } from './__generated__/editTransactionDialogQuery.graphql'
import { useNavigate } from '@tanstack/react-router'
import currency from 'currency.js'
import { Separator } from '@/components/ui/separator'
import { NodeType, useDeleteNode } from '@/lib/relay'
import { TransactionCategoryPicker } from './transaction-category-picker'

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
  mutation editTransactionDialogDeleteMutation($id: ID!, $connections: [ID!]!) {
    deleteTransaction(id: $id) {
      deletedTransactionId @deleteEdge(connections: $connections)
    }
  }
`

const editTransactionDialogTransactionFragment = graphql`
  fragment editTransactionDialogTransactionFragment on Transaction {
    id
    description
    datetime
    categoryID
    excludeFromReports
    category {
      id
      name
      type
    }
    investmentLots {
      ...investmentLotCardFragment
      id
      amount
      price
      investment {
        id
        account {
          id
        }
      }
    }
    transactionEntries {
      ...transactionEntryCardFragment
      id
      amount
      account {
        id
      }
    }
  }
`

const editTransactionDialogCategoriesFragment = graphql`
  fragment editTransactionDialogCategoriesFragment on Query {
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

const editTransactionDialogHouseholdFragment = graphql`
  fragment editTransactionDialogHouseholdFragment on Household
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
          investments {
            id
            name
            symbol
          }
        }
      }
    }
  }
`

export const EditTransactionDialogQuery = graphql`
  query editTransactionDialogQuery($transactionId: ID!, $viewUserIds: [ID!]) {
    node(id: $transactionId) {
      __typename
      ... on Transaction {
        ...editTransactionDialogTransactionFragment
      }
    }
    ...editTransactionDialogCategoriesFragment
    household {
      ...editTransactionDialogHouseholdFragment
        @arguments(viewUserIds: $viewUserIds)
      ...editTransactionEntryDialogAccountsFragment
        @arguments(viewUserIds: $viewUserIds)
    }
  }
`

const formSchema = z.object({
  description: z
    .string()
    .max(256, 'Description must be at most 256 characters.'),
  datetime: z.date(),
  categoryId: z.string().min(1, 'Please select a category'),
  excludeFromReports: z.boolean(),
})

type EditTransactionDialogProps = {
  queryRef: PreloadedQuery<editTransactionDialogQuery>
}

export function EditTransactionDialog({
  queryRef,
}: EditTransactionDialogProps) {
  const queryData = usePreloadedQuery<editTransactionDialogQuery>(
    EditTransactionDialogQuery,
    queryRef,
  )

  invariant(queryData.node?.__typename === 'Transaction')
  const transaction = useFragment<editTransactionDialogTransactionFragment$key>(
    editTransactionDialogTransactionFragment,
    queryData.node,
  )
  const categoriesData =
    useFragment<editTransactionDialogCategoriesFragment$key>(
      editTransactionDialogCategoriesFragment,
      queryData,
    )
  const householdData = useFragment<editTransactionDialogHouseholdFragment$key>(
    editTransactionDialogHouseholdFragment,
    queryData.household,
  )

  const navigate = useNavigate()

  const { household } = useHousehold()

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  type EditingEntry = {
    id: string
    amount: string
    accountId: string
  }
  type EditingLot = {
    id: string
    amount: string
    price: string
    investmentId: string
    accountId: string
  }
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null)
  const [editingLot, setEditingLot] = useState<EditingLot | null>(null)
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [lotDialogOpen, setLotDialogOpen] = useState(false)

  const openEntryEdit = (entry: EditingEntry) => {
    setEditingEntry(entry)
    setEntryDialogOpen(true)
  }
  const openLotEdit = (lot: EditingLot) => {
    setEditingLot(lot)
    setLotDialogOpen(true)
  }

  const accountsList = useMemo(
    () =>
      householdData.accounts.edges?.flatMap((edge) =>
        edge?.node
          ? [
              {
                id: edge.node.id,
                name: edge.node.name,
                type: edge.node.type,
                icon: edge.node.icon ?? null,
                value: edge.node.value,
                householdCurrency: {
                  code: edge.node.householdCurrency.code,
                },
                user: {
                  name: edge.node.user.name,
                },
                investments: (edge.node.investments ?? []).map((inv) => ({
                  id: inv.id,
                  name: inv.name,
                  symbol: inv.symbol,
                })),
              },
            ]
          : [],
      ) ?? [],
    [householdData.accounts.edges],
  )

  const [commitUpdate, isUpdateInFlight] =
    useMutation<editTransactionDialogUpdateMutation>(
      editTransactionDialogUpdateMutation,
    )

  const [commitDelete, isDeleteInFlight] =
    useMutation<editTransactionDialogDeleteMutation>(
      editTransactionDialogDeleteMutation,
    )

  const deleteNode = useDeleteNode(NodeType.Transaction)

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
      excludeFromReports: transaction.excludeFromReports,
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
                excludeFromReports: formData.excludeFromReports,
              },
            },
            updater: (store) => {
              store.get(household.id)?.invalidateRecord()
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
    const result = await deleteNode((connections) =>
      commitMutationResult<editTransactionDialogDeleteMutation>(commitDelete, {
        variables: {
          id: transaction.id,
          connections,
        },
        // updater: (store) => {
        //   store.invalidateStore()
        // },
      }),
    )

    match(result)
      .with({ status: 'success' }, () => {
        toast.success('Transaction deleted successfully!')
        navigate({
          to: '.',
          search: (old) => ({ ...old, edit_transaction_id: null }),
          resetScroll: false,
        })
        setDeleteAlertOpen(false)
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
        setDeleteAlertOpen(false)
      })
      .exhaustive()
  }

  const sortedItems = useMemo(() => {
    invariant(
      transaction.transactionEntries,
      'Transaction entries should be defined',
    )
    const entries = transaction.transactionEntries.map((entry) => ({
      type: 'entry' as const,
      entry,
    }))
    invariant(transaction.investmentLots, 'Investment lots should be defined')
    const lots = transaction.investmentLots.map((lot) => ({
      type: 'lot' as const,
      lot,
    }))
    return match(transaction.category.name)
      .with('Buy', () => {
        const negativeEntries = entries.filter(
          (item) => currency(item.entry.amount, { precision: 8 }).value < 0,
        )
        const positiveLots = lots.filter(
          (item) => currency(item.lot.amount, { precision: 8 }).value > 0,
        )
        return [...positiveLots, ...negativeEntries]
      })
      .with('Sell', () => {
        const negativeLots = lots.filter(
          (item) => currency(item.lot.amount, { precision: 8 }).value < 0,
        )
        const positiveEntries = entries.filter(
          (item) => currency(item.entry.amount, { precision: 8 }).value > 0,
        )
        return [...negativeLots, ...positiveEntries]
      })
      .otherwise(() => {
        const debits = [...lots, ...entries].filter((item) => {
          const amount =
            item.type === 'lot' ? item.lot.amount : item.entry.amount
          return currency(amount, { precision: 8 }).value < 0
        })
        const credits = [...lots, ...entries].filter((item) => {
          const amount =
            item.type === 'lot' ? item.lot.amount : item.entry.amount
          return currency(amount, { precision: 8 }).value >= 0
        })
        return [...debits, ...credits]
      })
  }, [transaction])

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogDescription>
          Update transaction details. Click on entries or lots below to edit
          them individually.
        </DialogDescription>
      </DialogHeader>

      <div className="border-border has-[[data-slot=item]:hover]:border-primary/45 group/item focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-wrap items-center overflow-hidden rounded-lg border text-xs/relaxed transition-colors duration-150 outline-none focus-visible:ring-[3px]">
        {sortedItems.map((item, index) =>
          item.type === 'lot' ? (
            <Fragment key={item.lot.id}>
              {index !== 0 && <Separator className="" />}
              <InvestmentLotCard
                fragmentRef={item.lot}
                isFirst={index === 0}
                isLast={index === sortedItems.length - 1}
                onClick={() =>
                  openLotEdit({
                    id: item.lot.id,
                    amount: item.lot.amount,
                    price: item.lot.price,
                    investmentId: item.lot.investment.id,
                    accountId: item.lot.investment.account.id,
                  })
                }
              />
            </Fragment>
          ) : (
            <Fragment key={item.entry.id}>
              {index !== 0 && <Separator className="" />}
              <TransactionEntryCard
                fragmentRef={item.entry}
                isFirst={index === 0}
                isLast={index === sortedItems.length - 1}
                onClick={() =>
                  openEntryEdit({
                    id: item.entry.id,
                    amount: item.entry.amount,
                    accountId: item.entry.account.id,
                  })
                }
              />
            </Fragment>
          ),
        )}
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
                    <TransactionCategoryPicker
                      categories={allCategories}
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
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

            <FieldSet>
              <FieldLegend variant="label">Options</FieldLegend>
              <FieldGroup data-slot="checkbox-group">
                <form.Field
                  name="excludeFromReports"
                  children={(field) => {
                    return (
                      <Field orientation={'horizontal'}>
                        <Button
                          type="button"
                          id={field.name}
                          name={field.name}
                          aria-pressed={field.state.value}
                          variant="outline"
                          onClick={() => field.handleChange(!field.state.value)}
                          onBlur={field.handleBlur}
                          className="aria-pressed:border-primary"
                        >
                          Exclude from reports
                        </Button>
                      </Field>
                    )
                  }}
                />
              </FieldGroup>
            </FieldSet>
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

      <Dialog
        open={entryDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEntryDialogOpen(false)
        }}
      >
        <DialogContent>
          {editingEntry && (
            <EditTransactionEntryDialog
              key={editingEntry.id}
              entryId={editingEntry.id}
              currentAmount={editingEntry.amount}
              currentAccountId={editingEntry.accountId}
              householdRef={queryData.household}
              onClose={() => setEntryDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={lotDialogOpen}
        onOpenChange={(open) => {
          if (!open) setLotDialogOpen(false)
        }}
      >
        <DialogContent>
          {editingLot && (
            <EditInvestmentLotDialog
              key={editingLot.id}
              lotId={editingLot.id}
              currentAmount={editingLot.amount}
              currentPrice={editingLot.price}
              currentInvestmentId={editingLot.investmentId}
              currentAccountId={editingLot.accountId}
              accounts={accountsList}
              onClose={() => setLotDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
