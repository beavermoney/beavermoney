import { graphql } from 'relay-runtime'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import { useNavigate } from '@tanstack/react-router'
import type { editCategoryMutation } from './__generated__/editCategoryMutation.graphql'
import type { editCategoryFragment$key } from './__generated__/editCategoryFragment.graphql'
import type { editCategoryDeleteMutation } from './__generated__/editCategoryDeleteMutation.graphql'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { commitMutationResult } from '@/lib/relay'
import { IconPicker, type IconName } from '@/components/ui/icon-picker'
import { AlertTriangleIcon } from 'lucide-react'
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
  mutation editCategoryDeleteMutation($id: ID!) {
    deleteTransactionCategory(id: $id)
  }
`

type EditCategoryProps = {
  fragmentRef: editCategoryFragment$key
}

export function EditCategory({ fragmentRef }: EditCategoryProps) {
  const data = useFragment(editCategoryFragment, fragmentRef)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const navigate = useNavigate()

  const [commitUpdateMutation, isUpdateMutationInFlight] =
    useMutation<editCategoryMutation>(editCategoryMutation)

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<editCategoryDeleteMutation>(editCategoryDeleteMutation)

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

          toast.success(
            `${resultData.updateTransactionCategory.node.name} updated!`,
          )
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
        })
        .exhaustive()
    },
  })

  const handleDelete = async () => {
    const result = await commitMutationResult<editCategoryDeleteMutation>(
      commitDeleteMutation,
      {
        variables: {
          id: data.id,
        },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        navigate({
          from: '/household/$householdId/categories/$categoryId',
          to: '/household/$householdId/categories',
          search: (prev) => ({ ...prev }),
        })
        toast.success('Category deleted!')
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
      })
      .exhaustive()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Category</CardTitle>
        <CardDescription>Update your category details</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="edit-category-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      data-1p-ignore
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Groceries"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="icon"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Icon</FieldLabel>
                    <IconPicker
                      id={field.name}
                      name={field.name}
                      value={field.state.value as IconName}
                      onValueChange={(value) => field.handleChange(value)}
                      className="max-w-min"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  type="button"
                  disabled={
                    isDeleteMutationInFlight || isUpdateMutationInFlight
                  }
                />
              }
            >
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia>
                  <AlertTriangleIcon className="text-destructive" />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleteMutationInFlight}
                >
                  {isDeleteMutationInFlight ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            disabled={isUpdateMutationInFlight}
            type="submit"
            form="edit-category-form"
          >
            {isUpdateMutationInFlight ? 'Saving...' : 'Save'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
