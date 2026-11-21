import { useRef, useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { useMutation, graphql } from 'react-relay'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { useToast } from '@astryxdesign/core/Toast'
import {
  MerchantPicker,
  type MerchantSelection,
} from '@/components/merchant-picker'
import { FormError } from '@/components/form-error'
import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'
import type { mergeMerchantMutation } from './__generated__/mergeMerchantMutation.graphql'

const mutation = graphql`
  mutation mergeMerchantMutation($sourceID: ID!, $targetID: ID!) {
    mergeMerchant(sourceID: $sourceID, targetID: $targetID) {
      deletedMerchantID
      reassignedCount
      targetMerchant {
        id
        name
        icon
      }
    }
  }
`
export function MergeMerchant({
  merchant,
  transactionCount,
  onClose,
  onMerged,
}: {
  merchant: { id: string; name: string }
  transactionCount: number
  onClose: () => void
  onMerged: (id: string) => Promise<void>
}) {
  const { t, i18n } = useLingui()
  const { household } = useHousehold()
  const toast = useToast()
  const saving = useRef(false)
  const [target, setTarget] = useState<MerchantSelection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [commit, pending] = useMutation<mergeMerchantMutation>(mutation)
  const merge = async () => {
    if (!target?.id || target.id === merchant.id || pending || saving.current)
      return
    setError(null)
    saving.current = true
    const result = await commitMutationResult<mergeMerchantMutation>(commit, {
      variables: { sourceID: merchant.id, targetID: target.id },
      updater: (store) => {
        store.get(household.id)?.invalidateRecord()
      },
    })
    saving.current = false
    if (result.status === 'error') {
      setError(t`Could not merge these merchants. Please try again.`)
      return
    }
    const count = i18n.number(result.data.mergeMerchant.reassignedCount)
    toast({ body: t`Merged ${count} transactions`, type: 'info' })
    onClose()
    await onMerged(result.data.mergeMerchant.targetMerchant.id)
  }
  const count = i18n.number(transactionCount)
  return (
    <Dialog
      isOpen
      purpose="form"
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <Layout
        header={<DialogHeader title={t`Merge merchant`} />}
        content={
          <LayoutContent>
            <Stack gap={4}>
              <Text>{t`Move all ${count} transactions from ${merchant.name} to another merchant, including dates and members outside the current view.`}</Text>
              <MerchantPicker
                label={t`Merge into`}
                value={target}
                onChange={setTarget}
                allowCreate={false}
                excludedIds={[merchant.id]}
                disabled={pending}
              />
              {target?.id && (
                <Text color="secondary">{t`${target.name} will keep its name and logo. ${merchant.name} will be removed. This cannot be undone.`}</Text>
              )}
              {error && <FormError>{error}</FormError>}
            </Stack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <Stack direction="horizontal" gap={2} justify="end">
              <Button
                label={t`Cancel`}
                variant="secondary"
                onClick={onClose}
                isDisabled={pending}
              />
              <Button
                label={t`Merge merchants`}
                onClick={() => void merge()}
                isLoading={pending}
                isDisabled={pending || !target?.id || target.id === merchant.id}
              />
            </Stack>
          </LayoutFooter>
        }
      />
    </Dialog>
  )
}
