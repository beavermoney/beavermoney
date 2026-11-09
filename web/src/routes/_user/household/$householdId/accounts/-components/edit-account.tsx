import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { FormError } from '@/components/form-error'
import { getLogoDomainURL } from '@/lib/logo'
import { Avatar } from '@astryxdesign/core/Avatar'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm } from '@tanstack/react-form'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'

import type { editAccountFragment$key } from './__generated__/editAccountFragment.graphql'
import type {
  AccountCategory,
  editAccountMutation,
} from './__generated__/editAccountMutation.graphql'

import { ACCOUNT_CATEGORY_APPLICABLE_TYPES } from '@/constant'
import { commitMutationResult } from '@/lib/relay'

import { AccountCategoryPicker } from './account-category-picker'

// eslint-disable-next-line react-refresh/only-export-components
export const editAccountFragment = graphql`
  fragment editAccountFragment on Account {
    id
    name
    icon
    type
    category
  }
`

const editAccountMutation = graphql`
  mutation editAccountMutation($id: ID!, $input: UpdateAccountInput!) {
    updateAccount(id: $id, input: $input) {
      node {
        id
        name
        icon
        category
        ...accountCardFragment
      }
    }
  }
`

type EditAccountProps = {
  fragmentRef: editAccountFragment$key
}

export function EditAccount({ fragmentRef }: EditAccountProps) {
  const { t } = useLingui()
  const formSchema = z.object({
    name: z
      .string()
      .min(1, t`Account name must be at least 1 character.`)
      .max(64, t`Account name must be at most 64 characters.`),
    icon: z.string(),
    category: z.string(),
  })

  const showToast = useToast()

  const data = useFragment(editAccountFragment, fragmentRef)

  const [commitUpdateMutation, isUpdateMutationInFlight] =
    useMutation<editAccountMutation>(editAccountMutation)

  const form = useForm({
    defaultValues: {
      name: data.name,
      icon: data.icon || '',
      category: data.category || '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const result = await commitMutationResult<editAccountMutation>(
        commitUpdateMutation,
        {
          variables: {
            id: data.id,
            input: {
              name: formData.name,
              icon: formData.icon || null,
              clearIcon: !formData.icon,
              category: (formData.category || null) as AccountCategory | null,
              clearCategory: !formData.category,
            },
          },
        },
      )

      match(result)
        .with({ status: 'success' }, ({ data: resultData }) => {
          invariant(
            resultData.updateAccount.node,
            'No data returned from mutation',
          )
          showToast({
            type: 'info',
            body: t`${resultData.updateAccount.node.name} updated!`,
          })
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  return (
    <Card>
      <Stack direction="vertical" gap={6}>
        <Stack direction="vertical" gap={2} as="header">
          <Stack direction="horizontal" gap={3} align="center">
            <Avatar
              src={getLogoDomainURL(data.icon || '')}
              name={String(data.name)}
            />
            <Stack direction="vertical" gap={4}>
              <Heading level={2}>
                <Trans>Edit Account</Trans>
              </Heading>
            </Stack>
          </Stack>
        </Stack>
        <Stack direction="vertical" gap={4}>
          <Stack
            as="form"
            direction="vertical"
            gap={6}
            id="edit-account-form"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FormLayout>
              {ACCOUNT_CATEGORY_APPLICABLE_TYPES.has(data.type) && (
                <form.Field
                  name="category"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Stack
                        direction="vertical"
                        gap={2}
                        data-invalid={isInvalid}
                      >
                        <label htmlFor={field.name}>
                          <Trans>Category (optional)</Trans>
                        </label>
                        <AccountCategoryPicker
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FormError errors={field.state.meta.errors} />
                        )}
                      </Stack>
                    )
                  }}
                />
              )}
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <TextInput
                        data-1p-ignore
                        id={field.name}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        placeholder={t`My Account`}
                        autoComplete="off"
                        label={t`Name`}

                        value={String(field.state.value ?? '')}
                        onChange={(_value, event) =>
                          ((e) => field.handleChange(e.target.value))(event)
                        }
                        htmlName={field.name}
                      />
                      {isInvalid && (
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
                  )
                }}
              />
              <form.Field
                name="icon"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <TextInput
                        data-1p-ignore
                        id={field.name}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        placeholder="chase.com"
                        autoComplete="off"
                        label={t`Icon URL`}

                        value={String(field.state.value ?? '')}
                        onChange={(_value, event) =>
                          ((e) => field.handleChange(e.target.value))(event)
                        }
                        htmlName={field.name}
                      />
                      {isInvalid && (
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
                  )
                }}
              />
            </FormLayout>
          </Stack>
        </Stack>
        <Stack
          direction="horizontal"
          gap={3}
          align="center"
          wrap="wrap"
          justify="end"
          as="footer"
        >
          <Button
            type="submit"
            form="edit-account-form"
            label={String(isUpdateMutationInFlight ? t`Saving...` : t`Save`)}
            variant={'primary'}

            isDisabled={isUpdateMutationInFlight}
          >
            {isUpdateMutationInFlight ? t`Saving...` : t`Save`}
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}
