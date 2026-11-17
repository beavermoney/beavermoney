import { useLingui } from '@lingui/react/macro'
import { CheckboxList, CheckboxListItem } from '@astryxdesign/core/CheckboxList'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { createContext, useContext, type ReactNode } from 'react'

const OptionsGroupContext = createContext(false)

export function TransactionOptions({ children }: { children: ReactNode }) {
  const { t } = useLingui()
  return (
    <OptionsGroupContext value={true}>
      <CheckboxList label={t`Options`} density="compact">
        {children}
      </CheckboxList>
    </OptionsGroupContext>
  )
}

export function TransactionOption({
  option,
  value,
  onChange,
  onBlur,
  id,
}: {
  option: 'pending' | 'exclude'
  value: boolean
  onChange: (value: boolean) => void
  onBlur?: () => void
  id?: string
}) {
  const { t } = useLingui()
  const grouped = useContext(OptionsGroupContext)
  const label = option === 'pending' ? t`Pending` : t`Exclude from reports`
  const description =
    option === 'pending'
      ? t`Flag for later review. Included in balances and reports.`
      : t`Hide from reports. Still included in account balances.`

  if (grouped) {
    return (
      <CheckboxListItem
        label={label}
        description={description}
        isChecked={value}
        onCheck={onChange}
        onBlur={onBlur}
      />
    )
  }

  return (
    <CheckboxInput
      id={id}
      label={label}
      description={description}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
  )
}
