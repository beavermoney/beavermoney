/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext } from 'react'
import { useStore } from '@tanstack/react-store'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { identity } from 'lodash-es'
import {
  clearViewUserId,
  setViewUserId as storeSetViewUserId,
  viewUserIdStoreFor,
} from './view-scope-store'

type HouseholdViewScopeContextValue = {
  householdId: string
}

const HouseholdViewScopeContext =
  createContext<HouseholdViewScopeContextValue | null>(null)

type HouseholdViewScopeProviderProps = {
  children: React.ReactNode
  householdId: string
}

export function HouseholdViewScopeProvider({
  children,
  householdId,
}: HouseholdViewScopeProviderProps) {
  return (
    <HouseholdViewScopeContext.Provider value={{ householdId }}>
      {children}
    </HouseholdViewScopeContext.Provider>
  )
}

export function useHouseholdViewScope() {
  const ctx = useContext(HouseholdViewScopeContext)
  if (ctx === null) {
    throw new Error(
      'useHouseholdViewScope must be used within HouseholdViewScopeProvider',
    )
  }

  const { householdId } = ctx
  const search = useSearch({
    strict: false,
  })
  const urlViewUserId = (search as Record<string, unknown>).view_user_id as
    | string
    | null
    | undefined
  const storeViewUserId = useStore(viewUserIdStoreFor(householdId), identity)
  const navigate = useNavigate({ from: '/household/$householdId' })

  const viewUserId =
    urlViewUserId !== undefined ? (urlViewUserId ?? null) : storeViewUserId

  const setViewUserId = (next: string | null) => {
    if (next === null) {
      clearViewUserId(householdId)
    } else {
      storeSetViewUserId(householdId, next)
    }

    void navigate({
      search: (prev: Record<string, unknown>) => {
        const nextSearch: Record<string, unknown> = { ...prev }

        if (next === null) {
          delete nextSearch.view_user_id
        } else {
          nextSearch.view_user_id = next
        }

        return nextSearch
      },
      replace: true,
    })
  }

  return {
    viewUserId,
    isCombined: viewUserId === null,
    setViewUserId,
  }
}
