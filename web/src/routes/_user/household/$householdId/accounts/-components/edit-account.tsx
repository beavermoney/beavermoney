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
import { useState } from 'react'
import { AlertTriangleIcon, ArchiveIcon, Trash2Icon } from 'lucide-react'

import type { editAccountFragment$key } from './__generated__/editAccountFragment.graphql'
import type { editAccountMutation } from './__generated__/editAccountMutation.graphql'
import type { editAccountDeleteMutation } from './__generated__/editAccountDeleteMutation.graphql'
import type { editAccountArchiveMutation } from './__generated__/editAccountArchiveMutation.graphql'

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoDomainURL } from '@/lib/logo'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name must be at least 1 character.')
    .max(64, 'Account name must be at most 64 characters.'),
  icon: z.string(),
})

// eslint-disable-next-line react-refresh/only-export-components
export const editAccountFragment = graphql`
  fragment editAccountFragment on Account {
    id
    name
    icon
    value
    archived
  }
`

const editAccountMutation = graphql`
  mutation editAccountMutation($id: ID!, $input: UpdateAccountInput!) {
    updateAccount(id: $id, input: $input) {
      node {
        id
        name
        icon
        archived
        ...accountDetailCardFragment
        ...accountCardFragment
      }
    }
  }
`

const editAccountDeleteMutation = graphql`
  mutation editAccountDeleteMutation($id: ID!) {
    deleteAccount(id: $id)
  }
`

const editAccountArchiveMutation = graphql`
  mutation editAccountArchiveMutation($id: ID!) {
    archiveAccount(id: $id)
  }
`

type EditAccountProps = {
  fragmentRef: editAccountFragment$key
  householdId: string
}

export function EditAccount({ fragmentRef, householdId }: EditAccountProps) {
  const data = useFragment(editAccountFragment, fragmentRef)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [archiveAlertOpen, setArchiveAlertOpen] = useState(false)
  const navigate = useNavigate()

  const [commitUpdateMutation, isUpdateMutationInFlight] =
    useMutation<editAccountMutation>(editAccountMutation)

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<editAccountDeleteMutation>(editAccountDeleteMutation)

  const [commitArchiveMutation, isArchiveMutationInFlight] =
    useMutation<editAccountArchiveMutation>(editAccountArchiveMutation)

  const isAnyMutationInFlight =
    isUpdateMutationInFlight ||
    isDeleteMutationInFlight ||
    isArchiveMutationInFlight

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

      const result = await commitMutationResult<editAccountMutation>(
        commitUpdateMutation,
        {
          variables: {
            id: data.id,
            input: {
              name: formData.name,
              icon: formData.icon || null,
              clearIcon: !formData.icon,
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
          toast.success(`${resultData.updateAccount.node.name} updated!`)
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
        })
        .exhaustive()
    },
  })

  const handleDelete = async () => {
    const result = await commitMutationResult<editAccountDeleteMutation>(
      commitDeleteMutation,
      {
        variables: { id: data.id },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        navigate({
          to: '/household/$householdId/accounts',
          params: { householdId },
          search: (prev) => ({ ...prev }),
        })
        toast.success('Account deleted!')
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
      })
      .exhaustive()
  }

  const handleArchive = async () => {
    const result = await commitMutationResult<editAccountArchiveMutation>(
      commitArchiveMutation,
      {
        variables: { id: data.id },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        navigate({
          to: '/household/$householdId/accounts',
          params: { householdId },
          search: (prev) => ({ ...prev }),
        })
        toast.success('Account archived!')
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
      })
      .exhaustive()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{data.name}</AvatarFallback>
            {data.icon && (
              <AvatarImage src={getLogoDomainURL(data.icon)} alt={data.icon} />
            )}
          </Avatar>
          <div>
            <CardTitle>Edit Account</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          id="edit-account-form"
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
                      placeholder="My Account"
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
                    <FieldLabel htmlFor={field.name}>Icon URL</FieldLabel>
                    <Input
                      data-1p-ignore
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="chase.com"
                      autoComplete="off"
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
      <CardFooter className="flex-col gap-2">
        <div className="flex w-full justify-between gap-2">
          {/* Delete button */}
          <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  type="button"
                  disabled={isAnyMutationInFlight}
                />
              }
            >
              <Trash2Icon className="mr-1 size-4" />
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia>
                  <AlertTriangleIcon className="text-destructive" />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  account. Delete is only allowed if there are no transactions
                  or investments attached.
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

          <div className="flex gap-2">
            {/* Archive button */}
            {!data.archived && (
              <AlertDialog
                open={archiveAlertOpen}
                onOpenChange={setArchiveAlertOpen}
              >
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isAnyMutationInFlight}
                    />
                  }
                >
                  <ArchiveIcon className="mr-1 size-4" />
                  Archive
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogMedia>
                      <ArchiveIcon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Archive Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will archive the account and hide it from the main
                      list. Archive is only allowed when the account balance is
                      zero.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleArchive}
                      disabled={isArchiveMutationInFlight}
                    >
                      {isArchiveMutationInFlight ? 'Archiving...' : 'Archive'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Save button */}
            <Button
              disabled={isAnyMutationInFlight}
              type="submit"
              form="edit-account-form"
            >
              {isUpdateMutationInFlight ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
