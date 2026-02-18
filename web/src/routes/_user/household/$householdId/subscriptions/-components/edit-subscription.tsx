import { graphql } from 'relay-runtime'
import { useForm, useStore } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import { capitalize } from 'lodash-es'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import { useNavigate } from '@tanstack/react-router'
import type { editSubscriptionMutation } from './__generated__/editSubscriptionMutation.graphql'
import type { editSubscriptionFragment$key } from './__generated__/editSubscriptionFragment.graphql'
import type { editSubscriptionDeleteMutation } from './__generated__/editSubscriptionDeleteMutation.graphql'

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
  FieldDescription,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar } from '@/components/ui/calendar'
import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoDomainURL } from '@/lib/logo'
import { CurrencyInput } from '@/components/currency-input'
import { editSubscriptionCurrenciesFragment$key } from './__generated__/editSubscriptionCurrenciesFragment.graphql'

const SUBSCRIPTION_INTERVALS = ['week', 'month', 'year'] as const

const INTERVAL_DESCRIPTION: Record<string, string> = {
  week: 'Charged weekly',
  month: 'Charged monthly',
  year: 'Charged yearly',
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Subscription name must be at least 1 character.')
    .max(64, 'Subscription name must be at most 64 characters.'),
  icon: z.string(),
  interval: z.enum(['week', 'month', 'year']),
  intervalCount: z
    .number()
    .int()
    .min(1, 'Interval count must be at least 1.')
    .max(100, 'Interval count must be at most 100.'),
  startDate: z.date(),
  cost: z.string(),
  currencyCode: z.string(),
  active: z.boolean(),
})

const editSubscriptionCurrenciesFragment = graphql`
  fragment editSubscriptionCurrenciesFragment on Query {
    currencies {
      id
      code
    }
  }
`

const editSubscriptionFragment = graphql`
  fragment editSubscriptionFragment on RecurringSubscription {
    id
    name
    icon
    interval
    intervalCount
    startDate
    cost
    currency {
      id
      code
    }
    active
  }
`

const editSubscriptionMutation = graphql`
  mutation editSubscriptionMutation(
    $id: ID!
    $input: UpdateRecurringSubscriptionInput!
  ) {
    updateRecurringSubscription(id: $id, input: $input) {
      node {
        id
        name
        interval
        intervalCount
        startDate
        cost
        fxRate
        currency {
          id
          code
        }
        active
        ...subscriptionCardFragment
      }
    }
  }
`

const editSubscriptionDeleteMutation = graphql`
  mutation editSubscriptionDeleteMutation($id: ID!) {
    deleteRecurringSubscription(id: $id)
  }
`

type EditSubscriptionProps = {
  fragmentRef: editSubscriptionFragment$key
  currenciesRef: editSubscriptionCurrenciesFragment$key
}

