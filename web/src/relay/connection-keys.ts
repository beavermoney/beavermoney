import { NodeType } from './node-types'

export const ConnectionKeys: Record<NodeType, string[]> = {
  [NodeType.Transaction]: ['transactionsList_transactions'],
  [NodeType.Account]: ['accountsPanel_accounts'],
  [NodeType.Investment]: ['investmentsPanel_investments'],
  [NodeType.RecurringSubscription]: [
    'subscriptionsPanel_recurringSubscriptions',
  ],
  [NodeType.TransactionCategory]: ['categoriesPanel_transactionCategories'],
}
