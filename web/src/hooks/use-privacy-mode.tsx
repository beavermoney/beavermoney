import { LOCAL_STORAGE_PRIVACY_MODE_KEY } from '@/constant'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

type PrivacyModeContextType = {
  isPrivacyModeEnabled: boolean
  togglePrivacyMode: () => void
}

const PrivacyModeContext = createContext<PrivacyModeContextType | undefined>(
  undefined,
)

export function PrivacyModeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_PRIVACY_MODE_KEY)
      return storedValue ? JSON.parse(storedValue) : false
    }
    return false
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        LOCAL_STORAGE_PRIVACY_MODE_KEY,
        JSON.stringify(isPrivacyModeEnabled),
      )
    }
  }, [isPrivacyModeEnabled])

  const togglePrivacyMode = () => {
    setIsPrivacyModeEnabled((prev: boolean) => !prev)
  }

  const value = useMemo(
    () => ({
      isPrivacyModeEnabled,
      togglePrivacyMode,
    }),
    [isPrivacyModeEnabled],
  )

  return (
    <PrivacyModeContext.Provider value={value}>
      {children}
    </PrivacyModeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePrivacyMode() {
  const context = useContext(PrivacyModeContext)
  if (context === undefined) {
    throw new Error('usePrivacyMode must be used within a PrivacyModeProvider')
  }
  return context
}
