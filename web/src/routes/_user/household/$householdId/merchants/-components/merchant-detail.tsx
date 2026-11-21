import { useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { useNavigate } from '@tanstack/react-router'
import {
  fetchQuery,
  graphql,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
  type PreloadedQuery,
} from 'react-relay'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack, StackItem } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Icon } from '@astryxdesign/core/Icon'
import { ArrowLeft, Pencil, Merge, CircleHelp } from 'lucide-react'
import { environment } from '@/environment'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { MerchantAvatar } from '@/components/merchant-avatar'
import { useBackNavigation } from '@/hooks/use-back-navigation'
import { TransactionsList } from '../../transactions/-components/transactions-list'
import { MerchantStatistics } from './merchant-statistics'
import { MerchantEditor } from './merchant-editor'
import { MergeMerchant } from './merge-merchant'
import { merchantDetailVariables } from './merchant-detail-data'
import type { merchantDetailQuery } from './__generated__/merchantDetailQuery.graphql'

const query = graphql`
  query merchantDetailQuery(
    $id: ID!
    $assigned: Boolean!
    $startDate: Time!
    $endDate: Time!
    $viewUserIds: [ID!]
    $where: TransactionWhereInput!
  ) {
    node(id: $id) @include(if: $assigned) {
      ... on Merchant {
        id
        name
        icon
        transactions {
          totalCount
        }
        insights(
          period: { startDate: $startDate, endDate: $endDate }
          viewUserIDs: $viewUserIds
        ) {
          currencyCode
          period {
            total
            transactionCount
            average
          }
          lifetime {
            total
            transactionCount
            average
          }
        }
      }
    }
    household {
      merchantInsights(
        period: { startDate: $startDate, endDate: $endDate }
        viewUserIDs: $viewUserIds
      ) @skip(if: $assigned) {
        currencyCode
        unassigned {
          total
          transactionCount
          average
        }
      }
      ...transactionsListFragment @arguments(where: $where)
    }
  }
`
export function MerchantDetail({
  householdId,
  merchantId,
  start,
  end,
  queryRef,
}: {
  householdId: string
  merchantId: string | null
  start: string
  end: string
  queryRef: PreloadedQuery<merchantDetailQuery>
}) {
  const { t } = useLingui()
  const data = usePreloadedQuery(query, queryRef)
  const goBack = useBackNavigation()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [merging, setMerging] = useState(false)
  const node = data.node
  const merchant =
    node?.id && node.name && node.insights && node.transactions
      ? {
          id: node.id,
          name: node.name,
          icon: node.icon,
          insights: node.insights,
          transactions: node.transactions,
        }
      : null
  const summary =
    merchant?.insights.period ?? data.household.merchantInsights?.unassigned
  const currencyCode =
    merchant?.insights.currencyCode ??
    data.household.merchantInsights?.currencyCode
  useSubscribeToInvalidationState([householdId], () => {
    fetchQuery(
      environment,
      query,
      merchantDetailVariables(householdId, merchantId, start, end),
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })
  const onDateRangeChange = async (nextStart: string, nextEnd: string) => {
    await fetchQuery<merchantDetailQuery>(
      environment,
      query,
      merchantDetailVariables(householdId, merchantId, nextStart, nextEnd),
      { fetchPolicy: 'network-only' },
    ).toPromise()
    await navigate({
      to: '.',
      search: (previous) => ({ ...previous, start: nextStart, end: nextEnd }),
      resetScroll: false,
    })
  }
  return (
    <HouseholdContentLayout>
      <Stack gap={8}>
        <Stack gap={6}>
          <Button
            label={t`Back`}
            variant="secondary"
            width="fit-content"
            icon={<Icon icon={ArrowLeft} />}
            onClick={() =>
              goBack({
                to: '/household/$householdId/merchants',
                params: { householdId },
                search: (previous) => previous,
              })
            }
          />
          <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
            {merchant ? (
              <MerchantAvatar merchant={merchant} size="large" />
            ) : (
              <Icon icon={CircleHelp} />
            )}
            <StackItem size="fill">
              <Heading level={1}>
                {merchant?.name ??
                  (merchantId ? t`Merchant not found` : t`Unassigned`)}
              </Heading>
            </StackItem>
            {merchant && (
              <Stack direction="horizontal" gap={2} wrap="wrap">
                <Button
                  label={t`Edit merchant`}
                  variant="secondary"
                  icon={<Icon icon={Pencil} />}
                  onClick={() => setEditing(true)}
                />
                <Button
                  label={t`Merge`}
                  variant="secondary"
                  icon={<Icon icon={Merge} />}
                  onClick={() => setMerging(true)}
                />
              </Stack>
            )}
          </Stack>
          {!merchantId && (
            <Text color="secondary">{t`Expenses without a merchant. Open a transaction to assign one.`}</Text>
          )}
          {summary && currencyCode && (
            <>
              <DatePeriodFilter
                startDate={start}
                endDate={end}
                onDateRangeChange={onDateRangeChange}
              />
              <MerchantStatistics
                summary={summary}
                currencyCode={currencyCode}
                lifetime={merchant?.insights.lifetime}
              />
            </>
          )}
        </Stack>
        {summary && (
          <Stack gap={4}>
            <Heading level={2}>{t`Transactions`}</Heading>
            <TransactionsList fragmentRef={data.household} />
          </Stack>
        )}
      </Stack>
      {editing && merchant && (
        <MerchantEditor
          key={merchant.id}
          merchant={merchant}
          onClose={() => setEditing(false)}
        />
      )}
      {merging && merchant && (
        <MergeMerchant
          merchant={merchant}
          transactionCount={merchant.transactions.totalCount}
          onClose={() => setMerging(false)}
          onMerged={async (id) => {
            await navigate({
              to: '/household/$householdId/merchants/$merchantId',
              params: { householdId, merchantId: id },
              search: (previous) => previous,
              replace: true,
            })
          }}
        />
      )}
    </HouseholdContentLayout>
  )
}
