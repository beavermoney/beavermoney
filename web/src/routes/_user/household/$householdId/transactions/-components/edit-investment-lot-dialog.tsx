import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { FormError } from '@/components/form-error'
import { SearchSelect } from '@/components/search-select'
import { Avatar } from '@astryxdesign/core/Avatar'
import { Button } from '@astryxdesign/core/Button'
import { DialogHeader } from '@astryxdesign/core/Dialog'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm } from '@tanstack/react-form'
import currency from 'currency.js'
import { useEffect, useMemo } from 'react'
import { graphql, useMutation } from 'react-relay'
import { match } from 'ts-pattern'
import * as z from 'zod'

import type { editInvestmentLotDialogUpdateMutation } from './__generated__/editInvestmentLotDialogUpdateMutation.graphql'

import { CurrencyInput } from '@/components/currency-input'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { getLogoDomainURL } from '@/lib/logo'
import { commitMutationResult } from '@/lib/relay'

const editInvestmentLotDialogUpdateMutation = graphql`
  mutation editInvestmentLotDialogUpdateMutation(
    $id: ID!
    $input: UpdateInvestmentLotInput!
  ) {
    updateInvestmentLot(id: $id, input: $input) {
      node {
        id
        amount
        price
        investmentID
        investment {
          id
          amount
          value
          account {
            id
            value
          }
        }
      }
    }
  }
`

export type EditLotAccount = {
  id: string
  name: string
  type: string
  icon: string | null
  value: string
  householdCurrency: { code: string }
  user: { name: string }
  investments: ReadonlyArray<{
    id: string
    name: string
    symbol: string | null
  }>
}

type EditInvestmentLotDialogProps = {
  lotId: string
  currentAmount: string
  currentPrice: string
  currentInvestmentId: string
  currentAccountId: string
  accounts: ReadonlyArray<EditLotAccount>
  onClose: () => void
}

