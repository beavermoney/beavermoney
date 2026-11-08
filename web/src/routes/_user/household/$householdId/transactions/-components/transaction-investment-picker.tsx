import { Avatar } from '@astryxdesign/core/Avatar'
import { Button } from '@astryxdesign/core/Button'
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@astryxdesign/core/DropdownMenu'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { HStack } from '@astryxdesign/core/Layout'
import { ScrollableArea } from '@astryxdesign/core/ScrollableArea'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useIsMobile } from '@/hooks/use-mobile'
import { getLogoCryptoURL, getLogoTickerURL } from '@/lib/logo'
import { newestActivityFirst } from '@/lib/sort-by-update-time'
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList'
import { graphql } from 'react-relay'
import { readInlineData } from 'relay-runtime'
import type { transactionInvestmentPickerFragment$key } from './__generated__/transactionInvestmentPickerFragment.graphql'

const investmentFragment = graphql`
  fragment transactionInvestmentPickerFragment on Investment @inline {
    name
    symbol
    type
    latestTransaction {
      datetime
    }
  }
`

type Investment = transactionInvestmentPickerFragment$key & {
  id: string
  accountName?: string
}

type Props = {
  investments: ReadonlyArray<Investment>
  name: string
  label: string
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  invalid: boolean
  disabled?: boolean
  disabledMessage?: string
}

export function TransactionInvestmentPicker({
  investments,
  name,
  label,
  value,
  onValueChange,
  onBlur,
  invalid,
  disabled = false,
  disabledMessage = 'Select an account first',
}: Props) {
  const isMobile = useIsMobile()
  const [editing, setEditing] = useState(false)
  const expanded = !value || editing
  const summaryRef = useRef<HTMLButtonElement>(null)
  const wasExpanded = useRef(expanded)
  const orderedInvestments = newestActivityFirst(
    investments.map((investment) => {
      const latestTransaction = investmentData(investment).latestTransaction
      return {
        investment,
        latestTransaction: latestTransaction
          ? { datetime: latestTransaction.datetime }
          : latestTransaction,
      }
    }),
  ).map(({ investment }) => investment)
  const selected = orderedInvestments.find(
    (investment) => investment.id === value,
  )
  const selectionAvailable = !value || selected !== undefined

  useEffect(() => {
    if (isMobile && wasExpanded.current && !expanded) {
      summaryRef.current?.focus({ preventScroll: true })
    }
    wasExpanded.current = expanded
  }, [expanded, isMobile])

  useEffect(() => {
    if (!selectionAvailable) onValueChange('')
  }, [onValueChange, selectionAvailable])

  if (!isMobile) {
    return (
      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) onBlur()
        }}
        alignment={'start'}
        renderTrigger={(triggerProps) => (
          <Button
            {...triggerProps}
            id={name}
            name={name}
            type="button"
            aria-invalid={invalid}

            label={`${label}: ${selected ? `${investmentData(selected).name}, ${investmentData(selected).symbol}` : disabled ? disabledMessage : 'Select an investment'}`}
            variant={'secondary'}

            isDisabled={disabled}
            endContent={
              <AstryxIcon icon={ChevronDownIcon} data-icon="inline-end" />
            }
          >
            {selected ? (
              <span>
                <InvestmentDetails investment={selected} />
              </span>
            ) : (
              <span>{disabled ? disabledMessage : 'Select an investment'}</span>
            )}
          </Button>
        )}
      >
        <ScrollableArea label="Scrollable content">
          <Stack direction="vertical" gap={4}>
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                value={value}
                onChange={(nextValue) => {
                  if (typeof nextValue === 'string') onValueChange(nextValue)
                }}
                label="Options"
                hasCloseOnSelect
              >
                {orderedInvestments.map((investment) => (
                  <DropdownMenuRadioItem
                    key={investment.id}
                    value={investment.id}
                    aria-label={`${investmentData(investment).name}, ${investmentData(investment).symbol}`}

                    label={
                      <>
                        <InvestmentDetails investment={investment} />
                      </>
                    }
                  />
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </Stack>
        </ScrollableArea>
      </DropdownMenu>
    )
  }

  if (!expanded && selected) {
    return (
      <Button
        ref={summaryRef}
        type="button"
        id={name}
        aria-expanded={false}
        label={`${label}: ${investmentData(selected).name}`}
        variant="secondary"
        width="100%"
        icon={<AstryxIcon icon={ChevronDownIcon} />}
        onClick={() => setEditing(true)}
      />
    )
  }

  return (
    <fieldset
      id={name}
      disabled={disabled}
      aria-invalid={invalid}

      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur()
      }}
    >
      <legend>{label}</legend>
      {disabled || investments.length === 0 ? (
        <Text as="p" display="block" color="secondary">
          {disabled ? disabledMessage : 'No matching investments available.'}
        </Text>
      ) : (
        <RadioList
          label={label}
          htmlName={name}
          value={value}
          status={invalid ? { type: 'error' } : undefined}
          onChange={(next) => {
            onValueChange(next)
            setEditing(false)
          }}
        >
          {orderedInvestments.map((investment) => (
            <RadioListItem
              key={investment.id}
              value={investment.id}
              label={investmentData(investment).name}
              description={`${investmentData(investment).symbol}${investment.accountName ? ` · ${investment.accountName}` : ''}`}
              onClick={() => {
                if (value === investment.id) setEditing(false)
              }}
            />
          ))}
        </RadioList>
      )}
    </fieldset>
  )
}

function InvestmentDetails({ investment }: { investment: Investment }) {
  const data = investmentData(investment)
  return (
    <HStack gap={2} vAlign="center">
      <Avatar
        src={
          data.type === 'crypto'
            ? getLogoCryptoURL(data.symbol)
            : getLogoTickerURL(data.symbol)
        }
        alt=""
        name={String('')}
      />
      <span>
        <Text maxLines={1}>{data.name}</Text>
        <Text type="supporting" maxLines={1}>
          {data.symbol}
          {investment.accountName ? ` · ${investment.accountName}` : ''}
        </Text>
      </span>
    </HStack>
  )
}

function investmentData(investment: Investment) {
  return readInlineData<transactionInvestmentPickerFragment$key>(
    investmentFragment,
    investment,
  )
}
