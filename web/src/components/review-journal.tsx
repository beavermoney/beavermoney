import { SnapshotDialog } from '@/routes/_user/household/$householdId/-components/snapshot-dialog'
import { ACCOUNT_TYPE_ACCENT_CLASSES } from '@/routes/_user/household/$householdId/accounts/-components/account-ledger-utils'
import { Divider } from '@astryxdesign/core/Divider'
import { Banner } from '@astryxdesign/core/Banner'
import { useState } from 'react'
import { useHistoryState } from '@/hooks/use-history-state'
import { useLingui } from '@lingui/react/macro'
import {
  graphql,
  useLazyLoadQuery,
  useMutation,
  useSubscribeToInvalidationState,
  fetchQuery,
} from 'react-relay'
import { Stack } from '@astryxdesign/core/Stack'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { useIsMobile } from '@/hooks/use-mobile'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { TextArea } from '@astryxdesign/core/TextArea'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { useFinanceLabel } from '@/hooks/use-finance-label'
import { environment } from '@/environment'
import { commitMutationResult } from '@/lib/relay'
import { parseReview, snapshotValue } from '@/lib/review-history'
import type { reviewJournalQuery } from './__generated__/reviewJournalQuery.graphql'
import type { reviewJournalNoteMutation } from './__generated__/reviewJournalNoteMutation.graphql'
import type { reviewJournalDeleteMutation } from './__generated__/reviewJournalDeleteMutation.graphql'
const query = graphql`
  query reviewJournalQuery($count: Int!) {
    household {
      ...snapshotDialogFragment
      snapshots(last: $count) {
        pageInfo {
          hasPreviousPage
        }
        edges {
          node {
            id
            createTime
            note
            review {
              version
              complete
              activeAccountIds
              accounts {
                accountId
                icon
                name
                type
                category
                ownerId
                ownerName
                currency
                cash
                value
                archived
                holdings {
                  investmentId
                  name
                  symbol
                  currency
                  quantity
                  price
                  value
                  average
                  confirmedAt
                  needsReview
                  archived
                }
              }
              rates {
                from
                to
                rate
              }
            }
            snapshotEntries {
              userID
              liquidity
              investment
              property
              receivable
              liability
              householdCurrency {
                code
              }
            }
            snapshotRates {
              rate
              fromCurrency {
                code
              }
              toCurrency {
                code
              }
            }
          }
        }
      }
    }
  }
`
const noteMutation = graphql`
  mutation reviewJournalNoteMutation($id: ID!, $input: UpdateSnapshotInput!) {
    updateSnapshot(id: $id, input: $input) {
      node {
        id
        note
      }
    }
  }
`
const deleteMutation = graphql`
  mutation reviewJournalDeleteMutation($id: ID!) {
    deleteSnapshot(id: $id) {
      deletedSnapshotId
    }
  }
`
export function ReviewJournal() {
  const { t } = useLingui()
  const isMobile = useIsMobile()
  const financeLabel = useFinanceLabel()
  const { household } = useHousehold()
  const { viewUserIds } = useHouseholdViewScope()
  const [count, setCount] = useHistoryState('journal:count', 100)
  const [refresh, setRefresh] = useState(0)
  const data = useLazyLoadQuery<reviewJournalQuery>(
    query,
    { count },
    { fetchKey: refresh, fetchPolicy: 'store-and-network' },
  )
  useSubscribeToInvalidationState([household.id], () => {
    fetchQuery<reviewJournalQuery>(
      environment,
      query,
      { count },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })
  const [selected, setSelected] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [saveNote, saving] =
    useMutation<reviewJournalNoteMutation>(noteMutation)
  const [remove, removing] =
    useMutation<reviewJournalDeleteMutation>(deleteMutation)
  const { displayCurrencyCode } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const rows = (data.household.snapshots.edges ?? [])
    .flatMap((e) => (e?.node ? [e.node] : []))
    .sort((a, b) => b.createTime.localeCompare(a.createTime))
  const current = rows.find((row) => row.id === selected)
  const parsed = parseReview(current?.review)
  const visibleAccounts = (parsed?.accounts ?? []).filter(
    (a) => viewUserIds === null || viewUserIds.includes(String(a.ownerId)),
  )
  const unconfirmedCount = visibleAccounts
    .flatMap((a) => a.holdings)
    .filter((h) => h.needsReview).length
  const netWorth = current
    ? snapshotValue(current, displayCurrencyCode, viewUserIds)
    : null
  async function updateNote() {
    if (!selected) return
    const result = await commitMutationResult<reviewJournalNoteMutation>(
      saveNote,
      { variables: { id: selected, input: { note } } },
    )
    setMessage(
      result.status === 'error' ? String(result.error) : t`Journal note saved`,
    )
  }
  async function deleteReview() {
    if (!selected) return
    const result = await commitMutationResult<reviewJournalDeleteMutation>(
      remove,
      {
        variables: { id: selected },
        updater: (store) => {
          store.get(household.id)?.invalidateRecord()
        },
      },
    )
    if (result.status === 'success') {
      setSelected(null)
      setDeleting(false)
      setRefresh((v) => v + 1)
    } else setMessage(String(result.error))
  }
  function open(row: (typeof rows)[number]) {
    setSelected(row.id)
    setNote(row.note ?? '')
    setMessage('')
    setDeleting(false)
  }
  return (
    <Stack direction="vertical" gap={6} className="w-full max-w-4xl">
      <Stack
        direction="horizontal"
        justify="between"
        align="center"
        gap={3}
        wrap="wrap"
      >
        <Heading level={1}>{t`Journal`}</Heading>
        <SnapshotDialog
          fragmentRef={data.household}
          previousSnapshot={rows[0]}
          renderTrigger={(open) => (
            <Button
              variant="primary"
              label={t`Review & snapshot`}
              onClick={open}
            />
          )}
        />
      </Stack>
      <Stack direction="vertical" gap={6}>
        <Text color="secondary">{t`A record of what you reviewed, and what was happening in your life.`}</Text>
        <Stack direction="vertical" gap={3}>
          {rows.map((row, index) => {
            const value = snapshotValue(row, displayCurrencyCode, viewUserIds)
            const previousRow = rows[index + 1]
            const previousValue = previousRow
              ? snapshotValue(previousRow, displayCurrencyCode, viewUserIds)
              : null
            const change =
              value !== null && previousValue !== null
                ? value.sub(previousValue)
                : null
            const changeAmount =
              change === null
                ? ''
                : formatCurrencyWithPrivacyMode({
                    value: change.toFixed(),
                    currencyCode: displayCurrencyCode,
                  })
            const attentionCount = (parseReview(row.review)?.accounts ?? [])
              .filter(
                (a) =>
                  viewUserIds === null ||
                  viewUserIds.includes(String(a.ownerId)),
              )
              .flatMap((a) => a.holdings)
              .filter((h) => h.needsReview).length
            return (
              <Stack
                as="article"
                key={row.id}
                direction="vertical"
                gap={4}
                paddingBlock={4}
              >
                <Stack
                  direction="horizontal"
                  justify="between"
                  align="start"
                  gap={3}
                  wrap="wrap"
                >
                  <Stack direction="vertical" gap={1}>
                    <Heading level={2}>
                      {new Date(row.createTime).toLocaleDateString(
                        household.locale,
                        { month: 'long', day: 'numeric', year: 'numeric' },
                      )}
                    </Heading>
                    <Text type="supporting">
                      {new Date(row.createTime).toLocaleTimeString(
                        household.locale,
                        { hour: 'numeric', minute: '2-digit' },
                      )}
                    </Text>
                  </Stack>
                  <Stack
                    direction="vertical"
                    gap={1}
                    align="end"
                    className="ml-auto text-right"
                  >
                    <Text type="supporting">{t`Net Worth`}</Text>
                    <Text type="large" hasTabularNumbers>
                      {value === null
                        ? row.review
                          ? t`Value unavailable`
                          : t`Legacy category review`
                        : formatCurrencyWithPrivacyMode({
                            value: value.toFixed(),
                            currencyCode: displayCurrencyCode,
                          })}
                    </Text>
                    {change !== null && (
                      <Text
                        type="supporting"
                        hasTabularNumbers
                      >{t`${changeAmount} since last snapshot`}</Text>
                    )}
                  </Stack>
                </Stack>
                <Text
                  as="p"
                  maxLines={4}
                  className="max-w-prose whitespace-pre-wrap"
                >
                  {row.note || t`A moment to check in. No note added.`}
                </Text>
                <Stack
                  direction="horizontal"
                  justify="between"
                  align="center"
                  gap={3}
                  wrap="wrap"
                >
                  {attentionCount > 0 && (
                    <Text type="supporting">{t`Unconfirmed averages: ${attentionCount}`}</Text>
                  )}
                  <Button
                    className="ml-auto shrink-0"
                    variant="ghost"
                    label={t`Read entry`}
                    onClick={() => open(row)}
                  />
                </Stack>
                {index < rows.length - 1 && <Divider />}
              </Stack>
            )
          })}
          {rows.length === 0 && (
            <Text>{t`Your first review starts this journal. Choose Review & snapshot to capture your net worth and write a note.`}</Text>
          )}
          {data.household.snapshots.pageInfo.hasPreviousPage && (
            <Button
              label={t`Load older reviews`}
              onClick={() => setCount((n) => n + 100)}
            />
          )}
        </Stack>
        <Dialog
          isOpen={!!current}
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
          variant={isMobile ? 'fullscreen' : 'standard'}
          width={640}
          maxHeight="90dvh"
          padding={0}
          purpose="form"
        >
          <Layout
            padding={6}
            header={
              <DialogHeader
                title={
                  current
                    ? new Date(current.createTime).toLocaleString(
                        household.locale,
                        { dateStyle: 'medium', timeStyle: 'short' },
                      )
                    : t`Review`
                }
                onOpenChange={() => setSelected(null)}
              />
            }
          >
            <LayoutContent>
              <Stack direction="vertical" gap={6} paddingBlockStart={4}>
                <Stack direction="vertical" gap={3}>
                  <TextArea
                    label={t`Your journal`}
                    rows={4}
                    value={note}
                    onChange={(value) => {
                      setNote(value)
                      setMessage('')
                    }}
                  />
                  {message && <Text role="status">{message}</Text>}
                  <Stack direction="horizontal">
                    <Button
                      label={t`Save note`}
                      onClick={updateNote}
                      isDisabled={saving || note === (current?.note ?? '')}
                    />
                  </Stack>
                </Stack>
                <Divider />
                <Text color="secondary">{t`Financial values are fixed. You can edit your journal note, but not the amounts.`}</Text>
                {current && (
                  <Stack direction="vertical" gap={4}>
                    <Stack
                      direction="horizontal"
                      justify="between"
                      align="center"
                      gap={4}
                    >
                      <Heading level={2}>{t`Net Worth`}</Heading>
                      <Text type="large" hasTabularNumbers justify="end">
                        {netWorth === null
                          ? t`Value unavailable`
                          : formatCurrencyWithPrivacyMode({
                              value: netWorth.toFixed(),
                              currencyCode: displayCurrencyCode,
                            })}
                      </Text>
                    </Stack>
                    <Divider />
                    <Stack direction="vertical" gap={4}>
                      {(
                        [
                          'liquidity',
                          'investment',
                          'property',
                          'receivable',
                          'liability',
                        ] as const
                      ).map((type) => {
                        const value = snapshotValue(
                          current,
                          displayCurrencyCode,
                          viewUserIds,
                          type,
                        )
                        return (
                          <Stack
                            key={type}
                            direction="horizontal"
                            justify="between"
                            align="center"
                            gap={4}
                          >
                            <Stack
                              direction="horizontal"
                              align="center"
                              gap={3}
                            >
                              <Stack
                                aria-hidden="true"
                                className={`h-2 w-2 shrink-0 rounded-full ${ACCOUNT_TYPE_ACCENT_CLASSES[type]}`}
                              />
                              <Text>{financeLabel(type)}</Text>
                            </Stack>
                            <Text hasTabularNumbers justify="end">
                              {value === null
                                ? t`Value unavailable`
                                : formatCurrencyWithPrivacyMode({
                                    value: value.toFixed(),
                                    currencyCode: displayCurrencyCode,
                                    liability: type === 'liability',
                                  })}
                            </Text>
                          </Stack>
                        )
                      })}
                    </Stack>
                    {unconfirmedCount > 0 && (
                      <Banner
                        status="warning"
                        title={t`Unconfirmed averages: ${unconfirmedCount}`}
                        description={t`Unrealized return was unavailable when this snapshot was saved.`}
                      />
                    )}
                    <Text type="supporting">{t`Amounts use the exchange rates saved with this review.`}</Text>
                  </Stack>
                )}
                <Stack direction="horizontal" gap={3} wrap="wrap">
                  <Button
                    label={t`Delete review`}
                    onClick={() => setDeleting(true)}
                  />
                </Stack>
                {deleting && (
                  <Stack direction="vertical" gap={3}>
                    <Text>{t`Delete this review permanently? Its journal entry will be removed. Other reviews and transactions are not affected.`}</Text>
                    <Stack direction="horizontal" gap={3}>
                      <Button
                        label={t`Delete permanently`}
                        onClick={deleteReview}
                        isDisabled={removing}
                      />
                      <Button
                        label={t`Keep review`}
                        onClick={() => setDeleting(false)}
                      />
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </LayoutContent>
          </Layout>
        </Dialog>
      </Stack>
    </Stack>
  )
}
