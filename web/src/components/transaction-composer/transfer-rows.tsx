import { useLingui } from '@lingui/react/macro'
import { Grid } from '@astryxdesign/core/Grid'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import type { ReactNode } from 'react'

export function ComposerTransferRows({
  fromAccount,
  fromAmount,
  toAccount,
  toAmount,
}: {
  fromAccount: ReactNode
  fromAmount: ReactNode
  toAccount: ReactNode
  toAmount?: ReactNode
}) {
  const { t } = useLingui()
  return (
    <Stack gap={3}>
      <TransferRow label={t`From`} account={fromAccount} amount={fromAmount} />
      <TransferRow label={t`To`} account={toAccount} amount={toAmount} />
    </Stack>
  )
}

function TransferRow({
  label,
  account,
  amount,
}: {
  label: string
  account: ReactNode
  amount?: ReactNode
}) {
  return (
    <Stack gap={1} role="group" aria-label={label}>
      <Text type="supporting">{label}</Text>
      <Grid columns={amount ? 2 : 1} gap={2} className="composer-transfer-row">
        <Stack className="composer-transfer-account">{account}</Stack>
        {amount && <Stack className="composer-transfer-value">{amount}</Stack>}
      </Grid>
    </Stack>
  )
}
