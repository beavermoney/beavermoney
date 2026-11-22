import { Trans } from '@lingui/react/macro'
import { RouterListItem } from '@/components/router-list-item'
import { useCurrency } from '@/hooks/use-currency'
import { Avatar } from '@astryxdesign/core/Avatar'
import { HStack, VStack } from '@astryxdesign/core/Layout'
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
  const unrealizedReturn = currency(data.unrealizedReturn ?? 0, {
    precision: 8,
  })
  const unrealizedReturnPercent =
    parseFloat(data.unrealizedReturnPercent ?? '0') * 100
  const isPositive = unrealizedReturn.value > 0
  const isNegative = unrealizedReturn.value < 0

  const formattedReturn = formatCurrencyWithPrivacyMode({
    value: data.unrealizedReturn ?? '0',
    currencyCode: data.householdCurrency.code,
  })
  const formattedPercent = isPrivacyModeEnabled
    ? '•••'
    : ` ${Math.abs(unrealizedReturnPercent).toFixed(2)}%`
  const signedPercent = isPrivacyModeEnabled
    ? '•••'
    : isPositive
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
        <HStack gap={0} vAlign="center" className="relative shrink-0 pr-2 pb-2">
          <Avatar src={getLogoTickerURL(data.symbol || '')} name={data.name} />
          <HStack className="absolute right-1 bottom-1 z-10 rounded-full bg-(--color-background-card) ring-2 ring-(--color-background-card)">
            <Avatar name={data.user.name} size="xsm" />
          </HStack>
        </HStack>
      }
      description={
        <VStack gap={1}>
          {data.symbol && data.symbol !== data.name && (
            <Text type="supporting">{data.symbol}</Text>
          )}
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
              {data.unrealizedReturn === null ? (
                <Trans>Average cost needs review</Trans>
              ) : (
                <>
                  {formattedReturn} (
                  {data.unrealizedReturnPercent === null ? '—' : signedPercent})
                </>
              )}
            </Text>
          )}
        </VStack>
      }
    />
  )
}
