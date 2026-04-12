import { graphql } from 'relay-runtime'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import { useState } from 'react'

import type { generalSettingsHouseholdFragment$key } from './__generated__/generalSettingsHouseholdFragment.graphql'
import type { generalSettingsCurrenciesFragment$key } from './__generated__/generalSettingsCurrenciesFragment.graphql'
import type { generalSettingsUpdateHouseholdMutation } from './__generated__/generalSettingsUpdateHouseholdMutation.graphql'
import type { generalSettingsDeleteHouseholdMutation } from './__generated__/generalSettingsDeleteHouseholdMutation.graphql'

import { useUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { commitMutationResult } from '@/lib/relay'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Household name is required.')
    .max(64, 'Household name must be at most 64 characters.'),
  locale: z.string().min(1, 'Locale is required.'),
})

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
  onDeleted: () => void
}

export function GeneralSettings({
  householdRef,
  currenciesRef,
  onDeleted,
}: GeneralSettingsProps) {
  const household = useFragment(generalSettingsHouseholdFragment, householdRef)
  const { userHouseholds } = useFragment(
    generalSettingsCurrenciesFragment,
    currenciesRef,
  )

  const { user } = useUser()
  const isAdmin =
    userHouseholds.find((uh) => uh.user.id === user.id)?.role === 'admin'

  const [commitUpdate, isUpdateInFlight] =
    useMutation<generalSettingsUpdateHouseholdMutation>(updateHouseholdMutation)

  const [commitDelete, isDeleteInFlight] =
    useMutation<generalSettingsDeleteHouseholdMutation>(deleteHouseholdMutation)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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
          toast.success('Household updated.')
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
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
        toast.success('Household deleted.')
        setDeleteDialogOpen(false)
        onDeleted()
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
      })
      .exhaustive()
  }

  return (
    <div className="flex max-w-md flex-col gap-5">
      <form
        id="general-settings-form"
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
                    placeholder="My Household"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <form.Field
            name="locale"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Locale</FieldLabel>
                  <Input
                    data-1p-ignore
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="en-CA"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </FieldGroup>
        <div className="mt-3">
          <Button
            disabled={isUpdateInFlight}
            type="submit"
            form="general-settings-form"
            size="sm"
          >
            {isUpdateInFlight ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>

      {isAdmin && (
        <>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs/relaxed font-medium">Delete household</p>
              <p className="text-muted-foreground text-xs/relaxed">
                Permanently remove this household and all its data.
              </p>
            </div>
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger
                render={
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete household?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete{' '}
                    <span className="text-foreground font-medium">
                      {household.name}
                    </span>{' '}
                    and all associated data including accounts, transactions,
                    and categories. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={isDeleteInFlight}
                    onClick={handleDelete}
                  >
                    {isDeleteInFlight ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  )
}
