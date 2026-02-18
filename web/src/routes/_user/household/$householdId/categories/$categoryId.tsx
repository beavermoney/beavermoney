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

export const Route = createFileRoute(
  '/_user/household/$householdId/categories/$categoryId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    // Use a very wide date range to get all-time data
    const farPast = new Date('1900-01-01T00:00:00Z').toISOString()
    const farFuture = new Date('2100-01-01T00:00:00Z').toISOString()

    return loadQuery<CategoryIdQuery>(
      environment,
      CategoryIdQuery,
      {
        id: params.categoryId,
        startDate: farPast,
        endDate: farFuture,
      },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const CategoryIdQuery = graphql`
  query CategoryIdQuery($id: ID!, $startDate: Time!, $endDate: Time!) {
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
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<CategoryIdQuery>(CategoryIdQuery, queryRef)

  useSubscribeToInvalidationState([ROOT_ID], () => {
    const farPast = new Date('1900-01-01T00:00:00Z').toISOString()
    const farFuture = new Date('2100-01-01T00:00:00Z').toISOString()

    return loadQuery<CategoryIdQuery>(
      environment,
      CategoryIdQuery,
      {
        id: params.categoryId,
        startDate: farPast,
        endDate: farFuture,
      },
      { fetchPolicy: 'network-only' },
    )
  })

  if (!data.node) {
    return <div>Category not found</div>
  }

  return (
    <div className="flex h-full flex-col">
      <Item className="p-0">
        <CategoryCard
          categoryRef={data.node}
          financialReportRef={data.financialReport}
        />
        <EditCategory key={data.node.id} fragmentRef={data.node} />
      </Item>
    </div>
  )
}
