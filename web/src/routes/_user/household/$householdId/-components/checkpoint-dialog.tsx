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
import { useHousehold } from '@/hooks/use-household'
import { useCurrency } from '@/hooks/use-currency'
import { commitMutationResult } from '@/lib/relay'
import { ItemTitle } from '@/components/ui/item'

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
  mutation checkpointDialogMutation($input: CreateCheckpointInput!) {
    createCheckpoint(input: $input) {
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

const CATEGORY_COLORS: Record<(typeof CATEGORIES)[number], string> = {
  liquidity: 'var(--chart-liquidity)',
  investment: 'var(--chart-investment)',
  property: 'var(--chart-property)',
  receivable: 'var(--chart-receivable)',
  liability: 'var(--chart-liability)',
}

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
      { variables: { input: { note: note.trim() || null } } },
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
      <DialogContent className="gap-3">
        <DialogHeader>
          <DialogTitle>Checkpoint</DialogTitle>
        </DialogHeader>

        {/* Net worth hero */}
        <div className="bg-muted/50 rounded-lg px-3 py-2.5">
          <p className="text-muted-foreground mb-0.5 text-xs">Net Worth</p>
          <ItemTitle className="text-xl tabular-nums">
            {formatCurrencyWithPrivacyMode({
              value: netWorth,
              currencyCode: household.currency.code,
            })}
          </ItemTitle>
        </div>

        {/* Category breakdown */}
        <div className="flex flex-col gap-0">
          {CATEGORIES.map((type, i) => (
            <div
              key={type}
              className={`flex items-center justify-between py-1.5 ${i < CATEGORIES.length - 1 ? 'border-border/50 border-b' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[type] }}
                />
                <span className="text-muted-foreground">
                  {capitalize(type)}
                </span>
              </div>
              <span className="tabular-nums">
                {formatCurrencyWithPrivacyMode({
                  value: breakdown[type],
                  currencyCode: household.currency.code,
                  liability: type === 'liability',
                })}
              </span>
            </div>
          ))}
        </div>

        {/* Note */}
        <Textarea
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-16 resize-none"
        />

        <DialogFooter showCloseButton>
          <Button onClick={handleCheckpoint} disabled={isMutationInFlight}>
            {isMutationInFlight ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
