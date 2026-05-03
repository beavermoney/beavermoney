import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { fetchQuery, graphql } from 'relay-runtime'
import type { CategoryIdQuery } from './__generated__/CategoryIdQuery.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { EditCategory } from './-components/edit-category'
import { CategoryCard } from './-components/category-card'
import { Item } from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { TransactionsList } from '../transactions/-components/transactions-list'
import invariant from 'tiny-invariant'
import type { TransactionWhereInput } from '../transactions/-components/__generated__/transactionsListRefetch.graphql'
import { identity } from 'lodash-es'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/categories/$categoryId',
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
      <div className="flex h-full flex-col gap-4">
        <div>
          <Button
            variant="secondary"
            onClick={() => navigate({ to: '..', search: identity })}
          >
            Back
          </Button>
        </div>
        <Item className="p-0">
          <CategoryCard
            categoryRef={data.node}
            financialReportRef={data.household.financialReport}
          />
          <EditCategory key={data.node.id} fragmentRef={data.node} />
        </Item>
        <TransactionsList fragmentRef={data.household} />
      </div>
    </HouseholdContentLayout>
  )
}
