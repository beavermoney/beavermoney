import { FormError } from '@/components/form-error'
import { SearchSelect } from '@/components/search-select'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { useForm, useStore } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { HomeIcon, SparklesIcon } from 'lucide-react'
import { useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import * as z from 'zod'

import { SUPPORTED_CURRENCIES, lookupCurrency } from '@/lib/currencies'
import { commitMutationResult } from '@/lib/relay'

import type { newHouseholdMutation } from './__generated__/newHouseholdMutation.graphql'

const newHouseholdMutation = graphql`
  mutation newHouseholdMutation($input: CreateHouseholdInputCustom!) {
    createHousehold(input: $input) {
      id
      name
    }
  }
`

export const Route = createFileRoute('/_user/household/new')({
  component: RouteComponent,
})

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Household name is required.')
    .max(64, 'Household name must be at most 64 characters.'),
  currencyCode: z.string().min(1, 'Currency is required.'),
  locale: z.string().min(1, 'Locale is required.'),
})

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

function getLocaleDisplayName(locale: string, currencyCode: string): string {
  const [, region] = locale.split('-')
  const languageName = languageNames.of(locale) ?? locale
  const regionName = region ? regionNames.of(region) : null
  const localeName = regionName
    ? `${languageName} (${regionName})`
    : languageName

  const currencyPreview = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(1234.56)

  return `${localeName} – ${currencyPreview}`
}

function RouteComponent() {
  return (
    <Stack direction="vertical" gap={4} align="center" justify="center">
      <NewHouseholdForm />
    </Stack>
  )
}

function NewHouseholdForm() {
  const showToast = useToast()

  const navigate = useNavigate()

  const [commitMutation, isMutationInFlight] =
    useMutation<newHouseholdMutation>(newHouseholdMutation)

  const handleSuccess = (id: string, name: string) => {
    navigate({
      to: '/household/$householdId',
      params: { householdId: id },
    })
    showToast({
      type: 'info',
      body: `Welcome to ${name}! Your household is ready.`,
    })
  }

  const handleCreateDemo = () => {
    commitMutationResult<newHouseholdMutation>(commitMutation, {
      variables: {
        input: {
          input: {
            name: 'Demo Household',
            locale: 'en-CA',
            isDemo: true,
          },
          currencyCode: 'CAD',
        },
      },
    }).then((result) => {
      match(result)
        .with({ status: 'success' }, ({ data: resultData }) => {
          invariant(
            resultData.createHousehold,
            'No data returned from mutation',
          )
          handleSuccess(
            resultData.createHousehold.id,
            resultData.createHousehold.name,
          )
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    })
  }

  const form = useForm({
    defaultValues: {
      name: '',
      currencyCode: '',
      locale: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = formSchema.parse(value)

      const result = await commitMutationResult<newHouseholdMutation>(
        commitMutation,
        {
          variables: {
            input: {
              input: {
                name: formData.name,
                locale: formData.locale,
                isDemo: false,
              },
              currencyCode: formData.currencyCode,
            },
          },
        },
      )

      match(result)
        .with({ status: 'success' }, ({ data: resultData }) => {
          invariant(
            resultData.createHousehold,
            'No data returned from mutation',
          )
          form.reset()
          handleSuccess(
            resultData.createHousehold.id,
            resultData.createHousehold.name,
          )
        })
        .with({ status: 'error' }, ({ error }) => {
          showToast({ type: 'error', body: error.toString() })
        })
        .exhaustive()
    },
  })

  const currencyCode = useStore(
    form.store,
    (state) => state.values.currencyCode,
  )
  const availableLocales = lookupCurrency(currencyCode)?.locales ?? []

  return (
    <Stack
      direction="vertical"
      gap={6}
      width="100%"
      className="app-safe-area app-scroll-content"
    >
      <Stack
        direction="vertical"
        gap={6}
        padding={6}
        width="100%"
        className="mx-auto max-w-2xl"
      >
        {/* Demo banner */}
        <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
          <Stack direction="horizontal" align="center" justify="center">
            <AstryxIcon icon={SparklesIcon} strokeWidth={2} />
          </Stack>
          <Text as="p" display="block" color="secondary">
            New to Beaver Money?
            <br />
            <Text type="label">Try it with sample data first.</Text>
          </Text>
          <Button
            onClick={handleCreateDemo}

            label={String(isMutationInFlight ? 'Creating...' : 'Create demo')}
            variant={'secondary'}

            isDisabled={isMutationInFlight}
          >
            {isMutationInFlight ? 'Creating...' : 'Create demo'}
          </Button>
        </Stack>

        {/* Main form card */}
        <Card>
          <Stack direction="vertical" gap={6}>
            <Stack direction="vertical" gap={2} as="header">
              <Stack direction="horizontal" align="center" justify="center">
                <AstryxIcon icon={HomeIcon} strokeWidth={2} />
              </Stack>
              <Heading level={2}>Create Your Household</Heading>
            </Stack>
            <Stack direction="vertical" gap={4}>
              <Stack
                as="form"
                direction="vertical"
                gap={6}
                id="new-household-form"
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
                            placeholder="My Family"
                            autoComplete="off"
                            label={'Household Name'}

                            value={String(field.state.value ?? '')}
                            onChange={(_value, event) =>
                              ((e) => field.handleChange(e.target.value))(event)
                            }
                            htmlName={field.name}
                            hasAutoFocus={true}
                          />
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
                        <Stack
                          direction="vertical"
                          gap={2}
                          data-invalid={isInvalid}
                        >
                          <Text type="supporting" color="secondary">
                            Your household's primary currency for reporting
                          </Text>
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
                            emptyText={<>No currency found.</>}
                          />
                          {isInvalid && (
                            <FormError errors={field.state.meta.errors} />
                          )}
                        </Stack>
                      )
                    }}
                  />
                  <form.Field
                    name="locale"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Stack
                          direction="vertical"
                          gap={2}
                          data-invalid={isInvalid}
                        >
                          <Text type="supporting" color="secondary">
                            Determines date and number formatting
                          </Text>
                          <SearchSelect
                            key={currencyCode}
                            items={availableLocales}
                            value={field.state.value}
                            onChange={(value: string | null) => {
                              field.handleChange(value ?? '')
                            }}
                            getLabel={(item: string | null) => {
                              if (!item || !currencyCode) return ''
                              return getLocaleDisplayName(item, currencyCode)
                            }}
                            id={field.name}
                            placeholder="Select a locale"
                            onBlur={field.handleBlur}
                            label={'Locale'}
                            renderOption={(item: string) => (
                              <span>
                                {getLocaleDisplayName(item, currencyCode)}
                              </span>
                            )}
                            emptyText={<>No locale found.</>}
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
              <Button
                type="submit"
                form="new-household-form"

                label={String(
                  isMutationInFlight ? 'Creating...' : 'Create Household',
                )}
                variant={'primary'}

                isDisabled={isMutationInFlight}
              >
                {isMutationInFlight ? 'Creating...' : 'Create Household'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Stack>
  )
}
