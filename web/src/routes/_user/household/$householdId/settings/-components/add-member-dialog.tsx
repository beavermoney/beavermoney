import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { FormError } from '@/components/form-error'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Selector } from '@astryxdesign/core/Selector'
import { Stack } from '@astryxdesign/core/Stack'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm } from '@tanstack/react-form'
import { UserPlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import { match } from 'ts-pattern'
import * as z from 'zod'

import type { addMemberDialogFragment$key } from './__generated__/addMemberDialogFragment.graphql'
import type { addMemberDialogMutation } from './__generated__/addMemberDialogMutation.graphql'

import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email.'),
  role: z.enum(['admin', 'member']),
  householdCurrencyID: z.string().min(1, 'Please select a currency.'),
})

const addMemberDialogFragment = graphql`
  fragment addMemberDialogFragment on Household {
    # eslint-disable-next-line relay/unused-fields
    id
    # eslint-disable-next-line relay/unused-fields
    userHouseholds {
      id
      user {
        id
      }
    }
    householdCurrencies {
      id
      code
    }
  }
`

const addMemberDialogMutation = graphql`
  mutation addMemberDialogMutation($input: AddHouseholdUserInput!) {
    addHouseholdUser(input: $input) {
      id
      role
      householdCurrency {
        id
        code
      }
      user {
        id
        name
        email
      }
    }
  }
`

function getErrorMessage(error: unknown): string {
  const msg = String(error)
  if (msg.includes('MEMBER_EMAIL_NOT_REGISTERED'))
    return "We couldn't find a user with that email. Ask them to sign in with Google at least once, then try again."
  if (msg.includes('MEMBER_ALREADY_EXISTS'))
    return 'That user is already a household member.'
  if (msg.includes('HOUSEHOLD_MAX_REAL_USERS_REACHED'))
    return 'A household can only have two members. Remove one before adding another.'
  if (msg.includes('HOUSEHOLD_HAS_SYNTHETIC_USER'))
    return 'This household is in an unexpected state. Refresh and try again.'
  if (msg.includes('MEMBER_MUTATION_LOCKED_ON_DEMO_HOUSEHOLD'))
    return 'Member changes are disabled on the demo household.'
  if (msg.includes('NOT_HOUSEHOLD_ADMIN'))
    return 'Only household admins can add members.'
  return 'Something went wrong. Please try again.'
}

type AddMemberDialogProps = {
  householdRef: addMemberDialogFragment$key
  trigger?: React.ReactNode
}

export function AddMemberDialog({
  householdRef,
  trigger,
}: AddMemberDialogProps) {
  const showToast = useToast()

  const data = useFragment(addMemberDialogFragment, householdRef)
  const { household } = useHousehold()

  const [open, setOpen] = useState(false)

  const [commit, isInFlight] = useMutation<addMemberDialogMutation>(
    addMemberDialogMutation,
  )

  const householdCurrencies = data.householdCurrencies ?? []
  const defaultCurrencyID = householdCurrencies[0]?.id ?? ''

  const form = useForm({
    defaultValues: {
      email: '',
      role: 'member' as 'admin' | 'member',
      householdCurrencyID: defaultCurrencyID,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const result = await commitMutationResult<addMemberDialogMutation>(
        commit,
        {
          variables: {
            input: {
              email: formData.email.trim().toLowerCase(),
              role: formData.role,
              householdCurrencyID: formData.householdCurrencyID,
            },
          },
          updater: (store) => {
            store.get(household.id)?.invalidateRecord()
          },
        },
      )

      match(result)
        .with({ status: 'success' }, () => {
          showToast({ type: 'info', body: 'Member added.' })
          form.reset()
          setOpen(false)
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: getErrorMessage(error) })
        })
        .exhaustive()
    },
  })

  return (
    <>
      <Button
        label="Add member"
        icon={<AstryxIcon icon={UserPlusIcon} />}
        onClick={() => setOpen(true)}
      >
        {trigger ?? 'Add member'}
      </Button>
      <Dialog
        isOpen={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) form.reset()
        }}
        purpose="info"
        padding={0}
      >
        <Layout
          padding={6}
          header={
            <DialogHeader
              title={<>Add household member</>}
              onOpenChange={(next) => {
                setOpen(next)
                if (!next) form.reset()
              }}
            />
          }
        >
          <LayoutContent>
            <Stack direction="vertical" gap={6} paddingBlockStart={4}>
              <Stack
                as="form"
                direction="vertical"
                gap={6}
                id="add-member-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
              >
                <FormLayout>
                  <form.Field
                    name="email"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Stack
                          direction="vertical"
                          gap={2}
                          data-invalid={isInvalid}
                        >
                          <TextInput
                            data-1p-ignore
                            id={field.name}
                            onBlur={field.handleBlur}
                            aria-invalid={isInvalid}
                            placeholder="user@example.com"
                            autoComplete="off"
                            label={'Email'}

                            value={String(field.state.value ?? '')}
                            onChange={(_value, event) =>
                              ((e) => field.handleChange(e.target.value))(event)
                            }
                            htmlName={field.name}
                            type={'email'}
                          />
                          {isInvalid && (
                            <FormError errors={field.state.meta.errors} />
                          )}
                        </Stack>
                      )
                    }}
                  />
                  <form.Field
                    name="role"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Stack
                          direction="vertical"
                          gap={2}
                          data-invalid={isInvalid}
                        >
                          <Selector
                            value={field.state.value}
                            onChange={(value) => {
                              if (value === 'admin' || value === 'member') {
                                field.handleChange(value)
                              }
                            }}
                            id={field.name}
                            aria-invalid={isInvalid}
                            label="Role"

                            options={[
                              ...[
                                { value: 'member', label: String('Member') },
                                { value: 'admin', label: String('Admin') },
                              ],
                            ]}
                          />
                          {isInvalid && (
                            <FormError errors={field.state.meta.errors} />
                          )}
                        </Stack>
                      )
                    }}
                  />
                  <form.Field
                    name="householdCurrencyID"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Stack
                          direction="vertical"
                          gap={2}
                          data-invalid={isInvalid}
                        >
                          <Selector
                            value={field.state.value}
                            onChange={(value) =>
                              field.handleChange(value ?? '')
                            }
                            id={field.name}
                            aria-invalid={isInvalid}
                            label="Display currency"

                            options={[
                              ...[
                                ...householdCurrencies.map((currency) => ({
                                  value: currency.id,
                                  label: String(currency.code),
                                })),
                              ],
                            ]}
                            placeholder={'Select currency'}
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
              <Stack
                direction="horizontal"
                gap={3}
                align="center"
                wrap="wrap"
                justify="end"
              >
                <Button
                  type="submit"
                  form="add-member-form"
                  label={String(isInFlight ? 'Adding...' : 'Add member')}
                  variant={'primary'}

                  isDisabled={isInFlight}
                >
                  {isInFlight ? 'Adding...' : 'Add member'}
                </Button>
                <Button
                  label="Cancel"
                  onClick={() =>
                    ((next) => {
                      setOpen(next)
                      if (!next) form.reset()
                    })(false)
                  }
                />
              </Stack>
            </Stack>
          </LayoutContent>
        </Layout>
      </Dialog>
    </>
  )
}
