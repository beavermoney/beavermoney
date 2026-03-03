import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { Link } from '@tanstack/react-router'
import type { accountCardFragment$key } from './__generated__/accountCardFragment.graphql'
import { cn } from '@/lib/utils'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { useCurrency } from '@/hooks/use-currency'
import { getPrettyTime } from '@/lib/time'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoDomainURL } from '@/lib/logo'
import currency from 'currency.js'
import { Field, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'

const accountCardFragment = graphql`
  fragment accountCardFragment on Account {
    id
    name
    type
    icon
    updateTime
    currency {
      code
    }
    user {
      name
    }
    value
    balance
  }
`

type AccountCardProps = {
  fragmentRef: accountCardFragment$key
}

export function AccountCard({ fragmentRef }: AccountCardProps) {
  const data = useFragment(accountCardFragment, fragmentRef)

  const balance = currency(data.balance)
  const value = currency(data.value)

  const { formatCurrencyWithPrivacyMode } = useCurrency()

  return (
    <>
      <Item
        render={
          <Link
            className="no-underline!"
            from="/household/$householdId/"
            to="/household/$householdId/accounts/$accountId"
            search={(prev) => ({ ...prev })}
            activeOptions={{ exact: true }}
            params={{ accountId: data.id }}
          >
            {({ isActive }) => (
              <>
                <ItemMedia variant="image">
                  <Avatar className="">
                    <AvatarImage
                      src={getLogoDomainURL(data.icon || '')}
                      alt={data.icon || 'unknown logo'}
                    />
                    <AvatarFallback>{data.name}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-px">
                  <ItemTitle className={cn(isActive && 'font-semibold')}>
                    {data.name}
                  </ItemTitle>
                  <ItemDescription>{data.user.name}</ItemDescription>
                </ItemContent>
                <ItemContent className="items-end gap-px">
                  <ItemTitle className="">
                    <span className="tabular-nums">
                      {formatCurrencyWithPrivacyMode({
                        value: data.value,
                        currencyCode: data.currency.code,
                        liability: data.type === 'liability',
                      })}
                    </span>
                  </ItemTitle>
                  <ItemDescription className="">
                    <span>{getPrettyTime(new Date(data.updateTime))}</span>
                  </ItemDescription>
                </ItemContent>
              </>
            )}
          </Link>
        }
      />
      {data.type === 'investment' && balance.value != 0 && value.value != 0 && (
        <Item
          render={
            <Link
              className="no-underline!"
              from="/household/$householdId/"
              to="/household/$householdId/accounts/$accountId"
              search={(prev) => ({ ...prev })}
              activeOptions={{ exact: true }}
              params={{ accountId: data.id }}
            >
              {() => {
                const total = value.value
                const cash = balance.value

                const cashPercentage = total === 0 ? 0 : (cash / total) * 100

                const investmentPercentage = 100 - cashPercentage

                const cashPercentageDisplay = Number(cashPercentage.toFixed(2))
                const investmentPercentageDisplay = Number(
                  investmentPercentage.toFixed(2),
                )

                return (
                  <Field className="w-full">
                    <FieldLabel htmlFor="progress-upload">
                      <span>Investment {investmentPercentageDisplay}%</span>
                      <span className="ml-auto">
                        Cash {cashPercentageDisplay}% (
                        <span className="tabular-nums">
                          {formatCurrencyWithPrivacyMode({
                            value: data.balance,
                            currencyCode: data.currency.code,
                            liability: data.type === 'liability',
                          })}
                        </span>
                        )
                      </span>
                    </FieldLabel>
                    <Progress value={investmentPercentage} />
                  </Field>
                )
              }}
            </Link>
          }
        />
      )}
    </>
  )
}
