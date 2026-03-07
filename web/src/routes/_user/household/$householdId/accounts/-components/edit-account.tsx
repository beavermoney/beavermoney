import { graphql } from 'relay-runtime'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'

import type { editAccountFragment$key } from './__generated__/editAccountFragment.graphql'
import type { editAccountMutation } from './__generated__/editAccountMutation.graphql'

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
  }
`

const editAccountMutation = graphql`
  mutation editAccountMutation($id: ID!, $input: UpdateAccountInput!) {
    updateAccount(id: $id, input: $input) {
      node {
        id
        name
        icon
        ...accountCardFragment
      }
    }
  }
`

type EditAccountProps = {
  fragmentRef: editAccountFragment$key
}

export function EditAccount({ fragmentRef }: EditAccountProps) {
  const data = useFragment(editAccountFragment, fragmentRef)

  const [commitUpdateMutation, isUpdateMutationInFlight] =
    useMutation<editAccountMutation>(editAccountMutation)

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
      <CardFooter>
        <Button
          disabled={isUpdateMutationInFlight}
          type="submit"
          form="edit-account-form"
        >
          {isUpdateMutationInFlight ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  )
}