export function EditSubscription({
  fragmentRef,
  currenciesRef,
}: EditSubscriptionProps) {
  const data = useFragment(editSubscriptionFragment, fragmentRef)
  const currencies = useFragment(
    editSubscriptionCurrenciesFragment,
    currenciesRef,
  )
  const navigate = useNavigate()

  const [commitUpdateMutation, isUpdateMutationInFlight] =
    useMutation<editSubscriptionMutation>(editSubscriptionMutation)

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<editSubscriptionDeleteMutation>(editSubscriptionDeleteMutation)

  const { household } = useHousehold()

  const form = useForm({
    defaultValues: {
      name: data.name,
      icon: data.icon || '',
      interval: data.interval as '' | 'week' | 'month' | 'year',
      intervalCount: data.intervalCount,
      startDate: new Date(data.startDate),
      cost: data.cost,
      currencyCode: data.currency.code,
      active: data.active,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const currencyID = currencies.currencies.find(
        (curr: { id: string; code: string }) =>
          curr.code === formData.currencyCode,
      )?.id
      invariant(currencyID, 'Currency not found')

      const result = await commitMutationResult<editSubscriptionMutation>(
        commitUpdateMutation,
        {
          variables: {
            id: data.id,
            input: {
              name: formData.name,
              interval: formData.interval,
              intervalCount: formData.intervalCount,
              startDate: formData.startDate.toISOString(),
              cost: formData.cost,
              currencyID: currencyID,
              icon: formData.icon || null,
              active: formData.active,
            },
          },
        },
      )

      // Pattern match the result
      match(result)
        .with({ status: 'success' }, ({ data: resultData }) => {
          invariant(
            resultData.updateRecurringSubscription.node,
            'No data returned from mutation',
          )

          toast.success(
            `${resultData.updateRecurringSubscription.node.name} updated!`,
          )
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
        })
        .exhaustive()
    },
  })

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return
    }

    const result = await commitMutationResult<editSubscriptionDeleteMutation>(
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
          from: '/household/$householdId/subscriptions/$subscriptionId',
          to: '/household/$householdId/subscriptions',
          search: (prev) => ({ ...prev }),
        })
        toast.success('Subscription deleted!')
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
      })
      .exhaustive()
  }

  const currencyCode = useStore(form.store, (state) => {
    return state.values.currencyCode || household.currency.code
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Subscription</CardTitle>
        <CardDescription>Update your subscription details</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="edit-subscription-form"
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
                      placeholder="Netflix"
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
                    <FieldDescription>
                      Enter a domain to fetch logo (e.g., netflix.com)
                    </FieldDescription>
                    <div className="flex items-center gap-3">
                      <Input
                        data-1p-ignore
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value)
                        }}
                        aria-invalid={isInvalid}
                        placeholder="e.g., netflix.com"
                        autoComplete="off"
                        className="flex-1"
                      />
                      {field.state.value && (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage
                              src={getLogoDomainURL(field.state.value)}
                              alt={field.state.value}
                            />
                            <AvatarFallback className="text-xs">
                              {field.state.value.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="interval"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Interval</FieldLabel>
                    <Combobox
                      items={[...SUBSCRIPTION_INTERVALS]}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value || '')}
                    >
                      <ComboboxInput
                        id={field.name}
                        name={field.name}
                        placeholder="Select an interval"
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
                              <span>{INTERVAL_DESCRIPTION[item]}</span>
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
            <form.Field
              name="intervalCount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Interval Count</FieldLabel>
                    <FieldDescription>
                      How many intervals between charges (e.g., 2 = every 2
                      months)
                    </FieldDescription>
                    <Input
                      data-1p-ignore
                      type="number"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val)) {
                          field.handleChange(val)
                        }
                      }}
                      aria-invalid={isInvalid}
                      placeholder="1"
                      autoComplete="off"
                      min="1"
                      max="100"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="startDate"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Start Date</FieldLabel>
                    <FieldDescription>
                      When does this subscription start?
                    </FieldDescription>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            id={field.name}
                            name={field.name}
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {field.state.value.toLocaleDateString(
                              household.locale,
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              },
                            )}
                          </Button>
                        }
                      />
                      <DropdownMenuContent className="w-auto p-0" side="top">
                        <Calendar
                          mode="single"
                          selected={field.state.value}
                          onSelect={(date) => {
                            if (date) {
                              field.handleChange(date)
                            }
                          }}
                          disabled={(date) => date < new Date('1900-01-01')}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="currencyCode"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Currency</FieldLabel>
                    <Combobox
                      items={currencies.currencies.map(
                        (c: { id: string; code: string }) => c.code,
                      )}
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value || '')
                      }}
                    >
                      <ComboboxInput
                        id={field.name}
                        name={field.name}
                        placeholder="Select a currency"
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
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
            <form.Field
              name="cost"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Cost</FieldLabel>
                    <FieldDescription>
                      How much does this subscription cost per interval?
                    </FieldDescription>
                    <CurrencyInput
                      id={field.name}
                      name={field.name}
                      placeholder="Please enter a number"
                      onValueChange={(e) => {
                        field.handleChange(e.value)
                      }}
                      value={field.state.value}
                      locale={household.locale}
                      currency={currencyCode}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      allowNegative={false}
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleteMutationInFlight}
          >
            {isDeleteMutationInFlight ? 'Deleting...' : 'Delete'}
          </Button>
          <Button
            disabled={isUpdateMutationInFlight}
            type="submit"
            form="edit-subscription-form"
          >
            {isUpdateMutationInFlight ? 'Saving...' : 'Save'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
