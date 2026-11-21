import { Suspense } from 'react'
import { converted, snapshotDelta, type ReviewRow } from '@/lib/review-history'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { ACCOUNT_TYPE_ACCENT_CLASSES } from '@/routes/_user/household/$householdId/accounts/-components/account-ledger-utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { AverageCostEditor } from '@/components/average-cost-editor'
import { useLingui } from '@lingui/react/macro'
import { useFinanceLabel } from '@/hooks/use-finance-label'
import { Trans } from '@lingui/react/macro'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import { Button } from '@astryxdesign/core/Button'
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer'
import { BottomSheet } from '@astryxdesign/core/BottomSheet'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { TextArea } from '@astryxdesign/core/TextArea'
import { useToast } from '@astryxdesign/core/Toast'
import Decimal from 'decimal.js'
import { FlagIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import { match } from 'ts-pattern'
import type { snapshotDialogFragment$key } from './__generated__/snapshotDialogFragment.graphql'
import type { snapshotDialogMutation } from './__generated__/snapshotDialogMutation.graphql'

import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'

const SnapshotDialogFragment = graphql`
  fragment snapshotDialogFragment on Household {
    householdRates {
      rate
      fromCurrency {
        code
      }
      toCurrency {
        code
      }
    }
    reviewAccounts: accounts(where: { archived: false }) {
      edges {
        node {
          id
          name
          reviewRevision
          investments {
            id
            name
            averageNeedsReview
          }
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
  mutation snapshotDialogMutation(
    $input: CreateSnapshotInput!
    $expectedRevisions: [ReviewAccountVersion!]
  ) {
    createSnapshot(input: $input, expectedRevisions: $expectedRevisions) {
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
  'property',
  'receivable',
  'liability',
] as const

type SnapshotDialogProps = {
  fragmentRef: snapshotDialogFragment$key
  previousSnapshot?: ReviewRow
  renderTrigger?: (open: () => void) => ReactNode
}

export function SnapshotDialog({
  fragmentRef,
  previousSnapshot,
  renderTrigger,
}: SnapshotDialogProps) {
  const { t } = useLingui()
  const financeLabel = useFinanceLabel()
  const showToast = useToast()

  const data = useFragment(SnapshotDialogFragment, fragmentRef)
  const { household } = useHousehold()
  const { displayCurrencyCode } = useDisplayCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const ReviewSurface = isMobile ? BottomSheet : Drawer
  const accounts = (data.reviewAccounts.edges ?? []).flatMap((e) =>
    e?.node ? [e.node] : [],
  )
  const attention = accounts.flatMap((a) =>
    (a.investments ?? [])
      .filter((i) => i.averageNeedsReview)
      .map((i) => ({ ...i, accountName: a.name })),
  )

  const [commitMutation, isMutationInFlight] =
    useMutation<snapshotDialogMutation>(SnapshotDialogMutation)

  const rates = (data.householdRates ?? []).map((r) => ({
    from: r.fromCurrency.code,
    to: r.toCurrency.code,
    rate: r.rate,
  }))
  const breakdown = Object.fromEntries(
    CATEGORIES.map((type) => {
      const values = accounts
        .filter((a) => a.type === type)
        .map((a) =>
          converted(
            a.value,
            a.householdCurrency.code,
            displayCurrencyCode,
            rates,
          ),
        )
      return [
        type,
        values.some((v) => v === null)
          ? null
          : values.reduce<Decimal>((sum, v) => sum.add(v!), new Decimal(0)),
      ]
    }),
  ) as Record<(typeof CATEGORIES)[number], Decimal | null>
  const netWorth = CATEGORIES.some((type) => breakdown[type] === null)
    ? null
    : CATEGORIES.reduce(
        (sum, type) => sum.add(breakdown[type]!),
        new Decimal(0),
      )
  function deltaLabel(
    value: Decimal | null,
    type?: (typeof CATEGORIES)[number],
  ) {
    const delta = snapshotDelta(
      value?.toFixed() ?? null,
      previousSnapshot,
      displayCurrencyCode,
      type,
    )
    if (delta === null) return '—'
    const formatted = formatCurrencyWithPrivacyMode({
      value: delta.toFixed(),
      currencyCode: displayCurrencyCode,
    })
    return !isPrivacyModeEnabled && delta.gt(0) ? `+${formatted}` : formatted
  }

  const handleSnapshot = async () => {
    const result = await commitMutationResult<snapshotDialogMutation>(
      commitMutation,
      {
        variables: {
          input: { note: note.trim() || null },
          expectedRevisions: accounts.map((a) => ({
            id: a.id,
            revision: a.reviewRevision,
          })),
        },
        updater: (store) => {
          store.get(household.id)?.invalidateRecord()
        },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        showToast({ type: 'info', body: t`Snapshot saved!` })
        setNote('')
        setEditing(null)
        setOpen(false)
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: t`Failed to save snapshot: ${error}` })
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

          label={t`Create snapshot`}
          isIconOnly
          variant={'ghost'}

          icon={<AstryxIcon icon={FlagIcon} />}
        ></Button>
      )}
      <ReviewSurface
        isOpen={open}
        onOpenChange={setOpen}
        label={t`Review your net worth`}
        purpose="form"
        padding={0}
        {...(isMobile ? { height: 'tall' as const } : { width: 560 })}
      >
        <Layout
          height="fill"
          padding={6}
          footer={
            <LayoutFooter>
              <Stack direction="horizontal" gap={3} justify="end">
                <Button label={t`Cancel`} onClick={() => setOpen(false)} />
                <Button
                  onClick={handleSnapshot}
                  label={t`Save snapshot`}
                  variant="primary"
                  isLoading={isMutationInFlight}
                  isDisabled={accounts.length === 0}
                />
              </Stack>
            </LayoutFooter>
          }
          header={
            <DrawerHeader
              title={
                <>
                  <Trans>Review your net worth</Trans>
                </>
              }
              onOpenChange={setOpen}
            />
          }
        >
          <LayoutContent>
            <Stack direction="vertical" gap={6} paddingBlockStart={4}>
              <Stack direction="vertical" gap={5}>
                <Stack
                  direction="horizontal"
                  justify="between"
                  align="start"
                  gap={4}
                >
                  <Stack direction="vertical" gap={1}>
                    <Heading level={2}>{t`Net Worth`}</Heading>
                    <Text type="supporting">
                      {previousSnapshot
                        ? t`Change since last snapshot`
                        : t`Your first snapshot`}
                    </Text>
                  </Stack>
                  <Stack
                    direction="vertical"
                    gap={1}
                    align="end"
                    className="text-right"
                  >
                    <Text type="large" hasTabularNumbers>
                      {netWorth === null
                        ? '—'
                        : formatCurrencyWithPrivacyMode({
                            value: netWorth.toFixed(),
                            currencyCode: displayCurrencyCode,
                          })}
                    </Text>
                    {previousSnapshot && (
                      <Text type="supporting" hasTabularNumbers>
                        {deltaLabel(netWorth)}
                      </Text>
                    )}
                  </Stack>
                </Stack>
                <Stack direction="vertical" gap={4}>
                  {CATEGORIES.map((type) => (
                    <Stack
                      direction="horizontal"
                      gap={4}
                      align="center"
                      justify="between"
                      key={type}
                    >
                      <Stack direction="horizontal" gap={3} align="center">
                        <Stack
                          aria-hidden="true"
                          className={`h-2 w-2 shrink-0 rounded-full ${ACCOUNT_TYPE_ACCENT_CLASSES[type]}`}
                        />
                        <Text>{financeLabel(type)}</Text>
                      </Stack>
                      <Stack
                        direction="vertical"
                        gap={0.5}
                        align="end"
                        className="text-right"
                      >
                        <Text hasTabularNumbers>
                          {breakdown[type] === null
                            ? '—'
                            : formatCurrencyWithPrivacyMode({
                                value: breakdown[type].toFixed(),
                                currencyCode: displayCurrencyCode,
                                liability: type === 'liability',
                              })}
                        </Text>
                        {previousSnapshot && (
                          <Text type="supporting" hasTabularNumbers>
                            {deltaLabel(breakdown[type], type)}
                          </Text>
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
              <Stack direction="vertical" gap={3}>
                <Heading level={3}>
                  <Trans>Needs attention</Trans>
                </Heading>
                {attention.length === 0 ? (
                  <Text color="secondary">
                    <Trans>
                      Average costs are up to date for all holdings.
                    </Trans>
                  </Text>
                ) : (
                  <Text color="secondary">
                    <Trans>
                      These average costs need review. You can still save; their
                      gains will be marked unavailable.
                    </Trans>
                  </Text>
                )}
                {attention.map((inv) => (
                  <Stack key={inv.id} direction="vertical" gap={3}>
                    <Stack
                      direction="horizontal"
                      justify="between"
                      align="center"
                      gap={3}
                    >
                      <Stack direction="vertical" gap={1}>
                        <Text type="label">{inv.name}</Text>
                        <Text color="secondary">
                          {inv.accountName} ·{' '}
                          <Trans>Average cost needs review</Trans>
                        </Text>
                      </Stack>
                      <Button
                        className="shrink-0"
                        label={
                          editing === inv.id ? t`Close` : t`Update average`
                        }
                        onClick={() =>
                          setEditing(editing === inv.id ? null : inv.id)
                        }
                      />
                    </Stack>
                    {editing === inv.id && (
                      <Suspense
                        fallback={
                          <Text>
                            <Trans>Loading holding…</Trans>
                          </Text>
                        }
                      >
                        <AverageCostEditor
                          investmentId={inv.id}
                          onSaved={() => setEditing(null)}
                        />
                      </Suspense>
                    )}
                  </Stack>
                ))}
              </Stack>
              <TextArea
                placeholder={t`What happened today? Money decisions, milestones, or anything you want to remember.`}
                label={t`Your journal (optional)`}
                rows={4}

                value={String(note ?? '')}
                onChange={(_value, event) =>
                  ((e) => setNote(e.target.value))(event)
                }
              />
            </Stack>
          </LayoutContent>
        </Layout>
      </ReviewSurface>
    </>
  )
}
