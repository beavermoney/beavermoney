import { CategoryIcon } from '@/components/category-icon'
import { ResponsiveSelectionPicker } from '@/components/responsive-selection-picker'
import { HStack } from '@astryxdesign/core/Layout'
import { graphql } from 'react-relay'
import { readInlineData } from 'relay-runtime'
import type { transactionCategoryPickerFragment$key } from './__generated__/transactionCategoryPickerFragment.graphql'

const categoryFragment = graphql`
  fragment transactionCategoryPickerFragment on TransactionCategory @inline {
    name
    icon
  }
`

type TransactionCategoryPickerProps = {
  categories: ReadonlyArray<
    transactionCategoryPickerFragment$key & {
      id: string
      type: string
    }
  >
  name: string
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  invalid: boolean
}

export function TransactionCategoryPicker({
  categories,
  name,
  value,
  onValueChange,
  onBlur,
  invalid,
}: TransactionCategoryPickerProps) {
  return (
    <ResponsiveSelectionPicker
      items={categories}
      name={name}
      value={value}
      label="Category"
      placeholder="Select a category"
      emptyMessage="No categories available."
      getValue={(category) => category.id}
      getLabel={(category) => categoryData(category).name}
      renderItem={(category) => <CategoryDetails category={category} />}
      onValueChange={onValueChange}
      onBlur={onBlur}
      invalid={invalid}
    />
  )
}

function CategoryDetails({
  category,
}: {
  category: TransactionCategoryPickerProps['categories'][number]
}) {
  const data = categoryData(category)
  return (
    <HStack gap={2} vAlign="center">
      <CategoryIcon type={category.type} icon={data.icon} size="inline" />
      <span title={data.name}>{data.name}</span>
    </HStack>
  )
}

function categoryData(
  category: TransactionCategoryPickerProps['categories'][number],
) {
  return readInlineData<transactionCategoryPickerFragment$key>(
    categoryFragment,
    category,
  )
}
