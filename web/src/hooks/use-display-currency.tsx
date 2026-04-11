import { createContext, useContext, useMemo } from 'react'
import { graphql, useFragment } from 'react-relay'
import { useStore } from '@tanstack/react-store'
import type { useDisplayCurrencyFragment$key } from './__generated__/useDisplayCurrencyFragment.graphql'
import { useUser } from './use-user'
import { displayCurrencyIdStore } from './display-currency-store'

const UseDisplayCurrencyFragment = graphql`
  fragment useDisplayCurrencyFragment on Household {
    currency {
      code
    }
    # eslint-disable-next-line relay/unused-fields
    householdCurrencies {
      id
      important
      currency {
        code
      }
    }
    # eslint-disable-next-line relay/unused-fields
    userHouseholds {
      user {
        id
      }
      defaultCurrency {
        currency {
          code
        }
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
  const storedId = useStore(displayCurrencyIdStore)

  return useMemo(() => {
    if (storedId) {
      const hc = (data.householdCurrencies ?? []).find(
        (c) => c.id === storedId && c.important,
      )
      if (hc) return { code: hc.currency.code }
    }

    const userHousehold = (data.userHouseholds ?? []).find(
      (uh) => uh.user.id === user.id,
    )
    if (userHousehold?.defaultCurrency?.currency) {
      return { code: userHousehold.defaultCurrency.currency.code }
    }

    return { code: data.currency.code }
  }, [data, user.id, storedId])
}
