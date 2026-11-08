import { useStore } from '@tanstack/react-store'
import currency from 'currency.js'
import { identity } from 'lodash-es'
import { createContext, useCallback, useContext, useMemo } from 'react'
import { graphql, useFragment } from 'react-relay'
import invariant from 'tiny-invariant'
import type { useDisplayCurrencyFragment$key } from './__generated__/useDisplayCurrencyFragment.graphql'
import {
  displayCurrencyIdStore,
  setDisplayCurrencyId,
} from './display-currency-store'
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

  const displayCurrencies = useMemo(() => {
    invariant(data.householdCurrencies, 'householdCurrencies is required')

    return data.householdCurrencies.filter((currency) => currency.important)
  }, [data.householdCurrencies])

  const displayCurrencyCode = useMemo(() => {
    if (storedId) {
      const hc = displayCurrencies.find((currency) => currency.id === storedId)
      if (hc) return hc.code
    }

    return userHousehold.householdCurrency.code
  }, [displayCurrencies, storedId, userHousehold.householdCurrency.code])

  const nextDisplayCurrency = useMemo(() => {
    if (displayCurrencies.length < 2) return null

    const currentIndex = displayCurrencies.findIndex(
      (currency) => currency.code === displayCurrencyCode,
    )
    return displayCurrencies[(currentIndex + 1) % displayCurrencies.length]
  }, [displayCurrencies, displayCurrencyCode])

  const cycleDisplayCurrency = useCallback(() => {
    if (!nextDisplayCurrency) return false

    setDisplayCurrencyId(nextDisplayCurrency.id)
    return true
  }, [nextDisplayCurrency])

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

  return {
    displayCurrencyCode,
    nextDisplayCurrencyCode: nextDisplayCurrency?.code ?? null,
    cycleDisplayCurrency,
    convert,
  }
}
