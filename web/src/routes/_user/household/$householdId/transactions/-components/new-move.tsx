import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { TransactionAccountPicker } from './transaction-account-picker'
import { InvestmentStart } from './investment-start'
import { useState } from 'react'
import { MobileTransactionComposer } from '@/components/transaction-composer/composer'
import { useIsMobile } from '@/hooks/use-mobile'
import { useRef } from 'react'
import { Grid } from '@astryxdesign/core/Grid'
import { FinanceDateInput } from '@/components/finance-date-input'
import { FormError } from '@/components/form-error'
import { Button } from '@astryxdesign/core/Button'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
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
          ...transactionAccountPickerFragment
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
  const { t } = useLingui()
  const formSchema = z.object({
    description: z
      .string()
      .max(256, t`Description must be at most 256 characters.`),
    shares: z.number().positive(t`Shares must be positive`),
    pricePerShare: z.number().positive(t`Price per share must be positive`),
    datetime: z.date(),
    ownerUserID: z.string().min(1, t`Please select an owner`),
    fromInvestmentId: z.string().min(1, t`Please select a from investment`),
    toInvestmentId: z.string().min(1, t`Please select a to investment`),
  })

  const showToast = useToast()
  const isMobile = useIsMobile()
  // Keep defaults stable when Relay refreshes after Save again.
  const [initialDatetime] = useState(() => new Date())
  const mobileSubmission = useRef<'close' | 'again' | null>(null)
  const { close: closeComposer } = useLogTransaction()

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
      datetime: initialDatetime,
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

      invariant(fromInvestment, t`From investment not found`)
      invariant(toInvestment, t`To investment not found`)

      // Validate same symbol
      if (fromInvestment.symbol !== toInvestment.symbol) {
        showToast({
          type: 'error',
          body: t`Investments must have the same symbol`,
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

          showToast({ type: 'info', body: t`Investment moved successfully!` })
          if (mobileSubmission.current === 'close') closeComposer()
          if (mobileSubmission.current === 'again') {
            form.reset(
              {
                description: '',
                shares: undefined as unknown as number,
                pricePerShare: undefined as unknown as number,
                datetime: value.datetime,
                ownerUserID: value.ownerUserID,
                // Move accounts are identified by their investment positions.
                fromInvestmentId: value.fromInvestmentId,
                toInvestmentId: value.toInvestmentId,
              },
              { keepDefaultValues: true },
            )
          }
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  const destinationInvestmentId = useStore(
    form.store,
    (state) => state.values.toInvestmentId,
  )
  const [sourceAccountId, setSourceAccountId] = useState('')
  const investmentAccounts =
    data.accounts.edges?.flatMap((edge) =>
      edge?.node?.type === 'investment' ? [edge.node] : [],
    ) ?? []

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

  const fields = {
    fromInvestmentId: (
      <form.Field
        name="fromInvestmentId"
        validators={{
          onChange: ({ value, fieldApi }) => {
            if (!value) {
              return undefined
            }
            const toInvestmentId = fieldApi.form.getFieldValue('toInvestmentId')
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
              <TransactionInvestmentPicker
                investments={
                  isMobile
                    ? (investmentAccounts.find((a) => a.id === sourceAccountId)
                        ?.investments ?? [])
                    : allInvestments
                }
                name={field.name}
                label={t`From Investment`}
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value)
                  form.setFieldValue('toInvestmentId', '')
                }}
                onBlur={field.handleBlur}
                invalid={isInvalid}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    toInvestmentId: (
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
                message: t`Cannot move to the same investment`,
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
              {fromInvestment && (
                <Text type="supporting" color="secondary">
                  <Trans>
                    Matching {fromInvestment.symbol} holdings in another
                    account.
                  </Trans>
                </Text>
              )}
              <TransactionInvestmentPicker
                investments={toInvestments}
                name={field.name}
                label={t`To Investment`}
                value={field.state.value}
                onValueChange={field.handleChange}
                onBlur={field.handleBlur}
                invalid={isInvalid}
                disabled={!fromInvestment}
                disabledMessage={t`Select from investment first`}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    shares: (
      <form.Field
        name="shares"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              {isMobile ? (
                <CurrencyInput
                  id={field.name}
                  name={field.name}
                  aria-label={t`Shares`}
                  value={field.state.value}
                  locale={household.locale}
                  currency={displayCurrencyCode}
                  decimalScale={8}
                  showCurrencySymbol={false}
                  onBlur={field.handleBlur}
                  onValueChange={(value) =>
                    field.handleChange(value.floatValue!)
                  }
                  aria-invalid={isInvalid}
                />
              ) : (
                <NumberInput
                  data-1p-ignore
                  id={field.name}
                  placeholder="0"
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  label={t`Shares to move`}

                  htmlName={field.name}
                  value={
                    field.state.value === undefined ? null : field.state.value
                  }
                  onChange={(value) => field.handleChange(value)}
                  step={0.0001}
                />
              )}
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    pricePerShare: (
      <form.Field
        name="pricePerShare"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              <CurrencyInput
                aria-label={t`Price per share`}
                id={field.name}
                name={field.name}
                placeholder={t`Please enter a price`}
                onValueChange={(e) => {
                  field.handleChange(e.floatValue!)
                }}
                value={field.state.value}
                locale={household.locale}
                currency={fromInvestment?.currencyCode ?? displayCurrencyCode}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
                decimalScale={8}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    description: (
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
                placeholder={t`Move AAPL shares`}
                autoComplete="off"
                label={t`Description`}

                value={String(field.state.value ?? '')}
                onChange={(_value, event) =>
                  ((e) => field.handleChange(e.target.value))(event)
                }
                htmlName={field.name}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    ownerUserID: (
      <form.Field
        name="ownerUserID"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
              <OwnerSelect
                id={field.name}
                name={field.name}
                options={ownerOptions}
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
                onBlur={field.handleBlur}
                ariaInvalid={isInvalid}
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
    datetime: (
      <form.Field
        name="datetime"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Stack
              direction="vertical"
              width={isMobile ? undefined : '100%'}
              gap={2}
              data-invalid={isInvalid}
            >
              <FinanceDateInput
                id={field.name}
                label={t`Date`}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                disabledDate={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
              />
              {isInvalid && <FormError errors={field.state.meta.errors} />}
            </Stack>
          )
        }}
      />
    ),
  }

  if (isMobile)
    return (
      <MobileTransactionComposer
        kind="move"
        header={
          <>
            <Text type="label">
              <Trans>Move</Trans>
            </Text>
            {fields.fromInvestmentId}
            <Text type="supporting">
              <Trans>from</Trans>
            </Text>
            <TransactionAccountPicker
              accounts={investmentAccounts}
              name="sourceAccount"
              label={t`From account`}
              value={sourceAccountId}
              onValueChange={(id) => {
                setSourceAccountId(id)
                form.setFieldValue('fromInvestmentId', '')
                form.setFieldValue('toInvestmentId', '')
              }}
              onBlur={() => {}}
              invalid={false}
            />
            <Text type="supporting">
              <Trans>to</Trans>
            </Text>
            <TransactionAccountPicker
              accounts={investmentAccounts.filter(
                (a) =>
                  a.id !== sourceAccountId &&
                  a.investments?.some((inv) =>
                    toInvestments.some((candidate) => candidate.id === inv.id),
                  ),
              )}
              name="destinationAccount"
              label={t`To account`}
              value={
                investmentAccounts.find((a) =>
                  a.investments?.some(
                    (inv) => inv.id === destinationInvestmentId,
                  ),
                )?.id ?? ''
              }
              onValueChange={(id) => {
                const investment = investmentAccounts
                  .find((a) => a.id === id)
                  ?.investments?.find((inv) =>
                    toInvestments.some((candidate) => candidate.id === inv.id),
                  )
                form.setFieldValue('toInvestmentId', investment?.id ?? '')
              }}
              onBlur={() => {}}
              invalid={false}
            />
          </>
        }
        stableAmounts
        category={
          <InvestmentStart
            kind="Move"
            destination={{
              accounts: investmentAccounts
                .filter((a) => a.id !== sourceAccountId)
                .map((a) => ({
                  ...a,
                  investments: a.investments?.filter((inv) =>
                    toInvestments.some((candidate) => candidate.id === inv.id),
                  ),
                }))
                .filter((a) => a.investments?.length),
              investmentId: destinationInvestmentId,
              onInvestment: (id) => form.setFieldValue('toInvestmentId', id),
            }}
            accounts={investmentAccounts}
            accountId={sourceAccountId}
            investmentId={fromInvestmentId}
            onAccount={(id) => {
              setSourceAccountId(id)
              form.setFieldValue('fromInvestmentId', '')
              form.setFieldValue('toInvestmentId', '')
            }}
            onInvestment={(id) => {
              form.setFieldValue('fromInvestmentId', id)
              form.setFieldValue('toInvestmentId', '')
            }}
          />
        }
        firstAmount={'shares'}
        amounts={
          <>
            {fields.shares}
            {fields.pricePerShare}
          </>
        }
        chips={<>{ownerOptions.length > 1 && fields.ownerUserID}</>}
        date={fields.datetime}
        details={<>{fields.description}</>}
        pending={isMutationInFlight}
        onSave={async (again) => {
          mobileSubmission.current = again ? 'again' : 'close'
          try {
            await form.handleSubmit()
            return form.state.isValid
          } finally {
            mobileSubmission.current = null
          }
        }}
      />
    )

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
            {fields.fromInvestmentId}
            {fields.toInvestmentId}
            <Grid
              columns={{ minWidth: 240, max: 2 }}
              gap={4}
              align="start"
              justify="stretch"
            >
              {fields.shares}
              {fields.pricePerShare}
            </Grid>
            {fields.description}
            <Grid
              columns={{ minWidth: 240, max: 2, repeat: 'fit' }}
              gap={4}
              align="start"
              justify="stretch"
            >
              {ownerOptions.length > 1 && fields.ownerUserID}
              {fields.datetime}
            </Grid>
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
            label={t`Reset`}
            variant={'secondary'}
          >
            <Trans>Reset</Trans>
          </Button>
          <Button
            type="submit"
            form="new-move-form"
            label={String(isMutationInFlight ? t`Moving...` : t`Move`)}
            variant={'primary'}

            isDisabled={isMutationInFlight}
          >
            {isMutationInFlight ? t`Moving...` : t`Move`}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
