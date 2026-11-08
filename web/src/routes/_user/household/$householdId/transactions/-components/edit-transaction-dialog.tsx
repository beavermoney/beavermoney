import { FinanceCalendar } from '@/components/finance-calendar'
import { FormError } from '@/components/form-error'
import { Button } from '@astryxdesign/core/Button'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Divider } from '@astryxdesign/core/Divider'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Popover } from '@astryxdesign/core/Popover'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm } from '@tanstack/react-form'
import { Fragment, useMemo, useState } from 'react'
import type { PreloadedQuery } from 'react-relay'
import {
  graphql,
  useFragment,
  useMutation,
  usePreloadedQuery,
} from 'react-relay'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'

import type { editTransactionDialogCategoriesFragment$key } from './__generated__/editTransactionDialogCategoriesFragment.graphql'
import type { editTransactionDialogDeleteMutation } from './__generated__/editTransactionDialogDeleteMutation.graphql'
import type { editTransactionDialogHouseholdFragment$key } from './__generated__/editTransactionDialogHouseholdFragment.graphql'
import type { editTransactionDialogTransactionFragment$key } from './__generated__/editTransactionDialogTransactionFragment.graphql'
import type { editTransactionDialogUpdateMutation } from './__generated__/editTransactionDialogUpdateMutation.graphql'

import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'
import { useNavigate } from '@tanstack/react-router'
import currency from 'currency.js'
import { editTransactionDialogQuery } from './__generated__/editTransactionDialogQuery.graphql'
import { EditInvestmentLotDialog } from './edit-investment-lot-dialog'
import { EditTransactionEntryDialog } from './edit-transaction-entry-dialog'
import { InvestmentLotCard } from './investment-lot-card'
import { TransactionEntryCard } from './transaction-entry-card'

import { NodeType, useDeleteNode } from '@/lib/relay'
import { identity } from 'lodash-es'
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
  onClose?: () => void
}

export function EditTransactionDialog({
  queryRef,
  onClose,
}: EditTransactionDialogProps) {
  const showToast = useToast()

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
            updater: identity,
          },
        )

      match(result)
        .with({ status: 'success' }, () => {
          showToast({ type: 'info', body: 'Transaction updated successfully!' })
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
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
        showToast({ type: 'info', body: 'Transaction deleted successfully!' })
        navigate({
          to: '.',
          search: (old) => ({ ...old, edit_transaction_id: null }),
          resetScroll: false,
        })
        setDeleteAlertOpen(false)
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: error.toString() })
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
      <DialogHeader title="Edit Transaction" onOpenChange={() => onClose?.()} />
      <Text as="div" display="block" type="supporting">
        Update transaction details. Click on entries or lots below to edit them
        individually.
      </Text>

      <Stack direction="horizontal" align="center">
        {sortedItems.map((item, index) =>
          item.type === 'lot' ? (
            <Fragment key={item.lot.id}>
              {index !== 0 && <Divider />}
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
              {index !== 0 && <Divider />}
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
      </Stack>

      <Stack direction="vertical" gap={4}>
        {/* Edit form */}
        <Stack
          as="form"
          direction="vertical"
          gap={6}
          id="edit-transaction-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FormLayout>
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
                      placeholder="Transaction description"
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
            <form.Field
              name="datetime"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <label htmlFor={field.name}>Date</label>
                    <Popover
                      label="Choose value"
                      alignment={'start'}
                      content={
                        <>
                          <FinanceCalendar
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
                        </>
                      }
                    >
                      {(triggerProps) => (
                        <Button
                          {...triggerProps}
                          id={field.name}
                          name={field.name}
                          type="button"

                          label={String(
                            field.state.value.toLocaleDateString(
                              household.locale,
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              },
                            ),
                          )}
                          variant={'secondary'}
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
                      )}
                    </Popover>
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <form.Field
              name="categoryId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <label htmlFor={field.name}>Category</label>
                    <TransactionCategoryPicker
                      categories={allCategories}
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
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
            <fieldset>
              <legend>Options</legend>
              <Stack direction="vertical" gap={4} data-slot="checkbox-group">
                <form.Field
                  name="excludeFromReports"
                  children={(field) => {
                    return (
                      <Stack direction="vertical" gap={2}>
                        <CheckboxInput
                          id={field.name}
                          htmlName={field.name}
                          value={field.state.value}
                          onChange={field.handleChange}
                          onBlur={field.handleBlur}
                          label={'Exclude from reports'}
                        />
                      </Stack>
                    )
                  }}
                />
              </Stack>
            </fieldset>
          </FormLayout>
        </Stack>
      </Stack>

      <Stack
        direction="horizontal"
        gap={3}
        align="center"
        wrap="wrap"
        justify="end"
      >
        <>
          <Button
            onClick={() => setDeleteAlertOpen(true)}
            type="button"
            label={'Delete'}
            variant={'destructive'}

            isDisabled={isDeleteInFlight || isUpdateInFlight}
          >
            Delete
          </Button>
          <Dialog
            isOpen={deleteAlertOpen}
            onOpenChange={setDeleteAlertOpen}
            purpose="form"
            role="alertdialog"
          >
            <DialogHeader
              title={<>Delete Transaction</>}
              onOpenChange={setDeleteAlertOpen}
            />
            <Text as="div" display="block" type="supporting">
              This action cannot be undone. This will permanently delete the
              transaction and all associated entries and investment lots.
            </Text>
            <Stack
              direction="horizontal"
              gap={3}
              align="center"
              wrap="wrap"
              justify="end"
            >
              <Button
                label="Cancel"
                onClick={() => setDeleteAlertOpen(false)}
              />
              <Button
                variant="destructive"
                onClick={handleDelete}
                isDisabled={isDeleteInFlight}
                label="Delete"
              >
                {isDeleteInFlight ? 'Deleting...' : 'Delete'}
              </Button>
            </Stack>
          </Dialog>
        </>
        <Button
          type="submit"
          form="edit-transaction-form"
          label={String(isUpdateInFlight ? 'Saving...' : 'Save Changes')}
          variant={'primary'}

          isDisabled={isUpdateInFlight || isDeleteInFlight}
        >
          {isUpdateInFlight ? 'Saving...' : 'Save Changes'}
        </Button>
      </Stack>

      <>
        <Dialog
          isOpen={entryDialogOpen}
          onOpenChange={(open) => {
            if (!open) setEntryDialogOpen(false)
          }}
          purpose="form"
        >
          {editingEntry && (
            <EditTransactionEntryDialog
              key={editingEntry.id}
              entryId={editingEntry.id}
              currentAmount={editingEntry.amount}
              currentAccountId={editingEntry.accountId}
              accounts={accountsList}
              onClose={() => setEntryDialogOpen(false)}
            />
          )}
        </Dialog>
      </>

      <>
        <Dialog
          isOpen={lotDialogOpen}
          onOpenChange={(open) => {
            if (!open) setLotDialogOpen(false)
          }}
          purpose="form"
        >
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
        </Dialog>
      </>
    </>
  )
}
