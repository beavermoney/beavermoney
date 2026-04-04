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

export const SESSION_STORAGE_PRIVACY_DIALOG_KEY = 'privacyDialogShown'

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

export const ACCOUNT_CATEGORY_LIST = [
  'tfsa',
  'rrsp',
  'rrif',
  'resp',
  'fhsa',
  'lira',
  'rdsp',
  'ira_traditional',
  'ira_roth',
  'plan_401k',
  'roth_401k',
  'plan_403b',
  'plan_457b',
  'sep_ira',
  'simple_ira',
  'hsa',
  'plan_529',
] as const

export const ACCOUNT_CATEGORY_LABEL: Record<string, string> = {
  tfsa: 'TFSA',
  rrsp: 'RRSP',
  rrif: 'RRIF',
  resp: 'RESP',
  fhsa: 'FHSA',
  lira: 'LIRA',
  rdsp: 'RDSP',
  ira_traditional: 'Traditional IRA',
  ira_roth: 'Roth IRA',
  plan_401k: '401(k)',
  roth_401k: 'Roth 401(k)',
  plan_403b: '403(b)',
  plan_457b: '457(b)',
  sep_ira: 'SEP IRA',
  simple_ira: 'SIMPLE IRA',
  hsa: 'HSA',
  plan_529: '529 Plan',
}

export const ACCOUNT_CATEGORY_OPTIONS = ACCOUNT_CATEGORY_LIST.map((value) => ({
  value,
  label: ACCOUNT_CATEGORY_LABEL[value] ?? value,
}))

export const ACCOUNT_CATEGORY_APPLICABLE_TYPES = new Set([
  'liquidity',
  'investment',
])

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
