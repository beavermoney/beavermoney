import { useNavigate, useParams } from '@tanstack/react-router'

export function useHouseholdViewScope() {
  const params = useParams({
    from: '/_user/household/$householdId/{-$viewUserId}',
  })
  const navigate = useNavigate()

  const viewUserId = params.viewUserId ?? null

  const setViewUserId = (next: string | null) => {
    void navigate({
      to: '.',
      params: (prev) => ({
        ...prev,
        viewUserId: next ?? undefined,
      }),
      replace: true,
    })
  }

  return {
    viewUserId,
    isCombined: viewUserId === null,
    setViewUserId,
  }
}
