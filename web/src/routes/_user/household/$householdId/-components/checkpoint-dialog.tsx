import { graphql } from 'relay-runtime'
import { useFragment, useMutation } from 'react-relay'
import { useState } from 'react'
import currency from 'currency.js'
import { match } from 'ts-pattern'
import { toast } from 'sonner'
import { capitalize } from 'lodash-es'
import { FlagIcon } from 'lucide-react'
import type { checkpointDialogFragment$key } from './__generated__/checkpointDialogFragment.graphql'
import type { checkpointDialogMutation } from './__generated__/checkpointDialogMutation.graphql'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useHousehold } from '@/hooks/use-household'
import { useCurrency } from '@/hooks/use-currency'
import { commitMutationResult } from '@/lib/relay'

const CheckpointDialogFragment = graphql`
  fragment checkpointDialogFragment on Query {
    accounts {
      edges {
        node {
          type
          archived
          valueInHouseholdCurrency
        }
      }
    }
  }
`

const CheckpointDialogMutation = graphql`
  mutation checkpointDialogMutation($note: String) {
    createCheckpoint(note: $note) {
      node {
        id
        netWorth
        liquidity
        investment
        property
        receivable
        liability
        createTime
      }
    }
  }
`

const CATEGORIES = [
  'liquidity',
  'investment',
  'property',
  'receivable',
  'liability',
] as const

type CheckpointDialogProps = {
  fragmentRef: checkpointDialogFragment$key
}

export function CheckpointDialog({ fragmentRef }: CheckpointDialogProps) {
  const data = useFragment(CheckpointDialogFragment, fragmentRef)
  const { household } = useHousehold()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')

  const [commitMutation, isMutationInFlight] =
    useMutation<checkpointDialogMutation>(CheckpointDialogMutation)

  // Compute breakdown from live account values (exclude archived)
  const breakdown = CATEGORIES.reduce(
    (acc, type) => {
      const total = (data.accounts.edges ?? [])
        .filter((e) => e?.node?.type === type && !e.node.archived)
        .reduce(
          (sum, e) => sum.add(currency(e!.node!.valueInHouseholdCurrency)),
          currency(0),
        )
      acc[type] = total
      return acc
    },
    {} as Record<(typeof CATEGORIES)[number], currency>,
  )

  const netWorth = CATEGORIES.reduce(
    (sum, type) => sum.add(breakdown[type]),
    currency(0),
  )

  const handleCheckpoint = async () => {
    const result = await commitMutationResult<checkpointDialogMutation>(
      commitMutation,
      { variables: { note: note.trim() || null } },
    )

    match(result)
      .with({ status: 'success' }, () => {
        toast.success('Checkpoint saved!')
        setNote('')
        setOpen(false)
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(`Failed to save checkpoint: ${error}`)
      })
      .exhaustive()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="cursor-pointer">
            <FlagIcon />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Checkpoint</DialogTitle>
        </DialogHeader>

        {/* Net worth summary */}
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Net Worth</span>
          <span className="font-mono text-sm font-semibold tabular-nums">
            {formatCurrencyWithPrivacyMode({
              value: netWorth,
              currencyCode: household.currency.code,
            })}
          </span>
        </div>

        <Separator />

        {/* Category breakdown */}
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((type) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-muted-foreground">{capitalize(type)}</span>
              <span className="font-mono tabular-nums">
                {formatCurrencyWithPrivacyMode({
                  value: breakdown[type],
                  currencyCode: household.currency.code,
                  liability: type === 'liability',
                })}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Note */}
        <Textarea
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-20 resize-none"
        />

        <DialogFooter showCloseButton>
          <Button onClick={handleCheckpoint} disabled={isMutationInFlight}>
            {isMutationInFlight ? 'Saving...' : 'Save checkpoint'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
