import { LinkOptions } from '@tanstack/react-router'
import type { HotkeySequence } from '@tanstack/react-hotkeys'
import {
  AppWindowMacIcon,
  CreditCardIcon,
  LucideIcon,
  ReceiptIcon,
  TagIcon,
  TrendingUpIcon,
} from 'lucide-react'

export const LOCAL_STORAGE_HOUSEHOLD_ID_KEY = 'householdId'
export const LOCAL_STORAGE_TOKEN_KEY = 'token'
export const LOCAL_STORAGE_PRIVACY_MODE_KEY = 'privacyMode'
export const LOCAL_STORAGE_THEME_KEY = 'theme'
export const LOCAL_STORAGE_RND_POSITION_KEY = 'rndPosition'

export const ACCOUNT_TYPE_LIST = [
  'liquidity',
  'investment',
  // 'property',
  'receivable',
  'liability',
] as const

export const INVESTMENT_TYPE_LIST = ['stock', 'crypto'] as const

export const CATEGORY_TYPE_LIST = [
  'expense',
  'income',
  'transfer',
  'investment',
  'setup',
] as const

export const ACCOUNT_TYPE_DESCRIPTION: Record<string, string> = {
  liquidity: 'Cash or cash-equivalent accounts, such as checking or savings',
  investment: 'Accounts that hold investments, such as brokerage accounts',
  property: 'Real estate or other valuable property',
  receivable: 'Money owed to you, such as pending reimbursements or money lent',
  liability:
    'Debts or obligations you owe to others, such as credit cards or loans',
}

export const NAV: Array<{
  name: string
  link: LinkOptions
  icon: LucideIcon
  shortcut: HotkeySequence
}> = [
  {
    name: 'Transactions',
    link: {
      to: '/household/$householdId/transactions',
      activeOptions: {
        exact: false,
        includeSearch: false,
      },
      search: (prev) => ({
        ...prev,
      }),
    },
    icon: ReceiptIcon,
    shortcut: ['G', 'T'],
  },
  {
    name: 'Accounts',
    link: {
      to: '/household/$householdId/accounts',
      activeOptions: {
        exact: false,
        includeSearch: false,
      },
      search: (prev) => ({
        ...prev,
      }),
    },
    icon: CreditCardIcon,
    shortcut: ['G', 'A'],
  },
  {
    name: 'Investments',
    link: {
      to: '/household/$householdId/investments',
      activeOptions: {
        exact: false,
        includeSearch: false,
      },
      search: (prev) => ({
        ...prev,
      }),
    },
    icon: TrendingUpIcon,
    shortcut: ['G', 'I'],
  },
  {
    name: 'Categories',
    link: {
      to: '/household/$householdId/categories',
      activeOptions: {
        exact: false,
        includeSearch: false,
      },
      search: (prev) => ({
        ...prev,
      }),
    },
    icon: TagIcon,
    shortcut: ['G', 'C'],
  },
  {
    name: 'Subscriptions',
    link: {
      to: '/household/$householdId/subscriptions',
      activeOptions: {
        exact: false,
        includeSearch: false,
      },
      search: (prev) => ({
        ...prev,
      }),
    },
    icon: AppWindowMacIcon,
    shortcut: ['G', 'S'],
  },
]
