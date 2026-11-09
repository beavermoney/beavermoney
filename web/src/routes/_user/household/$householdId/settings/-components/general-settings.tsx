import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { LanguageSelector } from '@/components/language-selector'
import { useTheme } from '@/components/theme-provider'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl'
import { useWeekStart, type WeekStart } from '@/hooks/use-week-start'
import { Selector } from '@astryxdesign/core/Selector'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { FormError } from '@/components/form-error'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Divider } from '@astryxdesign/core/Divider'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'

import type { generalSettingsCurrenciesFragment$key } from './__generated__/generalSettingsCurrenciesFragment.graphql'
import type { generalSettingsDeleteHouseholdMutation } from './__generated__/generalSettingsDeleteHouseholdMutation.graphql'
import type { generalSettingsHouseholdFragment$key } from './__generated__/generalSettingsHouseholdFragment.graphql'
import type { generalSettingsUpdateHouseholdMutation } from './__generated__/generalSettingsUpdateHouseholdMutation.graphql'

import { useUser } from '@/hooks/use-user'

import { commitMutationResult } from '@/lib/relay'
import { useNavigate } from '@tanstack/react-router'

const generalSettingsHouseholdFragment = graphql`
  fragment generalSettingsHouseholdFragment on Household {
    id
    name
    locale
  }
`

const generalSettingsCurrenciesFragment = graphql`
  fragment generalSettingsCurrenciesFragment on Query {
    userHouseholds {
      role
      user {
        id
      }
    }
  }
`

const updateHouseholdMutation = graphql`
  mutation generalSettingsUpdateHouseholdMutation(
    $id: ID!
    $input: UpdateHouseholdInput!
  ) {
    updateHousehold(id: $id, input: $input) {
      id
      name
      locale
    }
  }
`

const deleteHouseholdMutation = graphql`
  mutation generalSettingsDeleteHouseholdMutation($id: ID!) {
    deleteHousehold(id: $id) {
      deletedHouseholdId
    }
  }
`

type GeneralSettingsProps = {
  householdRef: generalSettingsHouseholdFragment$key
  currenciesRef: generalSettingsCurrenciesFragment$key
}

