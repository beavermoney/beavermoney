import { useState } from 'react'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useComposer } from '@/components/transaction-composer/context'
import { Grid } from '@astryxdesign/core/Grid'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
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
  const composer = useComposer()
  const [query, setQuery] = useState('')
  const matches = categories.filter((category) =>
    categoryData(category)
      .name.toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  )
  if (composer)
    return (
      <Stack gap={3} className="composer-category-picker">
        <Text type="label">
          {composer.compactCategories ? 'Transfer type' : 'Choose a category'}
        </Text>
        <TextInput
          label="Search categories"
          placeholder="Search categories"
          isLabelHidden
          value={query}
          onChange={setQuery}
        />
        <Stack className="composer-category-results">
          <Grid columns={3} gap={3}>
            {matches.map((category) => {
              const data = categoryData(category)
              const choose = () => {
                onValueChange(category.id)
                onBlur()
                composer.chooseCategory(data.name, category.type, data.icon)
              }
              return (
                <Button
                  key={category.id}
                  type="button"
                  width="100%"
                  size="lg"
                  className="composer-category"
                  label={data.name}
                  aria-pressed={value === category.id}
                  variant={value === category.id ? 'primary' : 'secondary'}
                  onClick={choose}
                >
                  <Stack gap={2} hAlign="center">
                    <CategoryIcon type={category.type} icon={data.icon} />
                    <Text type="label" color="inherit" maxLines={2}>
                      {data.name}
                    </Text>
                  </Stack>
                </Button>
              )
            })}
          </Grid>
          {matches.length === 0 && (
            <Text type="supporting">
              {categories.length
                ? 'No matching categories.'
                : 'No categories available.'}
            </Text>
          )}
        </Stack>
        {invalid && <Text role="alert">Choose a category.</Text>}
      </Stack>
    )
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
