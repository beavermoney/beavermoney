import { FinanceCalendar } from '@/components/finance-calendar'
import { FormError } from '@/components/form-error'
import { SearchSelect } from '@/components/search-select'
import { Avatar } from '@astryxdesign/core/Avatar'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Heading } from '@astryxdesign/core/Heading'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Popover } from '@astryxdesign/core/Popover'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { graphql } from 'relay-runtime'

import { useToast } from '@astryxdesign/core/Toast'
import { useForm, useStore } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { capitalize } from 'lodash-es'
import { useFragment, useMutation } from 'react-relay'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'
import type { editSubscriptionDeleteMutation } from './__generated__/editSubscriptionDeleteMutation.graphql'
import type { editSubscriptionFragment$key } from './__generated__/editSubscriptionFragment.graphql'
import type { editSubscriptionMutation } from './__generated__/editSubscriptionMutation.graphql'

import { useHousehold } from '@/hooks/use-household'

import { CurrencyInput } from '@/components/currency-input'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { SUPPORTED_CURRENCIES } from '@/lib/currencies'
import { getLogoDomainURL } from '@/lib/logo'
import { commitMutationResult, NodeType, useDeleteNode } from '@/lib/relay'
import { useState } from 'react'

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

const editSubscriptionFragment = graphql`
  fragment editSubscriptionFragment on RecurringSubscription {
    id
    name
    icon
    interval
    intervalCount
    startDate
    cost
    householdCurrency {
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

const editSubscriptionDeleteMutation = graphql`
  mutation editSubscriptionDeleteMutation($id: ID!, $connections: [ID!]!) {
    deleteRecurringSubscription(id: $id) {
      deletedRecurringSubscriptionId @deleteEdge(connections: $connections)
    }
  }
`

type EditSubscriptionProps = {
  fragmentRef: editSubscriptionFragment$key
}

export function EditSubscription({ fragmentRef }: EditSubscriptionProps) {
  const showToast = useToast()

  const data = useFragment(editSubscriptionFragment, fragmentRef)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const navigate = useNavigate()

  const [commitUpdateMutation, isUpdateMutationInFlight] =
    useMutation<editSubscriptionMutation>(editSubscriptionMutation)

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<editSubscriptionDeleteMutation>(editSubscriptionDeleteMutation)

  const deleteNode = useDeleteNode(NodeType.RecurringSubscription)

  const { displayCurrencyCode } = useDisplayCurrency()

  const { household } = useHousehold()

  const form = useForm({
    defaultValues: {
      name: data.name,
      icon: data.icon || '',
      interval: data.interval as '' | 'week' | 'month' | 'year',
      intervalCount: data.intervalCount,
      startDate: new Date(data.startDate),
      cost: data.cost,
      currencyCode: data.householdCurrency.code,
      active: data.active,
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
              householdCurrencyID: currencyID,
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

          showToast({
            type: 'info',
            body: `${resultData.updateRecurringSubscription.node.name} updated!`,
          })
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  const handleDelete = async () => {
    const result = await deleteNode((connections) =>
      commitMutationResult<editSubscriptionDeleteMutation>(
        commitDeleteMutation,
        {
          variables: {
            id: data.id,
            connections,
          },
        },
      ),
    )

    match(result)
      .with({ status: 'success' }, () => {
        navigate({
          from: '/household/$householdId/subscriptions/$subscriptionId',
          to: '/household/$householdId/subscriptions',
          search: (prev) => ({ ...prev }),
        })
        showToast({ type: 'info', body: 'Subscription deleted!' })
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: error.toString() })
      })
      .exhaustive()
  }

  const currencyCode = useStore(form.store, (state) => {
    return state.values.currencyCode ?? displayCurrencyCode
  })

  return (
    <Card>
      <Stack direction="vertical" gap={2} as="header">
        <Heading level={2}>Edit Subscription</Heading>
        <Stack direction="vertical" gap={4}>
          Update your subscription details
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <Stack
          as="form"
          direction="vertical"
          gap={6}
          id="edit-subscription-form"
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
          <>
            <Button
              onClick={() => setDeleteAlertOpen(true)}
              type="button"
              label={'Delete'}
              variant={'destructive'}

              isDisabled={isDeleteMutationInFlight || isUpdateMutationInFlight}
            >
              Delete
            </Button>
            <Dialog
              isOpen={deleteAlertOpen}
              onOpenChange={setDeleteAlertOpen}
              purpose="form"
              role="alertdialog"
            >
              <DialogHeader
                title={<>Delete Recurring Subscription</>}
                onOpenChange={setDeleteAlertOpen}
              />
              <Text as="div" display="block" type="supporting">
                This action cannot be undone. This will permanently delete the
                recurring subscription.
              </Text>
              <Stack
                direction="horizontal"
                gap={3}
                align="center"
                wrap="wrap"
                justify="end"
              >
                <Button
                  label="Cancel"
                  onClick={() => setDeleteAlertOpen(false)}
                />
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  isDisabled={isDeleteMutationInFlight}
                  label="Delete"
                >
                  {isDeleteMutationInFlight ? 'Deleting...' : 'Delete'}
                </Button>
              </Stack>
            </Dialog>
          </>
          <Button
            type="submit"
            form="edit-subscription-form"
            label={String(isUpdateMutationInFlight ? 'Saving...' : 'Save')}
            variant={'primary'}

            isDisabled={isUpdateMutationInFlight}
          >
            {isUpdateMutationInFlight ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}
