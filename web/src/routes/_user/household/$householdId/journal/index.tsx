import { loadRouteQuery } from '@/lib/relay/load-route-query'
import { environment } from '@/environment'
import { readHistoryState } from '@/hooks/use-history-state'
import { getHistoryViewKey } from '@/lib/history-view-key'
import reviewJournalQueryNode from '@/components/__generated__/reviewJournalQuery.graphql'
import type { reviewJournalQuery } from '@/components/__generated__/reviewJournalQuery.graphql'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { createFileRoute } from '@tanstack/react-router'
import { ReviewJournal } from '@/components/review-journal'
import { GenericError } from '@/components/generic-error'
import { handleHouseholdError } from '@/lib/auth'

export const Route = createFileRoute('/_user/household/$householdId/journal/')({
  component: JournalPage,
  loader: ({ location }) =>
    loadRouteQuery<reviewJournalQuery>(
      environment,
      reviewJournalQueryNode,
      {
        count: readHistoryState(
          getHistoryViewKey(location),
          'journal:count',
          100,
        ),
      },
      { fetchPolicy: 'store-or-network' },
    ),
  errorComponent: GenericError,
  onError: handleHouseholdError,
})

function JournalPage() {
  return (
    <HouseholdContentLayout>
      <ReviewJournal />
    </HouseholdContentLayout>
  )
}
