import { createFileRoute } from '@tanstack/react-router'
import { usePreloadedQuery } from 'react-relay'
import { HouseholdMobileOnly } from '@/components/layouts/household-mobile-only'
import { PendingComponent } from '@/components/pending-component'
import { categoriesQuery } from './-categories-query'
import { CategoriesQuery } from './__generated__/CategoriesQuery.graphql'
import { CategoriesPanel } from './-components/categories-panel'

export const Route = createFileRoute(
  '/_user/household/$householdId/categories/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<CategoriesQuery>(categoriesQuery, queryRef)

  return (
    <HouseholdMobileOnly className="flex h-full">
      <div className="flex-1">
        <CategoriesPanel fragmentRef={data.household} />
      </div>
    </HouseholdMobileOnly>
  )
}