export function EditInvestmentLotDialog({
  lotId,
  currentAmount,
  currentPrice,
  currentInvestmentId,
  currentAccountId,
  accounts,
  onClose,
}: EditInvestmentLotDialogProps) {
  const { t } = useLingui()
  const formSchema = z.object({
    shares: z.number().positive(t`Shares must be positive`),
    pricePerShare: z.number().positive(t`Price per share must be positive`),
    accountId: z.string().min(1, t`Please select an account`),
    investmentId: z.string().min(1, t`Please select an investment`),
  })

  const showToast = useToast()

  const [commitUpdate, isUpdateInFlight] =
    useMutation<editInvestmentLotDialogUpdateMutation>(
      editInvestmentLotDialogUpdateMutation,
    )

  const { household } = useHousehold()
  const { displayCurrencyCode } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const investmentAccounts = accounts.filter(
    (account) => account.type === 'investment',
  )

  const originalSharesSign = parseFloat(currentAmount) < 0 ? -1 : 1

  const form = useForm({
    defaultValues: {
      shares: Math.abs(parseFloat(currentAmount)),
      pricePerShare: parseFloat(currentPrice),
      accountId: currentAccountId,
      investmentId: currentInvestmentId,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)
      const signedShares = currency(formData.shares, { precision: 8 }).multiply(
        originalSharesSign,
      )

      const result =
        await commitMutationResult<editInvestmentLotDialogUpdateMutation>(
          commitUpdate,
          {
            variables: {
              id: lotId,
              input: {
                amount: signedShares.toString(),
                price: currency(formData.pricePerShare, {
                  precision: 8,
                }).toString(),
                investmentID: formData.investmentId,
              },
            },
          },
        )

      match(result)
        .with({ status: 'success' }, () => {
          showToast({ type: 'info', body: t`Lot updated successfully!` })
          onClose()
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  const selectedAccountId = form.state.values.accountId
  const accountSelectionAvailable =
    !selectedAccountId ||
    investmentAccounts.some((account) => account.id === selectedAccountId)

  useEffect(() => {
    if (accountSelectionAvailable) return
    form.setFieldValue('accountId', '')
    form.setFieldValue('investmentId', '')
  }, [accountSelectionAvailable, form])

  const selectedAccount = investmentAccounts.find(
    (acc) => acc.id === selectedAccountId,
  )

  const availableInvestments = useMemo(() => {
    if (!selectedAccount) return []
    return selectedAccount.investments
  }, [selectedAccount])

  return (
    <Layout
      padding={6}
      header={
        <DialogHeader title={t`Edit Lot`} onOpenChange={() => onClose()} />
      }
    >
      <LayoutContent>
        <Stack direction="vertical" gap={6} paddingBlockStart={4}>
          <Text as="div" display="block" type="supporting">
            <Trans>
              Update lot details. Switching the investment moves the lot&apos;s
              shares.
            </Trans>
          </Text>

          <Stack
            as="form"
            direction="vertical"
            gap={6}
            id="edit-lot-form"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FormLayout>
              <form.Field
                name="accountId"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <SearchSelect
                        items={investmentAccounts.map((account) => account.id)}
                        getLabel={(item) =>
                          investmentAccounts.find((acc) => acc.id === item)
                            ?.name || ''
                        }
                        value={field.state.value}
                        onChange={(value) => {
                          field.handleChange(value || '')
                          form.setFieldValue('investmentId', '')
                        }}
                        data-1p-ignore
                        id={field.name}
                        placeholder={t`Select an account`}
                        onBlur={field.handleBlur}
                        label={t`Account`}
                        renderOption={(item: string) => {
                          const account = investmentAccounts.find(
                            (acc) => acc.id === item,
                          )
                          if (!account) return null
                          return (
                            <Stack
                              direction="horizontal"
                              gap={3}
                              align="center"
                            >
                              <Avatar
                                src={
                                  account.icon
                                    ? getLogoDomainURL(account.icon)
                                    : undefined
                                }
                                name={account.name}
                              />
                              <Stack
                                direction="vertical"
                                gap={0.5}
                                className="min-w-0"
                              >
                                <Text>{account.name}</Text>
                                <Text
                                  type="supporting"
                                  color="secondary"
                                  hasTabularNumbers
                                >
                                  {formatCurrencyWithPrivacyMode({
                                    value: account.value,
                                    currencyCode:
                                      account.householdCurrency.code,
                                    liability: account.type === 'liability',
                                  })}{' '}
                                  · {account.user.name}
                                </Text>
                              </Stack>
                            </Stack>
                          )
                        }}
                        emptyText={
                          <>
                            <Trans>No items found.</Trans>
                          </>
                        }
                      />
                      {isInvalid && (
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
                  )
                }}
              />
              <form.Field
                name="investmentId"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <SearchSelect
                        items={availableInvestments.map((inv) => inv.id)}
                        getLabel={(item) => {
                          const inv = availableInvestments.find(
                            (i) => i.id === item,
                          )
                          return inv
                            ? inv.symbol && inv.symbol !== inv.name
                              ? `${inv.name} (${inv.symbol})`
                              : inv.name
                            : ''
                        }}
                        value={field.state.value}
                        onChange={(value) => {
                          field.handleChange(value || '')
                        }}
                        isDisabled={!selectedAccount}
                        data-1p-ignore
                        id={field.name}
                        placeholder={
                          selectedAccount
                            ? t`Select an investment`
                            : t`Select an account first`
                        }
                        onBlur={field.handleBlur}
                        label={t`Investment`}
                        renderOption={(item: string) => {
                          const inv = availableInvestments.find(
                            (i) => i.id === item,
                          )
                          return (
                            <span>
                              {inv
                                ? inv.symbol && inv.symbol !== inv.name
                                  ? `${inv.name} (${inv.symbol})`
                                  : inv.name
                                : ''}
                            </span>
                          )
                        }}
                        emptyText={
                          <>
                            <Trans>No items found.</Trans>
                          </>
                        }
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
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <NumberInput
                        data-1p-ignore
                        id={field.name}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        placeholder="10"
                        autoComplete="off"
                        label={t`Shares`}

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
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
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
                        currency={
                          selectedAccount?.householdCurrency.code ??
                          displayCurrencyCode
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
            </FormLayout>
          </Stack>

          <Stack
            direction="horizontal"
            gap={3}
            align="center"
            wrap="wrap"
            justify="end"
          >
            <Button
              type="button"
              onClick={onClose}
              label={t`Cancel`}
              variant={'secondary'}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              form="edit-lot-form"
              label={String(isUpdateInFlight ? t`Saving...` : t`Save Changes`)}
              variant={'primary'}

              isDisabled={isUpdateInFlight}
            >
              {isUpdateInFlight ? t`Saving...` : t`Save Changes`}
            </Button>
          </Stack>
        </Stack>
      </LayoutContent>
    </Layout>
  )
}
