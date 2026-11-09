import { useLingui } from '@lingui/react/macro'
import { useState, type ComponentProps } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useComposer } from '@/components/transaction-composer/context'
import { TransactionAccountPicker } from './transaction-account-picker'
import { TransactionInvestmentPicker } from './transaction-investment-picker'

type Account = ComponentProps<
  typeof TransactionAccountPicker
>['accounts'][number] & {
  investments?:
    ComponentProps<typeof TransactionInvestmentPicker>['investments'] | null
}
export function InvestmentStart({
  accounts,
  accountId,
  investmentId,
  onAccount,
  onInvestment,
  kind,
  destination,
}: {
  accounts: readonly Account[]
  accountId: string
  investmentId: string
  onAccount: (id: string) => void
  onInvestment: (id: string) => void
  kind: string
  destination?: {
    accounts: readonly Account[]
    investmentId: string
    onInvestment: (id: string) => void
  }
}) {
  const { t } = useLingui()
  const composer = useComposer()
  const [step, setStep] = useState<
    'account' | 'investment' | 'to-account' | 'to-investment'
  >('account')
  const [destinationAccountId, setDestinationAccountId] = useState('')
  const choosingDestination = step.startsWith('to-') && !!destination
  const choices = choosingDestination ? destination.accounts : accounts
  const selectedAccountId = choosingDestination
    ? destinationAccountId
    : accountId
  const account = choices.find((a) => a.id === selectedAccountId)
  const showAccounts = step === 'account' || step === 'to-account' || !account
  return (
    <Stack gap={3}>
      <Text type="label">
        {showAccounts
          ? destination
            ? choosingDestination
              ? t`Choose the destination account`
              : t`Choose the source account`
            : t`Choose an account`
          : choosingDestination
            ? t`Choose the destination investment`
            : t`Choose an investment`}
      </Text>
      {choosingDestination && (
        <Button
          label={t`Change source`}
          variant="ghost"
          onClick={() => setStep('account')}
        />
      )}
      {showAccounts ? (
        <TransactionAccountPicker
          key={step}
          inline
          accounts={choices}
          name="start-account"
          label={t`Accounts`}
          value={selectedAccountId}
          onValueChange={(id) => {
            if (choosingDestination) {
              setDestinationAccountId(id)
              setStep('to-investment')
            } else {
              onAccount(id)
              setStep('investment')
            }
          }}
          onBlur={() => {}}
          invalid={false}
        />
      ) : (
        <>
          <Button
            label={t`Change account`}
            variant="ghost"
            onClick={() =>
              setStep(choosingDestination ? 'to-account' : 'account')
            }
          />
          <TransactionInvestmentPicker
            key={`${step}-${account.id}`}
            inline
            investments={account.investments ?? []}
            name="start-investment"
            label={t`Investments`}
            value={
              choosingDestination ? destination.investmentId : investmentId
            }
            onValueChange={(id) => {
              if (!id) return
              if (choosingDestination) {
                destination.onInvestment(id)
                composer?.chooseCategory(kind, 'investment')
              } else {
                onInvestment(id)
                if (destination) setStep('to-account')
                else composer?.chooseCategory(kind, 'investment')
              }
            }}
            onBlur={() => {}}
            invalid={false}
          />
        </>
      )}
    </Stack>
  )
}
