import { graphql, useMutation } from 'react-relay'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { match } from 'ts-pattern'
import currency from 'currency.js'
import { useMemo } from 'react'

import type { editInvestmentLotDialogUpdateMutation } from './__generated__/editInvestmentLotDialogUpdateMutation.graphql'

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CurrencyInput } from '@/components/currency-input'
import { commitMutationResult } from '@/lib/relay'
import { getLogoDomainURL } from '@/lib/logo'
import { useCurrency } from '@/hooks/use-currency'
import { useHousehold } from '@/hooks/use-household'
import { useDisplayCurrency } from '@/hooks/use-display-currency'

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

const formSchema = z.object({
  shares: z.number().positive('Shares must be positive'),
  pricePerShare: z.number().positive('Price per share must be positive'),
  accountId: z.string().min(1, 'Please select an account'),
  investmentId: z.string().min(1, 'Please select an investment'),
})

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
          toast.success('Lot updated successfully!')
          onClose()
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
        })
        .exhaustive()
    },
  })

  const selectedAccountId = form.state.values.accountId
  const selectedAccount = investmentAccounts.find(
    (acc) => acc.id === selectedAccountId,
  )

  const availableInvestments = useMemo(() => {
    if (!selectedAccount) return []
    return selectedAccount.investments
  }, [selectedAccount])

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Lot</DialogTitle>
        <DialogDescription>
          Update lot details. Switching the investment moves the lot&apos;s
          shares.
        </DialogDescription>
      </DialogHeader>

      <form
        id="edit-lot-form"
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
                    items={investmentAccounts.map((account) => account.id)}
                    itemToStringLabel={(item) =>
                      investmentAccounts.find((acc) => acc.id === item)?.name ||
                      ''
                    }
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value || '')
                      form.setFieldValue('investmentId', '')
                    }}
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
                          const account = investmentAccounts.find(
                            (acc) => acc.id === item,
                          )
                          if (!account) return null
                          return (
                            <ComboboxItem key={item} value={item}>
                              <Item size="xs" className="p-0">
                                <ItemMedia variant="image">
                                  <Avatar className="size-6">
                                    <AvatarImage
                                      src={getLogoDomainURL(account.icon || '')}
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
                                        liability: account.type === 'liability',
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="investmentId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Investment</FieldLabel>
                  <Combobox
                    items={availableInvestments.map((inv) => inv.id)}
                    itemToStringLabel={(item) => {
                      const inv = availableInvestments.find(
                        (i) => i.id === item,
                      )
                      return inv ? `${inv.name} (${inv.symbol})` : ''
                    }}
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value || '')
                    }}
                    disabled={!selectedAccount}
                  >
                    <ComboboxInput
                      data-1p-ignore
                      id={field.name}
                      name={field.name}
                      placeholder={
                        selectedAccount
                          ? 'Select an investment'
                          : 'Select an account first'
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>No items found.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: string) => {
                          const inv = availableInvestments.find(
                            (i) => i.id === item,
                          )
                          return (
                            <ComboboxItem key={item} value={item}>
                              {inv ? `${inv.name} (${inv.symbol})` : ''}
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
            name="shares"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Shares</FieldLabel>
                  <Input
                    data-1p-ignore
                    id={field.name}
                    name={field.name}
                    type="number"
                    step="any"
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      field.handleChange(isNaN(val) ? 0 : val)
                    }}
                    aria-invalid={isInvalid}
                    placeholder="10"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="pricePerShare"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Price per Share</FieldLabel>
                  <FieldDescription>
                    {selectedAccount
                      ? `Currency: ${selectedAccount.householdCurrency.code}`
                      : 'Select an account to see currency'}
                  </FieldDescription>
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
        <Button type="submit" form="edit-lot-form" disabled={isUpdateInFlight}>
          {isUpdateInFlight ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </>
  )
}
