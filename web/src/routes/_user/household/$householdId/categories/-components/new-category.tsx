import { FormError } from '@/components/form-error'
import { SearchSelect } from '@/components/search-select'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { capitalize } from 'lodash-es'
import { useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'
import type { newCategoryMutation } from './__generated__/newCategoryMutation.graphql'

import { IconPicker, type IconName } from '@/components/icon-picker'
import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'

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
  const showToast = useToast()

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
            from: '/household/$householdId/categories/new',
            to: '/household/$householdId/categories',
            search: (prev) => ({ ...prev }),
          })
          showToast({
            type: 'info',
            body: `${resultData.createTransactionCategory.node.name} is ready to go!`,
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
      <Stack direction="vertical" gap={2} as="header">
        <Heading level={2}>New Category</Heading>
        <Stack direction="vertical" gap={4}>
          Create a new category for your transactions
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <Stack
          as="form"
          direction="vertical"
          gap={6}
          id="new-category-form"
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
            <form.Field
              name="type"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <SearchSelect
                      items={[...CATEGORY_TYPES]}
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value || '')}
                      id={field.name}
                      placeholder="Select a type"
                      onBlur={field.handleBlur}
                      label={'Type'}
                      renderOption={(item: string) => (
                        <span>
                          <Text type="label">{capitalize(item)}</Text>
                          <span>{CATEGORY_TYPE_DESCRIPTION[item]}</span>
                        </span>
                      )}
                      emptyText={<>No items found.</>}
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
          <Button
            type="button"
            onClick={() => form.reset()}
            label={'Reset'}
            variant={'secondary'}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="new-category-form"
            label={String(isMutationInFlight ? 'Creating...' : 'Create')}
            variant={'primary'}

            isDisabled={isMutationInFlight}
          >
            {isMutationInFlight ? 'Creating...' : 'Create'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}
