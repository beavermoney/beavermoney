import { useLingui } from '@lingui/react/macro'
import { ResponsiveSelectionPicker } from '@/components/responsive-selection-picker'
import { ACCOUNT_CATEGORY_OPTIONS } from '@/constant'

const NONE_VALUE = '__none__'

type AccountCategoryPickerProps = {
  name: string
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  invalid: boolean
}

export function AccountCategoryPicker({
  name,
  value,
  onValueChange,
  onBlur,
  invalid,
}: AccountCategoryPickerProps) {
  const { t } = useLingui()
  const categoryOptions = [
    { value: NONE_VALUE, label: t`None (Taxable)` },
    ...ACCOUNT_CATEGORY_OPTIONS,
  ]

  return (
    <ResponsiveSelectionPicker
      items={categoryOptions}
      name={name}
      value={value || NONE_VALUE}
      label={t`Account category`}
      placeholder={t`None (Taxable)`}
      emptyMessage={t`No account categories available.`}
      getValue={(option) => option.value}
      getLabel={(option) => option.label}
      renderItem={(option) => <span>{option.label}</span>}
      onValueChange={(nextValue) =>
        onValueChange(nextValue === NONE_VALUE ? '' : nextValue)
      }
      onBlur={onBlur}
      invalid={invalid}
    />
  )
}
