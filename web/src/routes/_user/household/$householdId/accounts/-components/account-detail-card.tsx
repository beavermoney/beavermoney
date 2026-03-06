import { graphql, useFragment } from 'react-relay'
import currency from 'currency.js'
import { capitalize } from 'lodash-es'
import { ArchiveIcon, PencilIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { accountDetailCardFragment$key } from './__generated__/accountDetailCardFragment.graphql'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import { Field, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { useCurrency } from '@/hooks/use-currency'
import { useHousehold } from '@/hooks/use-household'
import { getLogoDomainURL } from '@/lib/logo'
import { ACCOUNT_TYPE_DESCRIPTION } from '@/constant'
import { cn } from '@/lib/utils'

// eslint-disable-next-line react-refresh/only-export-components
export const accountDetailCardFragment = graphql`
  fragment accountDetailCardFragment on Account {
    id
    name
    type
    icon
    archived
    currency {
      code
    }
    user {
      name
    }
    value
    balance
    valueInHouseholdCurrency
  }
`

type AccountDetailCardProps = {
  fragmentRef: accountDetailCardFragment$key
}

export function AccountDetailCard({ fragmentRef }: AccountDetailCardProps) {
  const data = useFragment(accountDetailCardFragment, fragmentRef)
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { household } = useHousehold()

  const balance = currency(data.balance)
  const value = currency(data.value)
  const valueInHousehold = currency(data.valueInHouseholdCurrency)

  const isLiability = data.type === 'liability'
  const isInvestment = data.type === 'investment'
  const showInvestmentSplit =
    isInvestment && balance.value !== 0 && value.value !== 0

  return (
    <ItemGroup>
      {/* Header row: avatar, name, type, edit button */}
      <Item
        render={
          <div className="flex w-full items-center gap-3 py-1">
            <div className="shrink-0">
              <Avatar>
                <AvatarImage
                  src={getLogoDomainURL(data.icon || '')}
                  alt={data.icon || 'unknown logo'}
                />
                <AvatarFallback>{data.name}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{data.name}</span>
                {data.archived && (
                  <Badge variant="secondary" className="gap-1">
                    <ArchiveIcon className="size-3" />
                    Archived
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground text-sm">
                {capitalize(data.type)}
              </span>
            </div>
            <div className="shrink-0">
              <Link
                from="/household/$householdId/"
                to="/household/$householdId/accounts/$accountId/edit"
                search={(prev) => ({ ...prev })}
                params={{ accountId: data.id }}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'no-underline!',
                )}
              >
                <PencilIcon className="size-4" />
                <span className="sr-only">Edit account</span>
              </Link>
            </div>
          </div>
        }
      />

      <ItemSeparator />

      {/* General info row */}
      <Item
        render={
          <div className="flex w-full flex-col gap-1">
            <ItemContent className="flex-row items-center justify-between">
              <ItemDescription>Value</ItemDescription>
              <ItemTitle className="tabular-nums">
                {formatCurrencyWithPrivacyMode({
                  value: data.value,
                  currencyCode: data.currency.code,
                  liability: isLiability,
                })}
              </ItemTitle>
            </ItemContent>
            {household.currency.code !== data.currency.code && (
              <ItemContent className="flex-row items-center justify-between">
                <ItemDescription>
                  Value ({household.currency.code})
                </ItemDescription>
                <ItemTitle className="text-muted-foreground text-sm tabular-nums">
                  {formatCurrencyWithPrivacyMode({
                    value: valueInHousehold.value.toString(),
                    currencyCode: household.currency.code,
                    liability: isLiability,
                  })}
                </ItemTitle>
              </ItemContent>
            )}
            <ItemContent className="flex-row items-center justify-between">
              <ItemDescription>Currency</ItemDescription>
              <ItemTitle>{data.currency.code}</ItemTitle>
            </ItemContent>
            <ItemContent className="flex-row items-center justify-between">
              <ItemDescription>Owner</ItemDescription>
              <ItemTitle>{data.user.name}</ItemTitle>
            </ItemContent>
            <ItemContent className="flex-row items-center justify-between">
              <ItemDescription>Type</ItemDescription>
              <ItemTitle>{capitalize(data.type)}</ItemTitle>
            </ItemContent>
            <ItemContent className="flex-row items-start justify-between gap-4">
              <ItemDescription>About</ItemDescription>
              <ItemTitle className="text-muted-foreground text-right text-sm">
                {ACCOUNT_TYPE_DESCRIPTION[data.type]}
              </ItemTitle>
            </ItemContent>
          </div>
        }
      />

      {/* Investment-specific section */}
      {showInvestmentSplit && (
        <>
          <ItemSeparator />
          <Item
            render={
              <div className="w-full py-1">
                <Field>
                  {(() => {
                    const total = value.value
                    const cash = balance.value
                    const cashPct = total === 0 ? 0 : (cash / total) * 100
                    const investPct = 100 - cashPct

                    return (
                      <>
                        <FieldLabel htmlFor="account-detail-progress">
                          <span>Investment {investPct.toFixed(1)}%</span>
                          <span className="ml-auto">
                            Cash {cashPct.toFixed(1)}% (
                            <span className="tabular-nums">
                              {formatCurrencyWithPrivacyMode({
                                value: data.balance,
                                currencyCode: data.currency.code,
                              })}
                            </span>
                            )
                          </span>
                        </FieldLabel>
                        <Progress
                          id="account-detail-progress"
                          value={investPct}
                        />
                      </>
                    )
                  })()}
                </Field>
              </div>
            }
          />
        </>
      )}
    </ItemGroup>
  )
}
