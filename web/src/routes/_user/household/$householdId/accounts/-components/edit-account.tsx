import { graphql } from 'relay-runtime'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'

import type { editAccountFragment$key } from './__generated__/editAccountFragment.graphql'
import type {
  editAccountMutation,
  AccountCategory,
} from './__generated__/editAccountMutation.graphql'

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
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  ACCOUNT_CATEGORY_OPTIONS,
  ACCOUNT_CATEGORY_APPLICABLE_TYPES,
} from '@/constant'
import { commitMutationResult } from '@/lib/relay'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoDomainURL } from '@/lib/logo'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name must be at least 1 character.')
    .max(64, 'Account name must be at most 64 characters.'),
  icon: z.string(),
  category: z.string(),
})

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
            {ACCOUNT_CATEGORY_APPLICABLE_TYPES.has(data.type) && (
              <form.Field
                name="category"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  const selectedItem =
                    ACCOUNT_CATEGORY_OPTIONS.find(
                      (o) => o.value === field.state.value,
                    ) ?? null
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Category (optional)
                      </FieldLabel>
                      <Combobox
                        items={ACCOUNT_CATEGORY_OPTIONS}
                        value={selectedItem}
                        onValueChange={(item) =>
                          field.handleChange(item?.value ?? '')
                        }
                      >
                        <ComboboxInput
                          id={field.name}
                          name={field.name}
                          placeholder="None (Taxable)"
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>No items found.</ComboboxEmpty>
                          <ComboboxList>
                            {(item: { value: string; label: string }) => (
                              <ComboboxItem key={item.value} value={item}>
                                {item.label}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
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
