import { useRef, useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { useMutation, graphql } from 'react-relay'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import { Stack } from '@astryxdesign/core/Stack'
import { Button } from '@astryxdesign/core/Button'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { FormError } from '@/components/form-error'
import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'
import type { merchantEditorCreateMutation } from './__generated__/merchantEditorCreateMutation.graphql'
import type { merchantEditorUpdateMutation } from './__generated__/merchantEditorUpdateMutation.graphql'

const create = graphql`
  mutation merchantEditorCreateMutation($name: String!, $icon: String) {
    createMerchant(name: $name, icon: $icon) {
      id
      name
      icon
    }
  }
`
const update = graphql`
  mutation merchantEditorUpdateMutation(
    $id: ID!
    $name: String!
    $icon: String
    $clearIcon: Boolean!
  ) {
    updateMerchant(id: $id, name: $name, icon: $icon, clearIcon: $clearIcon) {
      id
      name
      icon
    }
  }
`
export function MerchantEditor({
  merchant,
  onClose,
}: {
  merchant?: { id: string; name: string; icon?: string | null }
  onClose: () => void
}) {
  const { t } = useLingui()
  const { household } = useHousehold()
  const toast = useToast()
  const saving = useRef(false)
  const [name, setName] = useState(merchant?.name ?? '')
  const [icon, setIcon] = useState(merchant?.icon ?? '')
  const [error, setError] = useState<string | null>(null)
  const [commitCreate, creating] =
    useMutation<merchantEditorCreateMutation>(create)
  const [commitUpdate, updating] =
    useMutation<merchantEditorUpdateMutation>(update)
  const pending = creating || updating
  const save = async () => {
    if (pending || saving.current) return
    const cleaned = name.trim()
    if (!cleaned || Array.from(cleaned).length > 120) {
      setError(t`Enter a merchant name between 1 and 120 characters.`)
      return
    }
    setError(null)
    const updater = (
      store: import('relay-runtime').RecordSourceSelectorProxy,
    ) => {
      store.get(household.id)?.invalidateRecord()
    }
    saving.current = true
    const result = merchant
      ? await commitMutationResult<merchantEditorUpdateMutation>(commitUpdate, {
          variables: {
            id: merchant.id,
            name: cleaned,
            icon: icon.trim() || null,
            clearIcon: !icon.trim(),
          },
          updater,
        })
      : await commitMutationResult<merchantEditorCreateMutation>(commitCreate, {
          variables: { name: cleaned, icon: icon.trim() || null },
          updater,
        })
    saving.current = false
    if (result.status === 'error') {
      setError(
        t`Could not save this merchant. Check the name and website domain, then try again.`,
      )
      return
    }
    toast({
      body: merchant ? t`Merchant updated` : t`Merchant added`,
      type: 'info',
    })
    onClose()
  }
  return (
    <Dialog
      isOpen
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
      purpose="form"
    >
      <Layout
        header={
          <DialogHeader title={merchant ? t`Edit merchant` : t`Add merchant`} />
        }
        content={
          <LayoutContent>
            <Stack gap={4}>
              <TextInput
                label={t`Merchant name`}
                value={name}
                onChange={setName}
                hasAutoFocus
                isRequired
                isDisabled={pending}
                onEnter={() => void save()}
              />
              <TextInput
                label={t`Website domain`}
                placeholder="example.com"
                value={icon}
                onChange={setIcon}
                isOptional
                hasClear
                autoComplete="off"
                autoCapitalize="off"
                hasAutoCorrect={false}
                isDisabled={pending}
                onEnter={() => void save()}
              />
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
                label={t`Save`}
                onClick={() => void save()}
                isLoading={pending}
                isDisabled={pending || !name.trim()}
              />
            </Stack>
          </LayoutFooter>
        }
      />
    </Dialog>
  )
}
