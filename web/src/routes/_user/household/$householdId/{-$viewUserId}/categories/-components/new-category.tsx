import { graphql } from 'relay-runtime'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useMutation } from 'react-relay'
import { capitalize } from 'lodash-es'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import { useNavigate } from '@tanstack/react-router'
import type { newCategoryMutation } from './__generated__/newCategoryMutation.graphql'

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
import { commitMutationResult } from '@/lib/relay'
import { IconPicker, type IconName } from '@/components/ui/icon-picker'
import { useHousehold } from '@/hooks/use-household'

const CATEGORY_TYPES = ['expense', 'income'] as const

const CATEGORY_TYPE_DESCRIPTION: Record<string, string> = {
  expense: 'Money going out',
  income: 'Money coming in',
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name must be at least 1 character.')
    .max(32, 'Category name must be at most 32 characters.'),
  icon: z.string(),
  type: z.enum(['expense', 'income']),
})

const newCategoryMutation = graphql`
  mutation newCategoryMutation($input: CreateTransactionCategoryInput!) {
    createTransactionCategory(input: $input) {
      node {
        id
        name
        type
      }
    }
  }
`

export function NewCategory() {
  const navigate = useNavigate()

  const { household } = useHousehold()
  const [commitMutation, isMutationInFlight] =
    useMutation<newCategoryMutation>(newCategoryMutation)

  const form = useForm({
    defaultValues: {
      name: '',
      icon: '',
      type: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const result = await commitMutationResult<newCategoryMutation>(
        commitMutation,
        {
          variables: {
            input: {
              name: formData.name,
              icon: formData.icon,
              type: formData.type,
            },
          },

          updater: (store) => {
            store.get(household.id)?.invalidateRecord()
          },
        },
      )

      // Pattern match the result
      match(result)
        .with({ status: 'success' }, ({ data: resultData }) => {
          invariant(
            resultData.createTransactionCategory.node,
            'No data returned from mutation',
          )

          form.reset()
          navigate({
            from: '/household/$householdId/{-$viewUserId}/categories/new',
            to: '/household/$householdId/{-$viewUserId}/categories',
            search: (prev) => ({ ...prev }),
          })
          toast.success(
            `${resultData.createTransactionCategory.node.name} is ready to go!`,
          )
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
        <CardTitle>New Category</CardTitle>
        <CardDescription>
          Create a new category for your transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="new-category-form"
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
            <form.Field
              name="type"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                    <Combobox
                      items={[...CATEGORY_TYPES]}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value || '')}
                    >
                      <ComboboxInput
                        id={field.name}
                        name={field.name}
                        placeholder="Select a type"
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        className="*:capitalize"
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => (
                            <ComboboxItem
                              key={item}
                              value={item}
                              className="flex flex-col items-start gap-0"
                            >
                              <span className="font-semibold">
                                {capitalize(item)}
                              </span>
                              <span>{CATEGORY_TYPE_DESCRIPTION[item]}</span>
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            disabled={isMutationInFlight}
            type="submit"
            form="new-category-form"
          >
            {isMutationInFlight ? 'Creating...' : 'Create'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
