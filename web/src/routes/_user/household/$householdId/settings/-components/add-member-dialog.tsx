import { graphql } from 'relay-runtime'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useFragment, useMutation } from 'react-relay'
import { match } from 'ts-pattern'
import { useState } from 'react'
import { UserPlusIcon } from 'lucide-react'

import type { addMemberDialogFragment$key } from './__generated__/addMemberDialogFragment.graphql'
import type { addMemberDialogMutation } from './__generated__/addMemberDialogMutation.graphql'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
          toast.success('Member added.')
          form.reset()
          setOpen(false)
        })
        .with({ status: 'error' }, ({ error }) => {
          toast.error(getErrorMessage(error))
        })
        .exhaustive()
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger
        render={
          (trigger ?? (
            <Button variant="outline" size="sm">
              <UserPlusIcon />
              Add member
            </Button>
          )) as React.ReactElement
        }
      />
      <DialogContent className="gap-3">
        <DialogHeader>
          <DialogTitle>Add household member</DialogTitle>
        </DialogHeader>
        <form
          id="add-member-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="user@example.com"
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
              name="role"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        if (value === 'admin' || value === 'member') {
                          field.handleChange(value)
                        }
                      }}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full"
                        aria-invalid={isInvalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="householdCurrencyID"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Display currency
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full"
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {householdCurrencies.map((currency) => (
                            <SelectItem key={currency.id} value={currency.id}>
                              {currency.code}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
        <DialogFooter showCloseButton>
          <Button type="submit" form="add-member-form" disabled={isInFlight}>
            {isInFlight ? 'Adding...' : 'Add member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
