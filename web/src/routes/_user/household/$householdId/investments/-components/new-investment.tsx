import { FormError } from '@/components/form-error'
import { SearchSelect } from '@/components/search-select'
import { Avatar } from '@astryxdesign/core/Avatar'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Heading } from '@astryxdesign/core/Heading'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { capitalize } from 'lodash-es'
import { useFragment, useMutation, useRefetchableFragment } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'

import { CurrencyInput } from '@/components/currency-input'
import { INVESTMENT_TYPE_LIST } from '@/constant'
import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'
import { newInvestmentFragment$key } from './__generated__/newInvestmentFragment.graphql'
import { type newInvestmentMutation } from './__generated__/newInvestmentMutation.graphql'

import { useCurrency } from '@/hooks/use-currency'
import {
  getLogoCryptoURL,
  getLogoDomainURL,
  getLogoTickerURL,
} from '@/lib/logo'
import { useEffect, useState, useTransition } from 'react'

import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { newInvestmentCryptoQuoteFragment$key } from './__generated__/newInvestmentCryptoQuoteFragment.graphql'
import { newInvestmentStockQuoteFragment$key } from './__generated__/newInvestmentStockQuoteFragment.graphql'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Investment name must be at least 1 character.')
    .max(32, 'Investment name must be at most 32 characters.'),
  symbol: z
    .string()
    .min(1, 'Investment symbol must be at least 1 character.')
    .max(32, 'Investment symbol must be at most 32 characters.'),
  type: z.literal(['stock', 'crypto']),
  amount: z.number(),
  costBasis: z.number(),
  accountId: z.string(),
})

const newInvestmentFragment = graphql`
  fragment newInvestmentFragment on Household
  @argumentDefinitions(viewUserIds: { type: "[ID!]" }) {
    accounts(where: { archived: false, userIDIn: $viewUserIds }) {
      edges {
        node {
          id
          type
          name
          icon
          value
          householdCurrency {
            code
          }
          user {
            name
          }
        }
      }
    }
  }
`

const newInvestmentStockQuoteFragment = graphql`
  fragment newInvestmentStockQuoteFragment on Query
  @refetchable(queryName: "newInvestmentStockQuoteQuery")
  @argumentDefinitions(symbol: { type: "String", defaultValue: "" }) {
    stockQuote(symbol: $symbol) {
      currentPrice
      symbol
      exchange
      name
      currency
    }
  }
`

const newInvestmentCryptoQuoteFragment = graphql`
  fragment newInvestmentCryptoQuoteFragment on Query
  @refetchable(queryName: "newInvestmentCryptoQuoteQuery")
  @argumentDefinitions(symbol: { type: "String", defaultValue: "" }) {
    cryptoQuote(symbol: $symbol) {
      currentPrice
      symbol
      exchange
      name
      currency
    }
  }
`

const newInvestmentMutation = graphql`
  mutation newInvestmentMutation($input: CreateInvestmentInputCustom!) {
    createInvestment(input: $input) {
      node {
        id
        name
        account {
          name
          id
        }
        ...investmentCardFragment
      }
    }
  }
`

type NewInvestmentProps = {
  newInvestmentFragmentRef: newInvestmentFragment$key
  newInvestmentStockQuoteFragmentRef: newInvestmentStockQuoteFragment$key
  newInvestmentCryptoQuoteFragmentRef: newInvestmentCryptoQuoteFragment$key
}

