import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { Button } from '@astryxdesign/core/Button'
import { Stack } from '@astryxdesign/core/Stack'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { fetchQuery, graphql } from 'relay-runtime'
import { CategoryCard } from './-components/category-card'
import { EditCategory } from './-components/edit-category'
import type { CategoryIdQuery } from './__generated__/CategoryIdQuery.graphql'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { identity } from 'lodash-es'
import invariant from 'tiny-invariant'
import type { TransactionWhereInput } from '../transactions/-components/__generated__/transactionsListRefetch.graphql'
import { TransactionsList } from '../transactions/-components/transactions-list'

export const Route = createFileRoute(
  '/_user/household/$householdId/categories/$categoryId',
)({
  component: RouteComponent,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps: search }) => {
    const period = parseDateRangeFromURL(search.start, search.end)
    return loadQuery<CategoryIdQuery>(
      environment,
      CategoryIdQuery,
      {
        id: params.categoryId,
        startDate: period.startDate,
        endDate: period.endDate,
        where: {
          hasCategoryWith: [{ id: params.categoryId }],
          datetimeGTE: period.startDate,
          datetimeLT: period.endDate,
        },
      },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const CategoryIdQuery = graphql`
  query CategoryIdQuery(
    $id: ID!
    $startDate: Time!
    $endDate: Time!
    $where: TransactionWhereInput
  ) {
    node(id: $id) {
      ... on TransactionCategory {
        id
        ...categoryCardCategoryFragment
        ...editCategoryFragment
      }
    }
    household {
      financialReport(period: { startDate: $startDate, endDate: $endDate }) {
        ...categoryCardFinancialReportFragment
      }
      ...transactionsListFragment @arguments(where: $where)
    }
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const search = Route.useSearch()
  const queryRef = Route.useLoaderData()
  const period = parseDateRangeFromURL(search.start, search.end)

  const where: TransactionWhereInput = {
    hasCategoryWith: [{ id: params.categoryId }],
    datetimeGTE: period.startDate,
    datetimeLT: period.endDate,
  }

  const data = usePreloadedQuery<CategoryIdQuery>(CategoryIdQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    const period = parseDateRangeFromURL(search.start, search.end)
    fetchQuery(
      environment,
      CategoryIdQuery,
      {
        id: params.categoryId,
        startDate: period.startDate,
        endDate: period.endDate,
        where,
      },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  invariant(data.node, 'Category not found')

  const navigate = useNavigate()

  return (
    <HouseholdContentLayout>
      <Stack direction="vertical" gap={4}>
        <Stack direction="vertical" gap={4}>
          <Button
            onClick={() => navigate({ to: '..', search: identity })}
            label={'Back'}
            width="fit-content"
            variant={'secondary'}
          >
            Back
          </Button>
        </Stack>
        <Stack direction="vertical" gap={4} className="max-w-2xl">
          <CategoryCard
            categoryRef={data.node}
            financialReportRef={data.household.financialReport}
          />
          <EditCategory key={data.node.id} fragmentRef={data.node} />
        </Stack>
        <TransactionsList fragmentRef={data.household} />
      </Stack>
    </HouseholdContentLayout>
  )
}
