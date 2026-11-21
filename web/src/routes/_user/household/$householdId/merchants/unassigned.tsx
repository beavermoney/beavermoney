import { createFileRoute } from '@tanstack/react-router'
import { PendingComponent } from '@/components/pending-component'
import { MerchantDetail } from './-components/merchant-detail'
import { loadMerchantDetail } from './-components/merchant-detail-data'

export const Route = createFileRoute(
  '/_user/household/$householdId/merchants/unassigned',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loaderDeps: ({ search }) => ({ start: search.start, end: search.end }),
  loader: ({ params, deps }) =>
    loadMerchantDetail(params.householdId, null, deps.start, deps.end),
})
function RouteComponent() {
  const params = Route.useParams()
  const search = Route.useSearch()
  return (
    <MerchantDetail
      {...params}
      {...search}
      merchantId={null}
      queryRef={Route.useLoaderData()}
    />
  )
}
