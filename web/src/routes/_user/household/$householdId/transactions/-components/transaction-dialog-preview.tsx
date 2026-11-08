import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Avatar } from '@astryxdesign/core/Avatar'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { DialogHeader } from '@astryxdesign/core/Dialog'
import { Divider } from '@astryxdesign/core/Divider'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import currency from 'currency.js'
import { format } from 'date-fns'
import { Fragment } from 'react'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'

import { CategoryIcon } from '@/components/category-icon'

import { useCurrency } from '@/hooks/use-currency'
import { useHousehold } from '@/hooks/use-household'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import type { transactionDialogPreviewFragment$key } from './__generated__/transactionDialogPreviewFragment.graphql'

const transactionDialogPreviewFragment = graphql`
  fragment transactionDialogPreviewFragment on Transaction {
    datetime
    excludeFromReports
    category {
      icon
      name
      type
    }
    transactionEntries {
      id
      amount
      account {
        name
        householdCurrency {
          code
        }
      }
    }
    investmentLots {
      id
      amount
      price
      investment {
        name
        symbol
        householdCurrency {
          code
        }
      }
    }
  }
`

type TransactionDialogPreviewProps = {
  fragmentRef: transactionDialogPreviewFragment$key | null
  onClose?: () => void
}

export function TransactionDialogPreview({
  fragmentRef,
  onClose,
}: TransactionDialogPreviewProps) {
  const transaction = useFragment(transactionDialogPreviewFragment, fragmentRef)
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { household } = useHousehold()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const quantityFormatter = new Intl.NumberFormat(household.locale, {
    maximumFractionDigits: 8,
    signDisplay: 'exceptZero',
  })
  const date = transaction
    ? format(new Date(transaction.datetime), 'LLL d')
    : ''
  const previewItems = transaction
    ? [
        ...(transaction.transactionEntries ?? []).map((entry) => ({
          type: 'entry' as const,
          id: entry.id,
          entry,
        })),
        ...(transaction.investmentLots ?? []).map((lot) => ({
          type: 'lot' as const,
          id: lot.id,
          lot,
        })),
      ]
    : []

  return (
    <Layout
      padding={6}
      header={
        <DialogHeader
          title="Edit Transaction"
          onOpenChange={onClose ? () => onClose() : undefined}
        />
      }
    >
      <LayoutContent>
        <Stack direction="vertical" gap={6} paddingBlockStart={4}>
          <Text as="div" display="block" type="supporting">
            Update transaction details. Click on entries or lots below to edit
            them individually.
          </Text>

          <Stack direction="vertical" gap={2}>
            {transaction
              ? previewItems.map((item, index) => (
                  <Fragment key={item.id}>
                    {index !== 0 && <Divider />}
                    {item.type === 'entry' ? (
                      <Stack
                        direction="horizontal"
                        gap={3}
                        align="center"
                        wrap="wrap"
                      >
                        <Stack direction="vertical" gap={4}>
                          <CategoryIcon
                            type={transaction.category.type}
                            icon={transaction.category.icon}
                          />
                        </Stack>
                        <Stack direction="vertical" gap={4}>
                          <Stack direction="vertical" gap={4}>
                            <span>{transaction.category.name}</span>
                            {transaction.excludeFromReports && (
                              <Badge label={<>Excluded</>} />
                            )}
                          </Stack>
                          <Stack direction="vertical" gap={4}>
                            {item.entry.account.name}
                          </Stack>
                        </Stack>
                        <Stack direction="vertical" gap={4}>
                          <Stack direction="vertical" gap={4}>
                            <Text type="label" hasTabularNumbers>
                              {formatCurrencyWithPrivacyMode({
                                value: item.entry.amount,
                                currencyCode:
                                  item.entry.account.householdCurrency.code,
                              })}
                            </Text>
                          </Stack>
                          <Stack direction="vertical" gap={4}>
                            {date}
                          </Stack>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack
                        direction="horizontal"
                        gap={3}
                        align="center"
                        wrap="wrap"
                      >
                        <Stack direction="vertical" gap={4}>
                          <Avatar name={String(item.lot.investment.symbol)} />
                        </Stack>
                        <Stack direction="vertical" gap={4}>
                          <Stack direction="vertical" gap={4}>
                            {transaction.category.name}
                          </Stack>
                          <Stack direction="vertical" gap={4}>
                            {isPrivacyModeEnabled
                              ? '•••••••'
                              : quantityFormatter.format(
                                  Number(item.lot.amount),
                                )}{' '}
                            {item.lot.investment.name}@{' '}
                            {formatCurrencyWithPrivacyMode({
                              value: item.lot.price,
                              currencyCode:
                                item.lot.investment.householdCurrency.code,
                            })}
                          </Stack>
                        </Stack>
                        <Stack direction="vertical" gap={4}>
                          <Stack direction="vertical" gap={4}>
                            <Text type="label" hasTabularNumbers>
                              {formatCurrencyWithPrivacyMode({
                                value: currency(item.lot.price, {
                                  precision: 8,
                                }).multiply(
                                  currency(item.lot.amount, { precision: 8 }),
                                ),
                                currencyCode:
                                  item.lot.investment.householdCurrency.code,
                              })}
                            </Text>
                          </Stack>
                          <Stack direction="vertical" gap={4}>
                            {date}
                          </Stack>
                        </Stack>
                      </Stack>
                    )}
                  </Fragment>
                ))
              : [0, 1].map((row) => (
                  <Fragment key={row}>
                    {row !== 0 && <Divider />}
                    <Stack
                      direction="horizontal"
                      gap={3}
                      align="center"
                      wrap="wrap"
                      aria-hidden="true"
                    >
                      <Stack direction="vertical" gap={4}>
                        <Skeleton height={24} />
                      </Stack>
                      <Stack direction="vertical" gap={4}>
                        <Skeleton height={24} />
                        <Skeleton height={24} />
                      </Stack>
                      <Stack direction="vertical" gap={4}>
                        <Skeleton height={24} />
                        <Skeleton height={24} />
                      </Stack>
                    </Stack>
                  </Fragment>
                ))}
          </Stack>

          <Stack direction="vertical" gap={4}>
            <Stack direction="vertical" gap={4} aria-hidden="true">
              <Stack direction="vertical" gap={4}>
                <PreviewField label="Description" />
                <PreviewField label="Date" />
                <PreviewField label="Category" />
                <fieldset data-slot="transaction-dialog-preview-field">
                  <legend className="mb-2">
                    <Text type="label">Options</Text>
                  </legend>
                  <Stack
                    direction="vertical"
                    gap={4}
                    data-slot="checkbox-group"
                  >
                    <Stack direction="vertical" gap={2}>
                      <PreviewButton label="Exclude from reports" />
                    </Stack>
                  </Stack>
                </fieldset>
              </Stack>
            </Stack>
          </Stack>

          <Stack
            direction="horizontal"
            gap={3}
            align="center"
            wrap="wrap"
            justify="end"
            aria-hidden="true"
          >
            <PreviewButton label="Delete" variant="destructive" />
            <PreviewButton label="Save Changes" />
          </Stack>

          <span className="sr-only" role="status">
            Loading transaction editing controls
          </span>
        </Stack>
      </LayoutContent>
    </Layout>
  )
}

function PreviewField({ label }: { label: string }) {
  return (
    <Stack
      direction="vertical"
      gap={2}
      data-slot="transaction-dialog-preview-field"
    >
      <label>{label}</label>
      <Skeleton height={24} />
    </Stack>
  )
}

function PreviewButton({
  label,
  variant = 'primary',
}: {
  label: string
  variant?: 'primary' | 'destructive'
}) {
  return (
    <Button
      type="button"

      tabIndex={-1}
      label={label}
      variant={variant}

      isDisabled={true}
    >
      {label}
    </Button>
  )
}
