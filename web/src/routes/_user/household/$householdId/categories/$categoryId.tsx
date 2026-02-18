import { createFileRoute } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql, ROOT_ID } from 'relay-runtime'
import type { CategoryIdQuery } from './__generated__/CategoryIdQuery.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { EditCategory } from './-components/edit-category'
import { CategoryCard } from './-components/category-card'
import { Item } from '@/components/ui/item'
import { parseDateRangeFromURL } from '@/lib/date-range'
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
    financialReport(period: { startDate: $startDate, endDate: $endDate }) {
      ...categoryCardFinancialReportFragment
    }
    ...transactionsListFragment @arguments(where: $where)
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const search = Route.useSearch()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<CategoryIdQuery>(CategoryIdQuery, queryRef)

  useSubscribeToInvalidationState([ROOT_ID], () => {
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
      { fetchPolicy: 'network-only' },
    )
  })

  if (!data.node) {
    return <div>Category not found</div>
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Item className="p-0">
        <CategoryCard
          categoryRef={data.node}
          financialReportRef={data.financialReport}
        />
        <EditCategory key={data.node.id} fragmentRef={data.node} />
      </Item>
      <TransactionsList fragmentRef={data} />
    </div>
  )
}
