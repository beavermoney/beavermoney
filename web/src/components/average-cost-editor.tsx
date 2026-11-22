import { Suspense, useState } from 'react'
import {
  AverageCostEditorLayout,
  AverageCostEditorSkeleton,
} from './average-cost-editor-layout'
import { useLingui } from '@lingui/react/macro'
import { Button } from '@astryxdesign/core/Button'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay'
import { useHousehold } from '@/hooks/use-household'
import { useCurrency } from '@/hooks/use-currency'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { commitMutationResult } from '@/lib/relay'
import type { averageCostEditorMutation } from './__generated__/averageCostEditorMutation.graphql'
import type { averageCostEditorQuery } from './__generated__/averageCostEditorQuery.graphql'
const query = graphql`
  query averageCostEditorQuery($id: ID!) {
    node(id: $id) {
      __typename
      ... on Investment {
        id
        name
        amount
        holdingsChangedAt
        confirmedAverageCost
        averageCostConfirmedAt
        averageNeedsReview
        account {
          name
        }
        householdCurrency {
          code
        }
      }
    }
  }
`
const mutation = graphql`
  mutation averageCostEditorMutation(
    $id: ID!
    $average: String!
    $expectedAmount: String!
    $expectedChangedAt: Time
  ) {
    confirmInvestmentAverage(
      id: $id
      average: $average
      expectedAmount: $expectedAmount
      expectedChangedAt: $expectedChangedAt
    ) {
      id
      confirmedAverageCost
      averageCostConfirmedAt
      averageNeedsReview
      costBasis
      averageCost
      unrealizedReturn
      unrealizedReturnPercent
    }
  }
`
function AverageCostEditorContent({
  investmentId,
  onSaved,
}: {
  investmentId: string
  onSaved?: () => void
}) {
  const { t } = useLingui()
  const { household } = useHousehold()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const [refresh, setRefresh] = useState(0)
  const data = useLazyLoadQuery<averageCostEditorQuery>(
    query,
    { id: investmentId },
    { fetchPolicy: 'network-only', fetchKey: refresh },
  )
  const inv = data.node?.__typename === 'Investment' ? data.node : null
  const [expected, setExpected] = useState(() => ({
    amount: inv?.amount ?? '',
    changed: inv?.holdingsChangedAt ?? null,
  }))
  const changed =
    !!inv &&
    (expected.amount !== inv.amount ||
      expected.changed !== (inv.holdingsChangedAt ?? null))
  const [value, setValue] = useState('')
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)
  const [commit, pending] = useMutation<averageCostEditorMutation>(mutation)
  async function save() {
    if (!inv) return
    const result = await commitMutationResult<averageCostEditorMutation>(
      commit,
      {
        variables: {
          id: investmentId,
          average: value.trim(),
          expectedAmount: expected.amount,
          expectedChangedAt: expected.changed,
        },
        updater: (store) => {
          store.get(household.id)?.invalidateRecord()
        },
      },
    )
    if (result.status === 'success') {
      setSaved(true)
      onSaved?.()
    } else {
      setMessage(String(result.error))
      setRefresh((v) => v + 1)
    }
  }
  if (!inv)
    return (
      <AverageCostEditorLayout
        summary={<Text>{t`Holding unavailable`}</Text>}
      />
    )
  if (Number(inv.amount) === 0)
    return (
      <AverageCostEditorLayout
        summary={
          <Text>
            {inv.name} · {t`Position closed. No average cost to review.`}
          </Text>
        }
      />
    )
  return (
    <AverageCostEditorLayout
      summary={
        <>
          <Stack direction="vertical" gap={1}>
            <Text type="label">
              {inv.name} · {inv.account.name}
            </Text>
            <Text color="secondary">
              {t`Current shares`}: {isPrivacyModeEnabled ? '•••' : inv.amount}
            </Text>
          </Stack>
          <Text type="supporting">{inv.householdCurrency.code}</Text>
          {inv.averageNeedsReview && (
            <Text
              role="status"
              type="label"
            >{t`Average cost needs review`}</Text>
          )}
          {inv.confirmedAverageCost != null && (
            <Text color="secondary">
              {t`Last confirmed average`}:{' '}
              {formatCurrencyWithPrivacyMode({
                value: inv.confirmedAverageCost,
                currencyCode: inv.householdCurrency.code,
              })}
              {inv.averageCostConfirmedAt
                ? ` · ${new Date(inv.averageCostConfirmedAt).toLocaleDateString()}`
                : ''}
            </Text>
          )}
        </>
      }
      controls={
        saved && !changed ? (
          <Stack
            direction="horizontal"
            align="center"
            justify="between"
            gap={3}
            wrap="wrap"
          >
            <Text role="status">{t`Average cost confirmed`}</Text>
            <Button
              variant="ghost"
              label={t`Update average`}
              onClick={() => {
                setSaved(false)
                setMessage('')
              }}
            />
          </Stack>
        ) : (
          <>
            <TextInput
              label={t`Average cost per share`}
              value={value}
              onChange={setValue}
              inputMode="decimal"
            />
            <Button
              className="self-start"
              variant="primary"
              label={t`Confirm average cost`}
              onClick={save}
              isDisabled={
                pending ||
                changed ||
                !/^\d{1,18}(\.\d{1,18})?$/.test(value.trim())
              }
            />
          </>
        )
      }
      feedback={
        <>
          {changed && (
            <>
              <Text role="status">{t`This holding changed while you were reviewing it.`}</Text>
              <Button
                label={t`Review latest holding`}
                onClick={() => {
                  setExpected({
                    amount: inv.amount,
                    changed: inv.holdingsChangedAt ?? null,
                  })
                  setValue('')
                  setMessage('')
                  setSaved(false)
                }}
              />
            </>
          )}
          {message && <Text role="alert">{message}</Text>}
        </>
      }
    />
  )
}

export function AverageCostEditor(props: {
  investmentId: string
  onSaved?: () => void
}) {
  return (
    <Suspense fallback={<AverageCostEditorSkeleton />}>
      <AverageCostEditorContent key={props.investmentId} {...props} />
    </Suspense>
  )
}
