export const NodeType = {
  Transaction: 'Transaction',
  Account: 'Account',
  Investment: 'Investment',
  RecurringSubscription: 'RecurringSubscription',
  TransactionCategory: 'TransactionCategory',
} as const

export type NodeType = (typeof NodeType)[keyof typeof NodeType]
