import { graphql } from 'relay-runtime'
import { useForm, useStore } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import { capitalize } from 'lodash-es'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import { useNavigate } from '@tanstack/react-router'
import type { newSubscriptionMutation } from './__generated__/newSubscriptionMutation.graphql'
import type { newSubscriptionFragment$key } from './__generated__/newSubscriptionFragment.graphql'

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
import { CurrencyInput } from '@/components/currency-input'
import { commitMutationResult } from '@/lib/relay'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoDomainURL } from '@/lib/logo'

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

const newSubscriptionFragment = graphql`
  fragment newSubscriptionFragment on Query {
    currencies {
      id
      code
    }
  }
`

const newSubscriptionMutation = graphql`
  mutation newSubscriptionMutation($input: CreateRecurringSubscriptionInput!) {
    createRecurringSubscription(input: $input) {
      node {
        id
        name
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
    }
  }
`

type NewSubscriptionProps = {
  fragmentRef: newSubscriptionFragment$key
}

export function NewSubscription({ fragmentRef }: NewSubscriptionProps) {
  const data = useFragment(newSubscriptionFragment, fragmentRef)
  const navigate = useNavigate()

  const [commitMutation, isMutationInFlight] =
    useMutation<newSubscriptionMutation>(newSubscriptionMutation)

  const { household } = useHousehold()

  const form = useForm({
    defaultValues: {
      name: '',
      icon: '',
      interval: '' as '' | 'week' | 'month' | 'year',
      intervalCount: 1,
      startDate: new Date(),
      cost: '',
      currencyCode: household.currency.code,
      active: true,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const currencyID = data.currencies.find(
        (curr: { id: string; code: string }) =>
          curr.code === formData.currencyCode,
      )?.id
      invariant(currencyID, 'Currency not found')

      const result = await commitMutationResult<newSubscriptionMutation>(
        commitMutation,
        {
          variables: {
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
            resultData.createRecurringSubscription.node,
            'No data returned from mutation',
          )

          form.reset()
          navigate({
            from: '/household/$householdId/subscriptions/new',
            to: '/household/$householdId/subscriptions',
            search: (prev) => ({ ...prev }),
          })
          toast.success(
            `${resultData.createRecurringSubscription.node.name} is ready to go!`,
          )
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(error.toString())
        })
        .exhaustive()
    },
  })

  const currencyCode = useStore(form.store, (state) => {
    return state.values.currencyCode || household.currency.code
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Subscription</CardTitle>
        <CardDescription>
          Track your recurring subscriptions in Beaver Money
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="new-subscription-form"
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
                      items={data.currencies.map(
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
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            disabled={isMutationInFlight}
            type="submit"
            form="new-subscription-form"
          >
            {isMutationInFlight ? 'Creating...' : 'Create'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
