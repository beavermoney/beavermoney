import { FormError } from '@/components/form-error'
import { SearchSelect } from '@/components/search-select'
import { Avatar } from '@astryxdesign/core/Avatar'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm, useStore } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import currency from 'currency.js'
import { useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'
import type {
  AccountCategory,
  newAccountMutation,
} from './__generated__/newAccountMutation.graphql'

import { CurrencyInput } from '@/components/currency-input'
import {
  ACCOUNT_CATEGORY_APPLICABLE_TYPES,
  ACCOUNT_CATEGORY_OPTIONS,
} from '@/constant'
import { useDefaultOwnerUserID } from '@/hooks/use-default-owner-user-id'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdMembers } from '@/hooks/use-household-members'
import { useUser } from '@/hooks/use-user'
import { commitMutationResult } from '@/lib/relay'
import { OwnerSelect } from '../../-components/owner-select'

import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { SUPPORTED_CURRENCIES } from '@/lib/currencies'
import { getLogoDomainURL } from '@/lib/logo'
import { AccountTypePicker } from './account-type-picker'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name must be at least 1 character.')
    .max(32, 'Account name must be at most 32 characters.'),
  icon: z.string(),
  currencyCode: z.string(),
  type: z.literal([
    'liquidity',
    'investment',
    'property',
    'receivable',
    'liability',
  ]),
  category: z.string(),
  balance: z.number(),
  ownerUserID: z.string().min(1, 'Please select an owner'),
})

const newAccountMutation = graphql`
  mutation newAccountMutation($input: CreateAccountInput!) {
    createAccount(input: $input) {
      node {
        id
        type
        name
        ...accountCardFragment
      }
    }
  }
`

export function NewAccount() {
  const showToast = useToast()

  const navigate = useNavigate()

  const [commitMutation, isMutationInFlight] =
    useMutation<newAccountMutation>(newAccountMutation)

  const { displayCurrencyCode } = useDisplayCurrency()

  const { household } = useHousehold()
  const { user } = useUser()

  const ownerOptions = useHouseholdMembers()
  const defaultOwnerUserID = useDefaultOwnerUserID(user.id)

  const form = useForm({
    defaultValues: {
      name: '',
      icon: '',
      type: '',
      category: '',
      currencyCode: displayCurrencyCode,
      balance: undefined as unknown as number,
      ownerUserID: defaultOwnerUserID,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const currencyID = household.householdCurrencies?.find(
        (hc) => hc.code === formData.currencyCode,
      )?.id
      invariant(currencyID, 'Currency not found')

      const balance =
        formData.type === 'liability'
          ? currency(formData.balance).multiply(-1)
          : currency(formData.balance)

      const result = await commitMutationResult<newAccountMutation>(
        commitMutation,
        {
          variables: {
            input: {
              name: formData.name,
              type: formData.type,
              category: (formData.category || null) as AccountCategory | null,
              householdCurrencyID: currencyID,
              balance: balance.toString(),
              icon: formData.icon || null,
              userID: formData.ownerUserID,
            },
          },
          updater: (store) => {
            store.get(household.id)?.invalidateRecord()
          },
        },
      )

      // 2. Pattern match the result
      match(result)
        .with({ status: 'success' }, ({ data: resultData }) => {
          invariant(
            resultData.createAccount.node,
            'No data returned from mutation',
          )

          form.reset()
          navigate({
            from: '/household/$householdId/accounts/new',
            to: '/household/$householdId/accounts/$accountId',
            search: (prev) => ({ ...prev }),
            params: {
              accountId: resultData.createAccount.node.id,
            },
          })
          showToast({
            type: 'info',
            body: `${resultData.createAccount.node.name} is ready to go!`,
          })
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  const currencyCode = useStore(form.store, (state) => {
    return state.values.currencyCode ?? displayCurrencyCode
  })

  const accountType = useStore(form.store, (state) => state.values.type)
  const showCategory = ACCOUNT_CATEGORY_APPLICABLE_TYPES.has(accountType)

  return (
    <Card>
      <Stack direction="vertical" gap={2} as="header">
        <Heading level={2}>New Account</Heading>
        <Stack direction="vertical" gap={4}>
          Start tracking your account in Beaver Money
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <Stack
          as="form"
          direction="vertical"
          gap={6}
          id="new-account-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FormLayout>
            <form.Field
              name="name"
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
                      placeholder="Wealthsimple Chequing"
                      autoComplete="off"
                      label={'Name'}

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
              name="icon"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <Stack direction="vertical" gap={4}>
                      Enter a domain to fetch logo (e.g., chase.com)
                    </Stack>
                    <Stack direction="horizontal" gap={3} align="center">
                      <TextInput
                        data-1p-ignore
                        id={field.name}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        placeholder="e.g., chase.com"
                        autoComplete="off"
                        label={'Icon'}

                        value={String(field.state.value ?? '')}
                        onChange={(_value, event) =>
                          ((e) => {
                            field.handleChange(e.target.value)
                          })(event)
                        }
                        htmlName={field.name}
                      />
                      {field.state.value && (
                        <Stack direction="horizontal" gap={2} align="center">
                          <Avatar
                            src={getLogoDomainURL(field.state.value)}
                            alt={field.state.value}
                            name={String(
                              field.state.value.slice(0, 2).toUpperCase(),
                            )}
                          />
                        </Stack>
                      )}
                    </Stack>
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <form.Field
              name="type"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                const labelId = `${field.name}-label`
                const errorId = `${field.name}-error`
                return (
                  <fieldset data-invalid={isInvalid}>
                    <legend id={labelId}>Type</legend>
                    <AccountTypePicker
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      labelledBy={labelId}
                      describedBy={isInvalid ? errorId : undefined}
                      invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FormError
                        id={errorId}
                        errors={field.state.meta.errors}
                      />
                    )}
                  </fieldset>
                )
              }}
            />
            {showCategory && (
              <form.Field
                name="category"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  const selectedItem =
                    ACCOUNT_CATEGORY_OPTIONS.find(
                      (o) => o.value === field.state.value,
                    ) ?? null
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <SearchSelect
                        items={ACCOUNT_CATEGORY_OPTIONS}
                        value={selectedItem}
                        onChange={(item) =>
                          field.handleChange(item?.value ?? '')
                        }
                        id={field.name}
                        placeholder="None (Taxable)"
                        onBlur={field.handleBlur}
                        label={'Category (optional)'}
                        renderOption={(item: {
                          value: string
                          label: string
                        }) => <span>{item.label}</span>}
                        emptyText={<>No items found.</>}
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
              name="currencyCode"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <SearchSelect
                      items={SUPPORTED_CURRENCIES.map((c) => c.code)}
                      value={field.state.value}
                      onChange={(value) => {
                        field.handleChange(value || '')
                      }}
                      id={field.name}
                      placeholder="Select a currency"
                      onBlur={field.handleBlur}
                      label={'Currency'}
                      renderOption={(item: string) => <span>{item}</span>}
                      emptyText={<>No items found.</>}
                    />
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <form.Field
              name="balance"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <CurrencyInput
                      id={field.name}
                      name={field.name}
                      placeholder="Please enter a number"
                      onValueChange={(e) => {
                        field.handleChange(e.floatValue!)
                      }}
                      value={field.state.value}
                      locale={household.locale}
                      currency={currencyCode}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      allowNegative={true}
                      decimalScale={2}
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
            form="new-account-form"
            label={String(isMutationInFlight ? 'Creating...' : 'Create')}
            variant={'primary'}

            isDisabled={isMutationInFlight}
          >
            {isMutationInFlight ? 'Creating...' : 'Create'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}
