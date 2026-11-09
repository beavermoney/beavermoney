import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
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

function getLocaleDisplayName(
  locale: string,
  currencyCode: string,
  displayLocale: string,
): string {
  const languageNames = new Intl.DisplayNames([displayLocale], {
    type: 'language',
  })
  const regionNames = new Intl.DisplayNames([displayLocale], { type: 'region' })
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
  const { t, i18n } = useLingui()
  const formSchema = z.object({
    name: z
      .string()
      .min(1, t`Household name is required.`)
      .max(64, t`Household name must be at most 64 characters.`),
    currencyCode: z.string().min(1, t`Currency is required.`),
    locale: z.string().min(1, t`Locale is required.`),
  })

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
      body: t`Welcome to ${name}! Your household is ready.`,
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
            <Trans>New to Beaver Money?</Trans>
            <br />
            <Text type="label">
              <Trans>Try it with sample data first.</Trans>
            </Text>
          </Text>
          <Button
            onClick={handleCreateDemo}

            label={String(isMutationInFlight ? t`Creating...` : t`Create demo`)}
            variant={'secondary'}

            isDisabled={isMutationInFlight}
          >
            {isMutationInFlight ? t`Creating...` : t`Create demo`}
          </Button>
        </Stack>

        {/* Main form card */}
        <Card>
          <Stack direction="vertical" gap={6}>
            <Stack direction="vertical" gap={2} as="header">
              <Stack direction="horizontal" align="center" justify="center">
                <AstryxIcon icon={HomeIcon} strokeWidth={2} />
              </Stack>
              <Heading level={2}>
                <Trans>Create Your Household</Trans>
              </Heading>
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
                            placeholder={t`My Family`}
                            autoComplete="off"
                            label={t`Household Name`}

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
                            <Trans>
                              Your household's primary currency for reporting
                            </Trans>
                          </Text>
                          <SearchSelect
                            items={SUPPORTED_CURRENCIES.map((c) => c.code)}
                            value={field.state.value}
                            onChange={(value) => {
                              field.handleChange(value || '')
                            }}
                            id={field.name}
                            placeholder={t`Select a currency`}
                            onBlur={field.handleBlur}
                            label={t`Currency`}
                            renderOption={(item: string) => <span>{item}</span>}
                            emptyText={
                              <>
                                <Trans>No currency found.</Trans>
                              </>
                            }
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
                            <Trans>Determines date and number formatting</Trans>
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
                              return getLocaleDisplayName(
                                item,
                                currencyCode,
                                i18n.locale,
                              )
                            }}
                            id={field.name}
                            placeholder={t`Select a locale`}
                            onBlur={field.handleBlur}
                            label={t`Locale`}
                            renderOption={(item: string) => (
                              <span>
                                {getLocaleDisplayName(
                                  item,
                                  currencyCode,
                                  i18n.locale,
                                )}
                              </span>
                            )}
                            emptyText={
                              <>
                                <Trans>No locale found.</Trans>
                              </>
                            }
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
                  isMutationInFlight ? t`Creating...` : t`Create Household`,
                )}
                variant={'primary'}

                isDisabled={isMutationInFlight}
              >
                {isMutationInFlight ? t`Creating...` : t`Create Household`}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Stack>
  )
}
