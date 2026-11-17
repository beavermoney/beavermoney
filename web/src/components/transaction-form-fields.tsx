import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Grid } from '@astryxdesign/core/Grid'
import type { ReactNode } from 'react'
import { TransactionOptions } from './transaction-options'

// Create and edit share the field order, spacing, and options presentation.
// Their controllers retain ownership of validation and persistence.
export function TransactionFormFields({
  children,
  note,
  date,
  owner,
  options,
}: {
  children: ReactNode
  note: ReactNode
  date: ReactNode
  owner?: ReactNode
  options: ReactNode
}) {
  return (
    <FormLayout>
      {children}
      {note}
      <Grid
        columns={{ minWidth: 240, max: 2, repeat: 'fit' }}
        gap={4}
        align="start"
        justify="stretch"
      >
        {owner}
        {date}
      </Grid>
      <TransactionOptions>{options}</TransactionOptions>
    </FormLayout>
  )
}
