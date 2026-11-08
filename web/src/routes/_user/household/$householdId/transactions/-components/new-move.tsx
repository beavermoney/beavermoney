import { FinanceCalendar } from '@/components/finance-calendar'
import { FormError } from '@/components/form-error'
import { Button } from '@astryxdesign/core/Button'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Popover } from '@astryxdesign/core/Popover'
import { Stack } from '@astryxdesign/core/Stack'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm, useStore } from '@tanstack/react-form'
import currency from 'currency.js'
import { useMemo } from 'react'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'
import type { newMoveFragment$key } from './__generated__/newMoveFragment.graphql'
import type { newMoveMutation } from './__generated__/newMoveMutation.graphql'
import { TransactionInvestmentPicker } from './transaction-investment-picker'

import { CurrencyInput } from '@/components/currency-input'
import { useDefaultOwnerUserID } from '@/hooks/use-default-owner-user-id'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdMembers } from '@/hooks/use-household-members'
import { useUser } from '@/hooks/use-user'
import { commitMutationResult } from '@/lib/relay'
import { OwnerSelect } from '../../-components/owner-select'

const formSchema = z.object({
  description: z
    .string()
    .max(256, 'Description must be at most 256 characters.'),
  shares: z.number().positive('Shares must be positive'),
  pricePerShare: z.number().positive('Price per share must be positive'),
  datetime: z.date(),
  ownerUserID: z.string().min(1, 'Please select an owner'),
  fromInvestmentId: z.string().min(1, 'Please select a from investment'),
  toInvestmentId: z.string().min(1, 'Please select a to investment'),
})

const newMoveFragment = graphql`
  fragment newMoveFragment on Household
  @argumentDefinitions(viewUserIds: { type: "[ID!]" }) {
    accounts(where: { archived: false, userIDIn: $viewUserIds }) {
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
            symbol
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
  const showToast = useToast()

  const data = useFragment(newMoveFragment, fragmentRef)

  const [commitMutation, isMutationInFlight] =
    useMutation<newMoveMutation>(newMoveMutation)

  const { household } = useHousehold()
  const { user } = useUser()

  const ownerOptions = useHouseholdMembers()
  const defaultOwnerUserID = useDefaultOwnerUserID(user.id)
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
      ownerUserID: defaultOwnerUserID,
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
        showToast({
          type: 'error',
          body: 'Investments must have the same symbol',
        })
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
                userID: value.ownerUserID,
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

          showToast({ type: 'info', body: 'Investment moved successfully!' })
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
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
    <Stack direction="vertical" gap={6}>
      <Stack direction="vertical" gap={4}>
        <Stack
          as="form"
          direction="vertical"
          gap={6}
          id="new-move-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FormLayout>
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
                  <Stack
                    direction="vertical"
                    gap={2}
                    data-invalid={isInvalid}
                    data-transaction-initial-focus
                  >
                    <label htmlFor={field.name}>From Investment</label>
                    <TransactionInvestmentPicker
                      investments={allInvestments}
                      name={field.name}
                      label="From Investment"
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value)
                        form.setFieldValue('toInvestmentId', '')
                      }}
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
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <label htmlFor={field.name}>To Investment</label>
                    <Stack direction="vertical" gap={4}>
                      {fromInvestment
                        ? `Only showing investments with symbol: ${fromInvestment.symbol}`
                        : 'Select from investment first'}
                    </Stack>
                    <TransactionInvestmentPicker
                      investments={toInvestments}
                      name={field.name}
                      label="To Investment"
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      invalid={isInvalid}
                      disabled={!fromInvestment}
                      disabledMessage="Select from investment first"
                    />
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <form.Field
              name="shares"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <Stack direction="vertical" gap={4}>
                      Number of shares to move
                    </Stack>
                    <NumberInput
                      data-1p-ignore
                      id={field.name}
                      placeholder="0"
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      label={'Shares'}

                      htmlName={field.name}
                      value={
                        field.state.value === undefined
                          ? null
                          : field.state.value
                      }
                      onChange={(value) => field.handleChange(value)}
                      step={0.0001}
                    />
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <form.Field
              name="pricePerShare"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
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
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
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
                      placeholder="Move AAPL shares"
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
            {ownerOptions.length > 1 && (
              <form.Field
                name="ownerUserID"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
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
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
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
          </FormLayout>
        </Stack>
      </Stack>
      <Stack
        direction="horizontal"
        gap={3}
        align="center"
        wrap="wrap"
        justify="end"
        as="footer"
      >
        <Stack direction="horizontal" gap={2} wrap="wrap">
          <Button
            type="button"
            onClick={() => form.reset()}
            label={'Reset'}
            variant={'secondary'}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="new-move-form"
            label={String(isMutationInFlight ? 'Moving...' : 'Move')}
            variant={'primary'}

            isDisabled={isMutationInFlight}
          >
            {isMutationInFlight ? 'Moving...' : 'Move'}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
