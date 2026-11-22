import { createFileRoute } from '@tanstack/react-router'
import { MerchantDetail } from './-components/merchant-detail'
import { loadMerchantDetail } from './-components/merchant-detail-data'

export const Route = createFileRoute(
  '/_user/household/$householdId/merchants/$merchantId',
)({
  component: RouteComponent,
  loaderDeps: ({ search }) => ({ start: search.start, end: search.end }),
  loader: ({ params, deps }) =>
    loadMerchantDetail(
      params.householdId,
      params.merchantId,
      deps.start,
      deps.end,
    ),
})
function RouteComponent() {
  const params = Route.useParams()
  const search = Route.useSearch()
  return (
    <MerchantDetail {...params} {...search} queryRef={Route.useLoaderData()} />
  )
}
