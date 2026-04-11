import { graphql } from 'relay-runtime'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation, useRefetchableFragment } from 'react-relay'
import { capitalize } from 'lodash-es'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import { useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { INVESTMENT_TYPE_LIST } from '@/constant'
import { useHousehold } from '@/hooks/use-household'
import { CurrencyInput } from '@/components/currency-input'
import { commitMutationResult } from '@/lib/relay'
import { type newInvestmentMutation } from './__generated__/newInvestmentMutation.graphql'
import { newInvestmentFragment$key } from './__generated__/newInvestmentFragment.graphql'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  getLogoTickerURL,
  getLogoCryptoURL,
  getLogoDomainURL,
} from '@/lib/logo'
import { useCurrency } from '@/hooks/use-currency'
import { cn } from '@/lib/utils'
import { useEffect, useState, useTransition } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { newInvestmentStockQuoteFragment$key } from './__generated__/newInvestmentStockQuoteFragment.graphql'
import { newInvestmentCryptoQuoteFragment$key } from './__generated__/newInvestmentCryptoQuoteFragment.graphql'

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
  fragment newInvestmentFragment on Household {
    accounts(where: { archived: false }) {
      edges {
        node {
          id
          type
          name
          icon
          value
          currency {
            code
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
        valueInDisplayCurrency
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
          toast.success(
            `${resultData.createInvestment.node.name} is ready to go!`,
          )
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
        })
        .exhaustive()
    },
  })

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Investment</CardTitle>
        <CardDescription>
          Start tracking your investment in Beaver Money
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="new-investment-form"
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
                        investmentAccounts.find((acc) => acc.id === item)
                          ?.name || ''
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
                            return (
                              <ComboboxItem
                                key={item}
                                value={item}
                                className="flex items-center gap-2"
                              >
                                <Avatar className="size-5">
                                  <AvatarImage
                                    src={getLogoDomainURL(account?.icon || '')}
                                    alt={account?.icon || 'unknown logo'}
                                  />
                                  <AvatarFallback className="text-[8px]">
                                    {account?.name}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="flex-1">{account?.name}</span>
                                <span className="text-muted-foreground font-mono">
                                  {account &&
                                    formatCurrencyWithPrivacyMode({
                                      value: account.value,
                                      currencyCode: account.currency.code,
                                      liability: account.type === 'liability',
                                    })}
                                </span>
                              </ComboboxItem>
                            )
                          }}
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
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                    <Combobox
                      items={INVESTMENT_TYPE_LIST}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value || '')}
                    >
                      <ComboboxInput
                        id={field.name}
                        name={field.name}
                        placeholder="Select a type"
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        className="*:capitalize"
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList className="">
                          {(item: string) => (
                            <ComboboxItem
                              key={item}
                              value={item}
                              className="flex flex-col items-start gap-0"
                            >
                              <span className="">{capitalize(item)}</span>
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
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Symbol</FieldLabel>
                    <Input
                      data-1p-ignore
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={
                        investmentType === 'crypto'
                          ? 'e.g. BTC-CAD'
                          : 'e.g. XEQT.TO'
                      }
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
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
                <Item variant={'outline'}>
                  <ItemMedia variant="image">
                    <Avatar className="">
                      <AvatarImage
                        src={
                          investmentType === 'crypto'
                            ? getLogoCryptoURL(logoSymbol)
                            : getLogoTickerURL(logoSymbol)
                        }
                        alt={quote.symbol || 'unknown logo'}
                      />
                      <AvatarFallback>{quote.symbol}</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="gap-px">
                    <ItemTitle className={cn('font-semibold')}>
                      {quote.name}
                    </ItemTitle>
                    <ItemDescription>
                      {formatCurrency({
                        value: quote.currentPrice,
                        currencyCode: quote.currency,
                      })}
                    </ItemDescription>
                  </ItemContent>
                  <ItemContent className="items-end gap-px">
                    <ItemTitle className="">
                      <span>{quote.symbol}</span>
                    </ItemTitle>
                    <ItemDescription className="">
                      <span>{quote.exchange}</span>
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ) : (
                <Item variant="outline">
                  <ItemContent className="gap-px">
                    <ItemTitle className={cn('')}>
                      Start typing the symbol to fetch quote...
                    </ItemTitle>
                    <ItemDescription>
                      {investmentType === 'crypto'
                        ? 'Enter crypto symbol with currency pair (e.g., BTC-CAD, ETH-USD)'
                        : 'Symbols are formatted according to Yahoo Finance.'}
                    </ItemDescription>
                  </ItemContent>

                  <ItemContent className="items-end gap-px">
                    {isPending && <Spinner />}
                  </ItemContent>
                </Item>
              )
            })()}
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      data-1p-ignore
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="e.g. iShares Core Equity ETF Portfolio"
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
              name="amount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                    <Input
                      type="number"
                      inputMode="decimal"
                      data-1p-ignore
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          field.handleChange(undefined!)
                        } else {
                          field.handleChange(Number(e.target.value))
                        }
                      }}
                      aria-invalid={isInvalid}
                      placeholder="How many shares do you own?"
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
                const currencyCode = quote?.currency || household.currency.code

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Cost Basis</FieldLabel>
                    <FieldDescription> </FieldDescription>
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
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            disabled={isMutationInFlight}
            type="submit"
            form="new-investment-form"
          >
            {isMutationInFlight ? 'Creating...' : 'Create'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