export function GeneralSettings({
  householdRef,
  currenciesRef,
}: GeneralSettingsProps) {
  const { t } = useLingui()
  const formSchema = z.object({
    name: z
      .string()
      .min(1, t`Household name is required.`)
      .max(64, t`Household name must be at most 64 characters.`),
    locale: z.string().min(1, t`Locale is required.`),
  })

  const { weekStartsOn, setWeekStartsOn } = useWeekStart()
  const { theme, setTheme } = useTheme()
  const showToast = useToast()

  const household = useFragment(generalSettingsHouseholdFragment, householdRef)
  const { userHouseholds } = useFragment(
    generalSettingsCurrenciesFragment,
    currenciesRef,
  )
  const navigate = useNavigate()

  const { user } = useUser()
  const isAdmin =
    userHouseholds.find((uh) => uh.user.id === user.id)?.role === 'admin'

  const [commitUpdate, isUpdateInFlight] =
    useMutation<generalSettingsUpdateHouseholdMutation>(updateHouseholdMutation)

  const [commitDelete, isDeleteInFlight] =
    useMutation<generalSettingsDeleteHouseholdMutation>(deleteHouseholdMutation)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const form = useForm({
    defaultValues: {
      name: household.name,
      locale: household.locale,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const result =
        await commitMutationResult<generalSettingsUpdateHouseholdMutation>(
          commitUpdate,
          {
            variables: {
              id: household.id,
              input: {
                name: formData.name,
                locale: formData.locale,
              },
            },
          },
        )

      match(result)
        .with({ status: 'success' }, ({ data: resultData }) => {
          invariant(
            resultData.updateHousehold,
            'No data returned from mutation',
          )
          showToast({ type: 'info', body: t`Household updated.` })
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  const handleDelete = async () => {
    const result =
      await commitMutationResult<generalSettingsDeleteHouseholdMutation>(
        commitDelete,
        {
          variables: {
            id: household.id,
          },
        },
      )

    match(result)
      .with({ status: 'success' }, () => {
        showToast({ type: 'info', body: t`Household deleted.` })
        setDeleteDialogOpen(false)
        navigate({
          to: '/household',
          reloadDocument: true,
        })
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: error.toString() })
      })
      .exhaustive()
  }

  return (
    <Stack direction="vertical" gap={5} className="max-w-2xl" width="100%">
      <Stack
        as="form"
        direction="vertical"
        gap={6}
        id="general-settings-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FormLayout>
          <form.Field
            name="name"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                  <TextInput
                    data-1p-ignore
                    id={field.name}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    placeholder={t`My Household`}
                    autoComplete="off"
                    label={t`Name`}

                    value={String(field.state.value ?? '')}
                    onChange={(_value, event) =>
                      ((e) => field.handleChange(e.target.value))(event)
                    }
                    htmlName={field.name}
                  />
                  {isInvalid && <FormError errors={field.state.meta.errors} />}
                </Stack>
              )
            }}
          />
          <form.Field
            name="locale"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                  <TextInput
                    data-1p-ignore
                    id={field.name}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    placeholder="en-CA"
                    autoComplete="off"
                    label={t`Locale`}

                    value={String(field.state.value ?? '')}
                    onChange={(_value, event) =>
                      ((e) => field.handleChange(e.target.value))(event)
                    }
                    htmlName={field.name}
                  />
                  {isInvalid && <FormError errors={field.state.meta.errors} />}
                </Stack>
              )
            }}
          />
        </FormLayout>
        <Stack direction="horizontal" gap={2} justify="end" wrap="wrap">
          <Button
            type="submit"
            form="general-settings-form"
            label={String(isUpdateInFlight ? t`Saving...` : t`Save`)}
            variant={'primary'}

            isDisabled={isUpdateInFlight}
          >
            {isUpdateInFlight ? t`Saving...` : t`Save`}
          </Button>
        </Stack>
      </Stack>

      <Divider />
      <LanguageSelector />
      <Stack direction="vertical" gap={2}>
        <Text type="label">
          <Trans>Appearance</Trans>
        </Text>
        <SegmentedControl
          label={t`Appearance`}
          value={theme}
          layout="fill"
          onChange={(value) => {
            if (value === 'light' || value === 'dark' || value === 'system')
              setTheme(value)
          }}
        >
          <SegmentedControlItem value="light" label={t`Light`} />
          <SegmentedControlItem value="dark" label={t`Dark`} />
          <SegmentedControlItem value="system" label={t`System`} />
        </SegmentedControl>
        <Text type="supporting">
          <Trans>
            System follows your device’s appearance. Changes save automatically
            on this device.
          </Trans>
        </Text>
      </Stack>
      <Stack direction="vertical" gap={2}>
        <Selector
          label={t`First day of week`}
          presentation="adaptive"
          value={String(weekStartsOn)}
          onChange={(value) => {
            if (value !== null) setWeekStartsOn(Number(value) as WeekStart)
          }}
          options={[
            t`Sunday`,
            t`Monday`,
            t`Tuesday`,
            t`Wednesday`,
            t`Thursday`,
            t`Friday`,
            t`Saturday`,
          ].map((label, value) => ({ label, value: String(value) }))}
        />
        <Text color="secondary">
          <Trans>Saved automatically on this device.</Trans>
        </Text>
      </Stack>
      {isAdmin && (
        <>
          <Divider />
          <Stack
            direction="horizontal"
            gap={4}
            align="center"
            justify="between"
            wrap="wrap"
          >
            <Stack direction="vertical" gap={1}>
              <Text as="p" display="block">
                <Trans>Delete household</Trans>
              </Text>
              <Text as="p" display="block" color="secondary">
                <Trans>
                  Permanently remove this household and all its data.
                </Trans>
              </Text>
            </Stack>
            <>
              <Button
                onClick={() =>
                  ((open) => {
                    setDeleteDialogOpen(open)
                    if (!open) setDeleteConfirmText('')
                  })(true)
                }
                label={t`Delete`}
                variant={'destructive'}
              >
                <Trans>Delete</Trans>
              </Button>
              <Dialog
                isOpen={deleteDialogOpen}
                onOpenChange={(open) => {
                  setDeleteDialogOpen(open)
                  if (!open) setDeleteConfirmText('')
                }}
                purpose="info"
                role="alertdialog"
                padding={0}
              >
                <Layout
                  padding={6}
                  header={
                    <DialogHeader
                      title={
                        <>
                          <Trans>Delete household?</Trans>
                        </>
                      }
                      onOpenChange={(open) => {
                        setDeleteDialogOpen(open)
                        if (!open) setDeleteConfirmText('')
                      }}
                    />
                  }
                >
                  <LayoutContent>
                    <Stack direction="vertical" gap={6} paddingBlockStart={4}>
                      <Stack direction="vertical" gap={4}>
                        <Trans>
                          This will permanently delete{' '}
                          <Text type="label">{household.name}</Text> and all
                          associated data including accounts, transactions, and
                          categories. This action cannot be undone.
                        </Trans>
                        <br />
                        <Trans>
                          Type <Text type="label">{household.name}</Text> to
                          confirm
                        </Trans>
                        <TextInput
                          data-1p-ignore
                          id="delete-confirm"
                          placeholder={t`Enter household name to confirm`}
                          autoComplete="off"
                          label={t`Enter household name to confirm`}

                          value={String(deleteConfirmText ?? '')}
                          onChange={(_value, event) =>
                            ((e) => setDeleteConfirmText(e.target.value))(event)
                          }
                        />
                      </Stack>
                      <Stack
                        direction="horizontal"
                        gap={3}
                        align="center"
                        wrap="wrap"
                        justify="end"
                      >
                        <Button
                          label={t`Cancel`}
                          onClick={() =>
                            ((open) => {
                              setDeleteDialogOpen(open)
                              if (!open) setDeleteConfirmText('')
                            })(false)
                          }
                        />
                        <Button
                          variant="destructive"
                          isDisabled={
                            deleteConfirmText !== household.name ||
                            isDeleteInFlight
                          }
                          onClick={handleDelete}
                          label={t`Delete`}
                        >
                          {isDeleteInFlight ? t`Deleting...` : t`Delete`}
                        </Button>
                      </Stack>
                    </Stack>
                  </LayoutContent>
                </Layout>
              </Dialog>
            </>
          </Stack>
        </>
      )}
    </Stack>
  )
}
