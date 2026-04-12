import { createContext, useCallback, useContext, useMemo } from 'react'
import { graphql, useFragment } from 'react-relay'
import { useStore } from '@tanstack/react-store'
import currency from 'currency.js'
import type { useDisplayCurrencyFragment$key } from './__generated__/useDisplayCurrencyFragment.graphql'
import { displayCurrencyIdStore } from './display-currency-store'
import { identity } from 'lodash-es'
import invariant from 'tiny-invariant'
import { useUserHousehold } from './use-user-household'

const UseDisplayCurrencyFragment = graphql`
  fragment useDisplayCurrencyFragment on Household {
    # eslint-disable-next-line relay/unused-fields
    householdCurrencies {
      id
      important
      code
    }
    # eslint-disable-next-line relay/unused-fields
    householdRates {
      rate
      fromCurrency {
        code
      }
      toCurrency {
        code
      }
    }
  }
`

const DisplayCurrencyContext =
  createContext<useDisplayCurrencyFragment$key | null>(null)

export const DisplayCurrencyProvider = ({
  children,
  householdRef,
}: {
  children: React.ReactNode
  householdRef: useDisplayCurrencyFragment$key
}) => {
  return (
    <DisplayCurrencyContext.Provider value={householdRef}>
      {children}
    </DisplayCurrencyContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDisplayCurrency = () => {
  const ref = useContext(DisplayCurrencyContext)
  if (ref === null) {
    throw new Error(
      'useDisplayCurrency must be used within a DisplayCurrencyProvider',
    )
  }
  const data = useFragment(UseDisplayCurrencyFragment, ref)
  const storedId = useStore(displayCurrencyIdStore, identity)

  const { userHousehold } = useUserHousehold()

  const displayCurrencyCode = useMemo(() => {
    invariant(data.householdCurrencies, 'householdCurrencies is required')

    if (storedId) {
      const hc = data.householdCurrencies.find(
        (c) => c.id === storedId && c.important,
      )
      if (hc) return hc.code
    }

    return userHousehold.householdCurrency.code
  }, [data.householdCurrencies, storedId, userHousehold.householdCurrency.code])

  const rateMap = useMemo(() => {
    invariant(data.householdRates, 'householdRates is required')

    return new Map(
      data.householdRates.map((rate) => [
        `${rate.fromCurrency.code}->${rate.toCurrency.code}`,
        currency(rate.rate, { precision: 8 }),
      ]),
    )
  }, [data.householdRates])

  const convert = useCallback(
    (amount: currency | string | number, fromCurrencyCode: string) => {
      if (fromCurrencyCode === displayCurrencyCode) return currency(amount)

      const rate = rateMap.get(`${fromCurrencyCode}->${displayCurrencyCode}`)

      invariant(
        rate,
        `Missing exchange rate: ${fromCurrencyCode} → ${displayCurrencyCode}`,
      )

      return currency(amount).multiply(rate.value)
    },
    [displayCurrencyCode, rateMap],
  )

  return { displayCurrencyCode, convert }
}
