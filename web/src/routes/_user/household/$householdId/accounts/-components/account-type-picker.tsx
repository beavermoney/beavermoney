import { useLingui } from '@lingui/react/macro'
import type { LucideIcon } from 'lucide-react'
import {
  ChartNoAxesCombinedIcon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
} from 'lucide-react'

import { ACCOUNT_TYPE_DESCRIPTION, ACCOUNT_TYPE_LIST } from '@/constant'
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList'

export type AccountType = (typeof ACCOUNT_TYPE_LIST)[number]

type AccountTypePickerProps = {
  value: string
  onValueChange: (value: AccountType) => void
  onBlur: () => void
  labelledBy: string
  describedBy?: string
  invalid?: boolean
}

function isAccountType(value: string | undefined): value is AccountType {
  return ACCOUNT_TYPE_LIST.some((type) => type === value)
}

export function AccountTypePicker({
  value,
  onValueChange,
  onBlur,
  labelledBy,
  describedBy,
  invalid = false,
}: AccountTypePickerProps) {
  const { t, i18n } = useLingui()
  const ACCOUNT_TYPE_PRESENTATION = {
    liquidity: {
      label: t`Liquidity`,
      icon: LandmarkIcon,
      iconClassName: 'text-chart-liquidity',
    },
    investment: {
      label: t`Investment`,
      icon: ChartNoAxesCombinedIcon,
      iconClassName: 'text-chart-investment',
    },
    receivable: {
      label: t`Receivable`,
      icon: HandCoinsIcon,
      iconClassName: 'text-chart-receivable',
    },
    liability: {
      label: t`Liability`,
      icon: CreditCardIcon,
      iconClassName: 'text-chart-liability',
    },
  } satisfies Record<
    AccountType,
    { label: string; icon: LucideIcon; iconClassName: string }
  >

  return (
    <RadioList
      label={t`Account type`}
      isLabelHidden
      value={value}
      onChange={(next) => {
        if (isAccountType(next)) onValueChange(next)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur()
      }}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      status={invalid ? { type: 'error' } : undefined}
    >
      {ACCOUNT_TYPE_LIST.map((type) => {
        const { label, icon: Icon } = ACCOUNT_TYPE_PRESENTATION[type]
        return (
          <RadioListItem
            key={type}
            value={type}
            label={label}
            description={i18n._(ACCOUNT_TYPE_DESCRIPTION[type])}
            startContent={<Icon />}
          />
        )
      })}
    </RadioList>
  )
}
