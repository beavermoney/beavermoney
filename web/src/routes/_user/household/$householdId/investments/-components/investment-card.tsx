import { Trans } from '@lingui/react/macro'
import { RouterListItem } from '@/components/router-list-item'
import { useCurrency } from '@/hooks/use-currency'
import { Avatar } from '@astryxdesign/core/Avatar'
import { VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { LinkOptions } from '@tanstack/react-router'
import currency from 'currency.js'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'
import type { investmentCardFragment$key } from './__generated__/investmentCardFragment.graphql'

import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { getLogoTickerURL } from '@/lib/logo'

const investmentCardFragment = graphql`
  fragment investmentCardFragment on Investment {
    id
    name
    symbol
    quote
    updateTime
    householdCurrency {
      code
    }
    user {
      name
    }
    amount
    value
    unrealizedReturn
    unrealizedReturnPercent
  }
`

type InvestmentCardProps = {
  fragmentRef: investmentCardFragment$key
  linkOptions?: LinkOptions
  className?: string
  showReturn?: boolean
}

export function InvestmentCard({
  fragmentRef,
  linkOptions,
  showReturn = true,
  className: _className,
}: InvestmentCardProps) {
  const data = useFragment(investmentCardFragment, fragmentRef)

  const { formatCurrencyWithPrivacyMode, formatCurrency } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()

  const hasShares = currency(data.amount).value !== 0
  const unrealizedReturn = currency(data.unrealizedReturn, { precision: 8 })
  const unrealizedReturnPercent = parseFloat(data.unrealizedReturnPercent) * 100
  const isPositive = unrealizedReturn.value > 0
  const isNegative = unrealizedReturn.value < 0

  const formattedReturn = formatCurrencyWithPrivacyMode({
    value: data.unrealizedReturn,
    currencyCode: data.householdCurrency.code,
  })
  const formattedPercent = isPrivacyModeEnabled
    ? '•••'
    : ` ${Math.abs(unrealizedReturnPercent).toFixed(2)}%`
  const signedPercent = isPositive
    ? `+${formattedPercent}`
    : isNegative
      ? `−${formattedPercent}`
      : formattedPercent

  return (
    <RouterListItem
      from="/household/$householdId"
      to="/household/$householdId/investments/$investmentId"
      params={{ investmentId: data.id }}
      {...linkOptions}
      label={data.name}
      startContent={
        <Avatar src={getLogoTickerURL(data.symbol || '')} name={data.name} />
      }
      description={
        <VStack gap={1}>
          <Text type="supporting">
            {[data.symbol !== data.name ? data.symbol : null, data.user.name]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          <Text type="supporting" hasTabularNumbers>
            {isPrivacyModeEnabled ? '•••' : data.amount} <Trans>shares ·</Trans>{' '}
            {formatCurrency({
              value: data.quote,
              currencyCode: data.householdCurrency.code,
            })}{' '}
            <Trans>per share</Trans>
          </Text>
        </VStack>
      }
      endContent={
        <VStack gap={1} hAlign="end">
          <Text type="label" hasTabularNumbers>
            {formatCurrencyWithPrivacyMode({
              value: data.value,
              currencyCode: data.householdCurrency.code,
            })}
          </Text>
          {showReturn && hasShares && (
            <Text type="supporting" hasTabularNumbers>
              {formattedReturn} ({signedPercent})
            </Text>
          )}
        </VStack>
      }
    />
  )
}
