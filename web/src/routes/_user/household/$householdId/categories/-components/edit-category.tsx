import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { FormError } from '@/components/form-error'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { graphql } from 'relay-runtime'

import { useToast } from '@astryxdesign/core/Toast'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { useFragment, useMutation } from 'react-relay'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'
import type { editCategoryDeleteMutation } from './__generated__/editCategoryDeleteMutation.graphql'
import type { editCategoryFragment$key } from './__generated__/editCategoryFragment.graphql'
import type { editCategoryMutation } from './__generated__/editCategoryMutation.graphql'

import { IconPicker, type IconName } from '@/components/icon-picker'
import { commitMutationResult, NodeType, useDeleteNode } from '@/lib/relay'
import { useState } from 'react'

const editCategoryFragment = graphql`
  fragment editCategoryFragment on TransactionCategory {
    id
    name
    icon
  }
`

const editCategoryMutation = graphql`
  mutation editCategoryMutation(
    $id: ID!
    $input: UpdateTransactionCategoryInput!
  ) {
    updateTransactionCategory(id: $id, input: $input) {
      node {
        id
        name
        type
        icon
        ...categoryCardCategoryFragment
      }
    }
  }
`

const editCategoryDeleteMutation = graphql`
  mutation editCategoryDeleteMutation($id: ID!, $connections: [ID!]!) {
    deleteTransactionCategory(id: $id) {
      deletedTransactionCategoryId @deleteEdge(connections: $connections)
    }
  }
`

type EditCategoryProps = {
  fragmentRef: editCategoryFragment$key
}

export function EditCategory({ fragmentRef }: EditCategoryProps) {
  const { t } = useLingui()
  const formSchema = z.object({
    name: z
      .string()
      .min(1, t`Category name must be at least 1 character.`)
      .max(32, t`Category name must be at most 32 characters.`),
    icon: z.string(),
  })

  const showToast = useToast()

  const data = useFragment(editCategoryFragment, fragmentRef)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const navigate = useNavigate()

  const [commitUpdateMutation, isUpdateMutationInFlight] =
    useMutation<editCategoryMutation>(editCategoryMutation)

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<editCategoryDeleteMutation>(editCategoryDeleteMutation)

  const deleteNode = useDeleteNode(NodeType.TransactionCategory)

  const form = useForm({
    defaultValues: {
      name: data.name,
      icon: data.icon || '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const result = await commitMutationResult<editCategoryMutation>(
        commitUpdateMutation,
        {
          variables: {
            id: data.id,
            input: {
              name: formData.name,
              icon: formData.icon || null,
            },
          },
        },
      )

      // Pattern match the result
      match(result)
        .with({ status: 'success' }, ({ data: resultData }) => {
          invariant(
            resultData.updateTransactionCategory.node,
            'No data returned from mutation',
          )

          showToast({
            type: 'info',
            body: t`${resultData.updateTransactionCategory.node.name} updated!`,
          })
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  const handleDelete = async () => {
    const result = await deleteNode((connections) =>
      commitMutationResult<editCategoryDeleteMutation>(commitDeleteMutation, {
        variables: {
          id: data.id,
          connections,
        },
      }),
    )

    match(result)
      .with({ status: 'success' }, () => {
        navigate({
          from: '/household/$householdId/categories/$categoryId',
          to: '/household/$householdId/categories',
          search: (prev) => ({ ...prev }),
        })
        showToast({ type: 'info', body: t`Category deleted!` })
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: error.toString() })
      })
      .exhaustive()
  }

  return (
    <Card>
      <Stack direction="vertical" gap={6}>
        <Stack direction="vertical" gap={2} as="header">
          <Heading level={2}>
            <Trans>Edit Category</Trans>
          </Heading>
        </Stack>
        <Stack direction="vertical" gap={4}>
          <Stack
            as="form"
            direction="vertical"
            gap={6}
            id="edit-category-form"
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
                        placeholder={t`Groceries`}
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
                      <IconPicker
                        id={field.name}
                        name={field.name}
                        value={field.state.value as IconName}
                        onValueChange={(value) => field.handleChange(value)}
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
          <Stack direction="horizontal" gap={2} wrap="wrap">
            <>
              <Button
                onClick={() => setDeleteAlertOpen(true)}
                type="button"
                label={t`Delete`}
                variant={'destructive'}

                isDisabled={
                  isDeleteMutationInFlight || isUpdateMutationInFlight
                }
              >
                <Trans>Delete</Trans>
              </Button>
              <Dialog
                isOpen={deleteAlertOpen}
                onOpenChange={setDeleteAlertOpen}
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
                          <Trans>Delete Category</Trans>
                        </>
                      }
                      onOpenChange={setDeleteAlertOpen}
                    />
                  }
                >
                  <LayoutContent>
                    <Stack direction="vertical" gap={6} paddingBlockStart={4}>
                      <Text as="div" display="block" type="supporting">
                        <Trans>
                          This action cannot be undone. This will permanently
                          delete the category.
                        </Trans>
                      </Text>
                      <Stack
                        direction="horizontal"
                        gap={3}
                        align="center"
                        wrap="wrap"
                        justify="end"
                      >
                        <Button
                          label={t`Cancel`}
                          onClick={() => setDeleteAlertOpen(false)}
                        />
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          isDisabled={isDeleteMutationInFlight}
                          label={t`Delete`}
                        >
                          {isDeleteMutationInFlight
                            ? t`Deleting...`
                            : t`Delete`}
                        </Button>
                      </Stack>
                    </Stack>
                  </LayoutContent>
                </Layout>
              </Dialog>
            </>
            <Button
              type="submit"
              form="edit-category-form"
              label={String(isUpdateMutationInFlight ? t`Saving...` : t`Save`)}
              variant={'primary'}

              isDisabled={isUpdateMutationInFlight}
            >
              {isUpdateMutationInFlight ? t`Saving...` : t`Save`}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  )
}
