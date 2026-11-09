import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { FormError } from '@/components/form-error'
import { SearchSelect } from '@/components/search-select'
import { Avatar } from '@astryxdesign/core/Avatar'
import { Button } from '@astryxdesign/core/Button'
import { DialogHeader } from '@astryxdesign/core/Dialog'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm } from '@tanstack/react-form'
import currency from 'currency.js'
import { graphql, useMutation } from 'react-relay'
import { match } from 'ts-pattern'
import * as z from 'zod'

import type { editTransactionEntryDialogUpdateMutation } from './__generated__/editTransactionEntryDialogUpdateMutation.graphql'

import { CurrencyInput } from '@/components/currency-input'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { getLogoDomainURL } from '@/lib/logo'
import { commitMutationResult } from '@/lib/relay'
import { useEffect } from 'react'

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

export type EditEntryAccount = {
  id: string
  name: string
  type: string
  icon: string | null
  value: string
  householdCurrency: { code: string }
  user: { name: string }
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
  const { t } = useLingui()
  const formSchema = z.object({
    amount: z.number().positive(t`Amount must be positive`),
    accountId: z.string().min(1, t`Please select an account`),
  })

  const showToast = useToast()

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
          showToast({ type: 'info', body: t`Entry updated successfully!` })
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
    accounts.some((account) => account.id === selectedAccountId)

  useEffect(() => {
    if (!accountSelectionAvailable) form.setFieldValue('accountId', '')
  }, [accountSelectionAvailable, form])

  const accountById = new Map(accounts.map((a) => [a.id, a]))

  return (
    <Layout
      padding={6}
      header={
        <DialogHeader title={t`Edit Entry`} onOpenChange={() => onClose()} />
      }
    >
      <LayoutContent>
        <Stack direction="vertical" gap={6} paddingBlockStart={4}>
          <Text as="div" display="block" type="supporting">
            <Trans>
              Update entry details. Switching the account also switches the
              entry&apos;s currency.
            </Trans>
          </Text>

          <Stack
            as="form"
            direction="vertical"
            gap={6}
            id="edit-entry-form"
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
                        items={accounts.map((a) => a.id)}
                        getLabel={(item) => accountById.get(item)?.name ?? ''}
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value || '')}
                        data-1p-ignore
                        id={field.name}
                        placeholder={t`Select an account`}
                        onBlur={field.handleBlur}
                        label={t`Account`}
                        renderOption={(item: string) => {
                          const account = accounts.find(
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
                name="amount"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  const selectedAccount = accounts.find(
                    (a) => a.id === form.state.values.accountId,
                  )
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <CurrencyInput
                        aria-label={t`Amount`}
                        id={field.name}
                        name={field.name}
                        placeholder={t`Please enter an amount`}
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
              form="edit-entry-form"
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
