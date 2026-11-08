import { FinanceCalendar } from '@/components/finance-calendar'
import { FormError } from '@/components/form-error'
import { SearchSelect } from '@/components/search-select'
import { Avatar } from '@astryxdesign/core/Avatar'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Heading } from '@astryxdesign/core/Heading'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Popover } from '@astryxdesign/core/Popover'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm, useStore } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { capitalize } from 'lodash-es'
import { useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'
import type { newSubscriptionMutation } from './__generated__/newSubscriptionMutation.graphql'

import { CurrencyInput } from '@/components/currency-input'
import { useDefaultOwnerUserID } from '@/hooks/use-default-owner-user-id'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdMembers } from '@/hooks/use-household-members'
import { useUser } from '@/hooks/use-user'
import { commitMutationResult } from '@/lib/relay'
import { OwnerSelect } from '../../-components/owner-select'

import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { SUPPORTED_CURRENCIES } from '@/lib/currencies'
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
  ownerUserID: z.string().min(1, 'Please select an owner'),
})

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
        householdCurrency {
          id
          code
        }
        active
        ...subscriptionCardFragment
      }
    }
  }
`

export function NewSubscription() {
  const showToast = useToast()

  const navigate = useNavigate()

  const [commitMutation, isMutationInFlight] =
    useMutation<newSubscriptionMutation>(newSubscriptionMutation)

  const { displayCurrencyCode } = useDisplayCurrency()

  const { household } = useHousehold()
  const { user } = useUser()

  const ownerOptions = useHouseholdMembers()
  const defaultOwnerUserID = useDefaultOwnerUserID(user.id)

  const form = useForm({
    defaultValues: {
      name: '',
      icon: '',
      interval: '' as '' | 'week' | 'month' | 'year',
      intervalCount: 1,
      startDate: new Date(),
      cost: '',
      currencyCode: displayCurrencyCode,
      active: true,
      ownerUserID: defaultOwnerUserID,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const currencyID = household.householdCurrencies?.find(
        (hc) => hc.code === formData.currencyCode,
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
              householdCurrencyID: currencyID,
              icon: formData.icon || null,
              active: formData.active,
              userID: formData.ownerUserID,
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
            resultData.createRecurringSubscription.node,
            'No data returned from mutation',
          )

          form.reset()
          navigate({
            from: '/household/$householdId/subscriptions/new',
            to: '/household/$householdId/subscriptions/$subscriptionId',
            params: {
              subscriptionId: resultData.createRecurringSubscription.node.id,
            },
            search: (prev) => ({ ...prev }),
          })
          showToast({
            type: 'info',
            body: `${resultData.createRecurringSubscription.node.name} is ready to go!`,
          })
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  const currencyCode = useStore(form.store, (state) => {
    return state.values.currencyCode ?? displayCurrencyCode
  })

  return (
    <Card>
      <Stack direction="vertical" gap={2} as="header">
        <Heading level={2}>New Subscription</Heading>
        <Stack direction="vertical" gap={4}>
          Track your recurring subscriptions in Beaver Money
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <Stack
          as="form"
          direction="vertical"
          gap={6}
          id="new-subscription-form"
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
                      placeholder="Netflix"
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
            {ownerOptions.length > 1 && (
              <form.Field
                name="ownerUserID"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Stack
                      direction="vertical"
                      gap={2}
                      data-invalid={isInvalid}
                    >
                      <OwnerSelect
                        id={field.name}
                        name={field.name}
                        options={ownerOptions}
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value)}
                        onBlur={field.handleBlur}
                        ariaInvalid={isInvalid}
                      />
                      {isInvalid && (
                        <FormError errors={field.state.meta.errors} />
                      )}
                    </Stack>
                  )
                }}
              />
            )}
            <form.Field
              name="icon"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <Stack direction="vertical" gap={4}>
                      Enter a domain to fetch logo (e.g., netflix.com)
                    </Stack>
                    <Stack direction="horizontal" gap={3} align="center">
                      <TextInput
                        data-1p-ignore
                        id={field.name}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        placeholder="e.g., netflix.com"
                        autoComplete="off"
                        label={'Icon'}

                        value={String(field.state.value ?? '')}
                        onChange={(_value, event) =>
                          ((e) => {
                            field.handleChange(e.target.value)
                          })(event)
                        }
                        htmlName={field.name}
                      />
                      {field.state.value && (
                        <Stack direction="horizontal" gap={2} align="center">
                          <Avatar
                            src={getLogoDomainURL(field.state.value)}
                            alt={field.state.value}
                            name={String(
                              field.state.value.slice(0, 2).toUpperCase(),
                            )}
                          />
                        </Stack>
                      )}
                    </Stack>
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <form.Field
              name="interval"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <SearchSelect
                      items={[...SUBSCRIPTION_INTERVALS]}
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value || '')}
                      id={field.name}
                      placeholder="Select an interval"
                      onBlur={field.handleBlur}
                      label={'Interval'}
                      renderOption={(item: string) => (
                        <span>
                          <Text type="label">{capitalize(item)}</Text>
                          <span>{INTERVAL_DESCRIPTION[item]}</span>
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
            <form.Field
              name="intervalCount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <Stack direction="vertical" gap={4}>
                      How many intervals between charges (e.g., 2 = every 2
                      months)
                    </Stack>
                    <NumberInput
                      data-1p-ignore
                      id={field.name}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      placeholder="1"
                      autoComplete="off"
                      label={'Interval Count'}

                      htmlName={field.name}
                      value={
                        field.state.value === undefined
                          ? null
                          : field.state.value
                      }
                      onChange={(value) => field.handleChange(value)}
                      min={1}
                      max={365}
                      step={1}
                      isIntegerOnly
                    />
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <form.Field
              name="startDate"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <label htmlFor={field.name}>Start Date</label>
                    <Stack direction="vertical" gap={4}>
                      When does this subscription start?
                    </Stack>
                    <Popover
                      label="Choose value"
                      alignment={'start'}
                      content={
                        <>
                          <FinanceCalendar
                            mode="single"
                            selected={field.state.value}
                            onSelect={(date) => {
                              if (date) {
                                field.handleChange(date)
                              }
                            }}
                            disabled={(date) => date < new Date('1900-01-01')}
                          />
                        </>
                      }
                    >
                      {(triggerProps) => (
                        <Button
                          {...triggerProps}
                          id={field.name}
                          name={field.name}
                          type="button"

                          label={String(
                            field.state.value.toLocaleDateString(
                              household.locale,
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              },
                            ),
                          )}
                          variant={'secondary'}
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
                      )}
                    </Popover>
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <form.Field
              name="currencyCode"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <SearchSelect
                      items={SUPPORTED_CURRENCIES.map((c) => c.code)}
                      value={field.state.value}
                      onChange={(value) => {
                        field.handleChange(value || '')
                      }}
                      id={field.name}
                      placeholder="Select a currency"
                      onBlur={field.handleBlur}
                      label={'Currency'}
                      renderOption={(item: string) => <span>{item}</span>}
                      emptyText={<>No items found.</>}
                    />
                    {isInvalid && (
                      <FormError errors={field.state.meta.errors} />
                    )}
                  </Stack>
                )
              }}
            />
            <form.Field
              name="cost"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Stack direction="vertical" gap={2} data-invalid={isInvalid}>
                    <Stack direction="vertical" gap={4}>
                      How much does this subscription cost per interval?
                    </Stack>
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
            form="new-subscription-form"
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
