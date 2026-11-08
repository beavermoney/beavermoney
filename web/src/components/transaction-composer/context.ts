import { createContext, useContext, type ReactNode } from 'react'

export type ComposerContextValue = {
  activeAmount: string
  setActiveAmount: (name: string) => void
  editor: string | null
  setEditor: (name: string | null) => void
  target: HTMLElement | null
  keypadTarget: HTMLElement | null
  dateField: ReactNode
  chooseCategory: (name: string, type: string, icon?: string | null) => void
  compactCategories: boolean
  compactAmounts?: boolean
}

export const ComposerContext = createContext<ComposerContextValue | null>(null)
export const useComposer = () => useContext(ComposerContext)
