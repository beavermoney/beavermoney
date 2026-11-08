import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextArea } from '@astryxdesign/core/TextArea'
import { useToast } from '@astryxdesign/core/Toast'
import currency from 'currency.js'
import { capitalize } from 'lodash-es'
import { FlagIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import type { snapshotDialogFragment$key } from './__generated__/snapshotDialogFragment.graphql'
import type { snapshotDialogMutation } from './__generated__/snapshotDialogMutation.graphql'

import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'

const SnapshotDialogFragment = graphql`
  fragment snapshotDialogFragment on Household
  @argumentDefinitions(viewUserIds: { type: "[ID!]" }) {
    accounts(where: { archived: false, userIDIn: $viewUserIds }) {
      edges {
        node {
          type
          value
          householdCurrency {
            code
          }
        }
      }
    }
  }
`

const SnapshotDialogMutation = graphql`
  mutation snapshotDialogMutation($input: CreateSnapshotInput!) {
    createSnapshot(input: $input) {
      node {
        id
        createTime
      }
    }
  }
`

const CATEGORIES = [
  'liquidity',
  'investment',
  // 'property',
  'receivable',
  'liability',
] as const

const CATEGORY_COLORS: Record<(typeof CATEGORIES)[number], string> = {
  liquidity: 'var(--chart-liquidity)',
  investment: 'var(--chart-investment)',
  // property: 'var(--chart-property)',
  receivable: 'var(--chart-receivable)',
  liability: 'var(--chart-liability)',
}

type SnapshotDialogProps = {
  fragmentRef: snapshotDialogFragment$key
  renderTrigger?: (open: () => void) => ReactNode
}

export function SnapshotDialog({
  fragmentRef,
  renderTrigger,
}: SnapshotDialogProps) {
  const showToast = useToast()

  const data = useFragment(SnapshotDialogFragment, fragmentRef)
  const { household } = useHousehold()
  const { displayCurrencyCode, convert } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')

  const [commitMutation, isMutationInFlight] =
    useMutation<snapshotDialogMutation>(SnapshotDialogMutation)

  const breakdown = CATEGORIES.reduce(
    (acc, type) => {
      const total = (data.accounts.edges ?? [])
        .filter((e) => e?.node?.type === type)
        .reduce((sum, e) => {
          invariant(e?.node, 'Account edge node is null')
          return sum.add(convert(e.node.value, e.node.householdCurrency.code))
        }, currency(0))
      acc[type] = total
      return acc
    },
    {} as Record<(typeof CATEGORIES)[number], currency>,
  )

  const netWorth = CATEGORIES.reduce(
    (sum, type) => sum.add(breakdown[type]),
    currency(0),
  )

  const handleSnapshot = async () => {
    const result = await commitMutationResult<snapshotDialogMutation>(
      commitMutation,
      {
        variables: { input: { note: note.trim() || null } },
        updater: (store) => {
          store.get(household.id)?.invalidateRecord()
        },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        showToast({ type: 'info', body: 'Snapshot saved!' })
        setNote('')
        setOpen(false)
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: `Failed to save snapshot: ${error}` })
      })
      .exhaustive()
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Button
          onClick={() => setOpen(true)}

          label={'Create snapshot'}
          isIconOnly
          variant={'ghost'}

          icon={<AstryxIcon icon={FlagIcon} />}
        ></Button>
      )}
      <Dialog isOpen={open} onOpenChange={setOpen} purpose="form">
        <DialogHeader title={<>Snapshot</>} onOpenChange={setOpen} />
        <Stack direction="vertical" gap={4}>
          <Text as="p" display="block" color="secondary">
            Net Worth
          </Text>
          <Stack direction="vertical" gap={4}>
            {formatCurrencyWithPrivacyMode({
              value: netWorth,
              currencyCode: displayCurrencyCode,
            })}
          </Stack>
        </Stack>
        <Stack direction="vertical" gap={0}>
          {CATEGORIES.map((type) => (
            <Stack
              direction="horizontal"
              gap={3}
              align="center"
              wrap="wrap"
              justify="between"
              key={type}
            >
              <Stack direction="horizontal" gap={2} align="center">
                <span style={{ backgroundColor: CATEGORY_COLORS[type] }} />
                <Text type="supporting">{capitalize(type)}</Text>
              </Stack>
              <Text hasTabularNumbers>
                {formatCurrencyWithPrivacyMode({
                  value: breakdown[type],
                  currencyCode: displayCurrencyCode,
                  liability: type === 'liability',
                })}
              </Text>
            </Stack>
          ))}
        </Stack>
        <TextArea
          placeholder="Add a note (optional)"
          label={'Add a note (optional)'}

          value={String(note ?? '')}
          onChange={(_value, event) => ((e) => setNote(e.target.value))(event)}
        />
        <Stack
          direction="horizontal"
          gap={3}
          align="center"
          wrap="wrap"
          justify="end"
        >
          <Button
            onClick={handleSnapshot}
            label={String(isMutationInFlight ? 'Saving...' : 'Save')}
            variant={'primary'}

            isDisabled={isMutationInFlight}
          >
            {isMutationInFlight ? 'Saving...' : 'Save'}
          </Button>
          <Button label="Cancel" onClick={() => setOpen(false)} />
        </Stack>
      </Dialog>
    </>
  )
}
