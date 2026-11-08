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

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name must be at least 1 character.')
    .max(32, 'Category name must be at most 32 characters.'),
  icon: z.string(),
})

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
            body: `${resultData.updateTransactionCategory.node.name} updated!`,
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
        showToast({ type: 'info', body: 'Category deleted!' })
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: error.toString() })
      })
      .exhaustive()
  }

  return (
    <Card>
      <Stack direction="vertical" gap={2} as="header">
        <Heading level={2}>Edit Category</Heading>
        <Stack direction="vertical" gap={4}>
          Update your category details
        </Stack>
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
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <TextInput
                      data-1p-ignore
                      id={field.name}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      placeholder="Groceries"
                      autoComplete="off"
                      label={'Name'}

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
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
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
              label={'Delete'}
              variant={'destructive'}

              isDisabled={isDeleteMutationInFlight || isUpdateMutationInFlight}
            >
              Delete
            </Button>
            <Dialog
              isOpen={deleteAlertOpen}
              onOpenChange={setDeleteAlertOpen}
              purpose="form"
              role="alertdialog"
            >
              <DialogHeader
                title={<>Delete Category</>}
                onOpenChange={setDeleteAlertOpen}
              />
              <Text as="div" display="block" type="supporting">
                This action cannot be undone. This will permanently delete the
                category.
              </Text>
              <Stack
                direction="horizontal"
                gap={3}
                align="center"
                wrap="wrap"
                justify="end"
              >
                <Button
                  label="Cancel"
                  onClick={() => setDeleteAlertOpen(false)}
                />
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  isDisabled={isDeleteMutationInFlight}
                  label="Delete"
                >
                  {isDeleteMutationInFlight ? 'Deleting...' : 'Delete'}
                </Button>
              </Stack>
            </Dialog>
          </>
          <Button
            type="submit"
            form="edit-category-form"
            label={String(isUpdateMutationInFlight ? 'Saving...' : 'Save')}
            variant={'primary'}

            isDisabled={isUpdateMutationInFlight}
          >
            {isUpdateMutationInFlight ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}
