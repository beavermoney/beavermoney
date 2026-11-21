import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { ReviewJournal } from '@/components/review-journal'
import { GenericError } from '@/components/generic-error'
import { handleHouseholdError } from '@/lib/auth'

export const Route = createFileRoute('/_user/household/$householdId/journal/')({
  component: JournalPage,
  errorComponent: GenericError,
  onError: handleHouseholdError,
})

function JournalPage() {
  return (
    <HouseholdContentLayout>
      <Suspense fallback={<Skeleton height={200} />}>
        <ReviewJournal />
      </Suspense>
    </HouseholdContentLayout>
  )
}
