import { lazy, Suspense, useCallback } from 'react'
import { useLingui } from '@lingui/react/macro'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { preserveHistoryViewKey } from '@/lib/history-view-key'
import { PageProgress } from './page-progress'
const CommandMenuDialog = lazy(() => import('./command-menu-dialog'))

export function CommandMenu() {
  const { t } = useLingui()
  const navigate = useNavigate()
  const { householdId } = useParams({ from: '/_user/household/$householdId' })
  const { command_open: isOpen } = useSearch({
    from: '/_user/household/$householdId',
  })
  const { viewUserIds } = useHouseholdViewScope()
  const setOpen = useCallback(
    (open: boolean) => {
      return navigate({
        to: '.',
        search: (old) => ({ ...old, command_open: open }),
        replace: true,
        state: preserveHistoryViewKey,
        resetScroll: false,
      })
    },
    [navigate],
  )
  useHotkey('Meta+K', () => setOpen(!isOpen), { ignoreInputs: false })
  useHotkey('Control+K', () => setOpen(!isOpen), { ignoreInputs: false })
  return isOpen ? (
    <Suspense fallback={<PageProgress label={t`Loading content`} />}>
      <CommandMenuDialog
        key={`${householdId}:${viewUserIds?.join(',') ?? 'all'}`}
        householdId={householdId}
        viewUserIds={viewUserIds}
        setOpen={setOpen}
      />
    </Suspense>
  ) : null
}
