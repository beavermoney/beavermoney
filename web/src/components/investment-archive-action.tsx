import { useLingui } from '@lingui/react/macro'
import { Button } from '@astryxdesign/core/Button'
import { useToast } from '@astryxdesign/core/Toast'
import { graphql, useFragment, useMutation } from 'react-relay'
import Decimal from 'decimal.js'
import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'
import type { investmentArchiveActionFragment$key } from './__generated__/investmentArchiveActionFragment.graphql'
import type { investmentArchiveActionArchiveMutation } from './__generated__/investmentArchiveActionArchiveMutation.graphql'
import type { investmentArchiveActionRestoreMutation } from './__generated__/investmentArchiveActionRestoreMutation.graphql'

const fragment = graphql`
  fragment investmentArchiveActionFragment on Investment {
    id
    archived
    amount
    account {
      archived
    }
  }
`
const archive = graphql`
  mutation investmentArchiveActionArchiveMutation($id: ID!) {
    archiveInvestment(id: $id) {
      id
      archived
    }
  }
`
const restore = graphql`
  mutation investmentArchiveActionRestoreMutation($id: ID!) {
    unarchiveInvestment(id: $id) {
      id
      archived
    }
  }
`

export function InvestmentArchiveAction({
  fragmentRef,
}: {
  fragmentRef: investmentArchiveActionFragment$key
}) {
  const { t } = useLingui()
  const showToast = useToast()
  const { household } = useHousehold()
  const data = useFragment(fragment, fragmentRef)
  const [commitArchive, archiving] =
    useMutation<investmentArchiveActionArchiveMutation>(archive)
  const [commitRestore, restoring] =
    useMutation<investmentArchiveActionRestoreMutation>(restore)
  if (!new Decimal(data.amount).isZero()) return null
  async function toggle() {
    const options = {
      variables: { id: data.id },
      updater: (store: import('relay-runtime').RecordSourceSelectorProxy) =>
        store.get(household.id)?.invalidateRecord(),
    }
    const result = data.archived
      ? await commitMutationResult<investmentArchiveActionRestoreMutation>(
          commitRestore,
          options,
        )
      : await commitMutationResult<investmentArchiveActionArchiveMutation>(
          commitArchive,
          options,
        )
    showToast(
      result.status === 'error'
        ? { type: 'error', body: result.error.toString() }
        : {
            type: 'info',
            body: data.archived
              ? t`Investment restored.`
              : t`Investment archived. Its history is preserved.`,
          },
    )
  }
  return (
    <Button
      label={data.archived ? t`Restore investment` : t`Archive investment`}
      variant="secondary"
      isLoading={archiving || restoring}
      isDisabled={data.account.archived}
      onClick={toggle}
    />
  )
}
