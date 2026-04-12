import { createContext, useCallback, useContext, useMemo } from 'react'
import { graphql, useFragment } from 'react-relay'
import { useStore } from '@tanstack/react-store'
import currency from 'currency.js'
import type { useDisplayCurrencyFragment$key } from './__generated__/useDisplayCurrencyFragment.graphql'
import { useUser } from './use-user'
import { displayCurrencyIdStore } from './display-currency-store'
import { identity } from 'lodash-es'

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
    # eslint-disable-next-line relay/unused-fields
    userHouseholds {
      user {
        id
      }
      defaultCurrency {
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
  const user = useUser()
  const storedId = useStore(displayCurrencyIdStore, identity)

  const displayCurrencyCode = useMemo(() => {
    if (storedId) {
      const hc = (data.householdCurrencies ?? []).find(
        (c) => c.id === storedId && c.important,
      )
      if (hc) return hc.code
    }

    const userHousehold = (data.userHouseholds ?? []).find(
      (uh) => uh.user.id === user.id,
    )
    if (userHousehold?.defaultCurrency?.code) {
      return userHousehold.defaultCurrency.code
    }

    throw new Error("Couldn't determine display currency")
  }, [data, user.id, storedId])

  const rateMap = useMemo(() => {
    const map = new Map<string, currency>()
    for (const rate of data.householdRates ?? []) {
      map.set(
        `${rate.fromCurrency.code}->${rate.toCurrency.code}`,
        currency(rate.rate, { precision: 8 }),
      )
    }
    return map
  }, [data.householdRates])

  const convert = useCallback(
    (amount: currency | string | number, fromCurrencyCode: string) => {
      if (fromCurrencyCode === displayCurrencyCode) return currency(amount)
      const rate = rateMap.get(`${fromCurrencyCode}->${displayCurrencyCode}`)
      if (rate == null) {
        throw new Error(
          `Missing exchange rate: ${fromCurrencyCode} → ${displayCurrencyCode}`,
        )
      }
      return currency(amount).multiply(rate.value)
    },
    [displayCurrencyCode, rateMap],
  )

  return { displayCurrencyCode, convert }
}