export function NewInvestment({
  newInvestmentFragmentRef,
  newInvestmentStockQuoteFragmentRef,
  newInvestmentCryptoQuoteFragmentRef,
}: NewInvestmentProps) {
  const showToast = useToast()

  const [isPending, startTransition] = useTransition()
  const data = useFragment(newInvestmentFragment, newInvestmentFragmentRef)

  const [stockQuoteData, refetchStockQuote] = useRefetchableFragment(
    newInvestmentStockQuoteFragment,
    newInvestmentStockQuoteFragmentRef,
  )

  const [cryptoQuoteData, refetchCryptoQuote] = useRefetchableFragment(
    newInvestmentCryptoQuoteFragment,
    newInvestmentCryptoQuoteFragmentRef,
  )

  const [queriedSymbol, setQueriedSymbol] = useState('')

  const navigate = useNavigate()

  const { displayCurrencyCode } = useDisplayCurrency()

  const { formatCurrency, formatCurrencyWithPrivacyMode } = useCurrency()

  const [commitMutation, isMutationInFlight] =
    useMutation<newInvestmentMutation>(newInvestmentMutation)
  const { household } = useHousehold()

  const investmentAccounts =
    data.accounts.edges
      ?.map((account) => {
        invariant(account?.node, 'Account node is null')
        return account.node
      })
      .filter((account) => account.type === 'investment') ?? []

  const form = useForm({
    defaultValues: {
      name: '',
      symbol: '',
      type: 'stock',
      amount: undefined as unknown as number,
      costBasis: undefined as unknown as number,
      accountId: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const result = await commitMutationResult<newInvestmentMutation>(
        commitMutation,
        {
          variables: {
            input: {
              input: {
                name: formData.name,
                symbol: formData.symbol,
                type: formData.type,
                amount: formData.amount.toString(),
                accountID: formData.accountId,
              },
              costBasis: formData.costBasis.toString(),
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
            resultData.createInvestment.node,
            'No data returned from mutation',
          )

          form.reset()
          navigate({
            from: '/household/$householdId/investments/new',
            to: '/household/$householdId/investments/$investmentId',
            search: (prev) => ({ ...prev }),
            params: {
              investmentId: resultData.createInvestment.node.id,
            },
          })
          showToast({
            type: 'info',
            body: `${resultData.createInvestment.node.name} is ready to go!`,
          })
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
    if (!accountSelectionAvailable) form.setFieldValue('accountId', '')
  }, [accountSelectionAvailable, form])

  useEffect(() => {
    form.validateField('symbol', 'change')
  }, [stockQuoteData, cryptoQuoteData, isPending, queriedSymbol, form])

  useEffect(() => {
    const investmentType = form.getFieldValue('type')
    const quote =
      investmentType === 'crypto'
        ? cryptoQuoteData.cryptoQuote
        : stockQuoteData.stockQuote

    if (quote) {
      form.setFieldValue('name', quote.name)
    }
  }, [stockQuoteData, cryptoQuoteData, form])

  return (
    <Card>
      <Stack direction="vertical" gap={2} as="header">
        <Heading level={2}>New Investment</Heading>
        <Stack direction="vertical" gap={4}>
          Start tracking your investment in Beaver Money
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <Stack
          as="form"
          direction="vertical"
          gap={6}
          id="new-investment-form"
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
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <SearchSelect
                      items={investmentAccounts.map((account) => account.id)}
                      getLabel={(item) =>
                        investmentAccounts.find((acc) => acc.id === item)
                          ?.name || ''
                      }
                      value={field.state.value}
                      onChange={(value) => {
                        field.handleChange(value || '')
                      }}
                      data-1p-ignore
                      id={field.name}
                      placeholder="Select an account"
                      onBlur={field.handleBlur}
                      label={'Account'}
                      renderOption={(item: string) => {
                        const account = investmentAccounts.find(
                          (acc) => acc.id === item,
                        )
                        if (!account) return null
                        return (
                          <span>
                            <Stack
                              direction="horizontal"
                              gap={3}
                              align="center"
                              wrap="wrap"
                            >
                              <Stack direction="vertical" gap={4}>
                                <Avatar
                                  src={getLogoDomainURL(account.icon || '')}
                                  alt={account.icon || 'unknown logo'}
                                  name={String(account.name)}
                                />
                              </Stack>
                              <Stack direction="vertical" gap={4}>
                                <Stack direction="vertical" gap={4}>
                                  {account.name}
                                </Stack>
                                <Stack direction="vertical" gap={4}>
                                  <Text hasTabularNumbers>
                                    {formatCurrencyWithPrivacyMode({
                                      value: account.value,
                                      currencyCode:
                                        account.householdCurrency.code,
                                      liability: account.type === 'liability',
                                    })}
                                  </Text>
                                  <span aria-hidden="true"> · </span>
                                  {account.user.name}
                                </Stack>
                              </Stack>
                            </Stack>
                          </span>
                        )
                      }}
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
              name="type"
              listeners={{
                onChange: ({ fieldApi }) => {
                  // Clear symbol and name when type changes
                  fieldApi.form.setFieldValue('symbol', '')
                  fieldApi.form.setFieldValue('name', '')
                  setQueriedSymbol('')
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <SearchSelect
                      items={INVESTMENT_TYPE_LIST}
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value || '')}
                      id={field.name}
                      placeholder="Select a type"
                      onBlur={field.handleBlur}
                      label={'Type'}
                      renderOption={(item: string) => (
                        <span>
                          <Text>{capitalize(item)}</Text>
                        </span>
                      )}
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
              name="symbol"
              validators={{
                onChangeAsync: ({ value, fieldApi }) => {
                  if (!value) return undefined // skip for empty value

                  // zod stuff
                  const parseResult = formSchema.shape.symbol.safeParse(value)
                  if (!parseResult.success) {
                    return parseResult.error.issues[0]
                  }

                  // value is different than queriedSymbol, meaning user is still typing
                  if (value !== queriedSymbol) return undefined

                  // is currently fetching
                  if (isPending) return undefined

                  // Check which type of investment this is
                  const investmentType = fieldApi.form.getFieldValue('type')

                  // after fetch, no quote found
                  const quote =
                    investmentType === 'crypto'
                      ? cryptoQuoteData.cryptoQuote
                      : stockQuoteData.stockQuote

                  if (!quote) {
                    return {
                      message: 'Unable to find a quote for this symbol.',
                    }
                  }

                  return undefined
                },
                onChangeAsyncDebounceMs: 500,
              }}
              listeners={{
                onChange: ({ value, fieldApi }) => {
                  startTransition(() => {
                    setQueriedSymbol(value)
                    const investmentType = fieldApi.form.getFieldValue('type')

                    if (investmentType === 'crypto') {
                      refetchCryptoQuote({ symbol: value })
                    } else {
                      refetchStockQuote({ symbol: value })
                    }
                  })
                },
                onChangeDebounceMs: 500,
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                const investmentType = form.getFieldValue('type')
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <TextInput
                      data-1p-ignore
                      id={field.name}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      placeholder={
                        investmentType === 'crypto'
                          ? 'e.g. BTC-CAD'
                          : 'e.g. XEQT.TO'
                      }
                      autoComplete="off"
                      label={'Symbol'}

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
            {(() => {
              const investmentType = form.getFieldValue('type')
              const quote =
                investmentType === 'crypto'
                  ? cryptoQuoteData.cryptoQuote
                  : stockQuoteData.stockQuote

              // For crypto logos, extract base symbol (e.g., "BTC" from "BTC-CAD")
              const logoSymbol = quote?.symbol
                ? investmentType === 'crypto'
                  ? quote.symbol.split('-')[0]
                  : quote.symbol
                : ''

              return quote ? (
                <Stack
                  direction="horizontal"
                  gap={3}
                  align="center"
                  wrap="wrap"
                >
                  <Stack direction="vertical" gap={4}>
                    <Avatar
                      src={
                        investmentType === 'crypto'
                          ? getLogoCryptoURL(logoSymbol)
                          : getLogoTickerURL(logoSymbol)
                      }
                      alt={quote.symbol || 'unknown logo'}
                      name={String(quote.symbol)}
                    />
                  </Stack>
                  <Stack direction="vertical" gap={4}>
                    <Stack direction="vertical" gap={4}>
                      {quote.name}
                    </Stack>
                    <Stack direction="vertical" gap={4}>
                      {formatCurrency({
                        value: quote.currentPrice,
                        currencyCode: quote.currency,
                      })}
                    </Stack>
                  </Stack>
                  <Stack direction="vertical" gap={4}>
                    <Stack direction="vertical" gap={4}>
                      <span>{quote.symbol}</span>
                    </Stack>
                    <Stack direction="vertical" gap={4}>
                      <span>{quote.exchange}</span>
                    </Stack>
                  </Stack>
                </Stack>
              ) : (
                <Stack
                  direction="horizontal"
                  gap={3}
                  align="center"
                  wrap="wrap"
                >
                  <Stack direction="vertical" gap={4}>
                    <Stack direction="vertical" gap={4}>
                      Start typing the symbol to fetch quote...
                    </Stack>
                    <Stack direction="vertical" gap={4}>
                      {investmentType === 'crypto'
                        ? 'Enter crypto symbol with currency pair (e.g., BTC-CAD, ETH-USD)'
                        : 'Symbols are formatted according to Yahoo Finance.'}
                    </Stack>
                  </Stack>
                  <Stack direction="vertical" gap={4}>
                    {isPending && <Spinner />}
                  </Stack>
                </Stack>
              )
            })()}
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
                      placeholder="e.g. iShares Core Equity ETF Portfolio"
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
            <form.Field
              name="amount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <NumberInput
                      data-1p-ignore
                      id={field.name}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      placeholder="How many shares do you own?"
                      autoComplete="off"
                      label={'Amount'}

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
              name="costBasis"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                // Get currency from quote data, fallback to household currency
                const investmentType = form.getFieldValue('type')
                const quote =
                  investmentType === 'crypto'
                    ? cryptoQuoteData.cryptoQuote
                    : stockQuoteData.stockQuote
                const currencyCode = quote?.currency ?? displayCurrencyCode

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
            form="new-investment-form"
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
