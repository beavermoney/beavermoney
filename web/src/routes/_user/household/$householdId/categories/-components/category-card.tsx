import { CategoryIcon } from '@/components/category-icon'
import { RouterListItem } from '@/components/router-list-item'
import { Text } from '@astryxdesign/core/Text'
import { useMemo } from 'react'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'

import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'

import { identity } from 'lodash-es'
import { categoryCardCategoryFragment$key } from './__generated__/categoryCardCategoryFragment.graphql'
import { categoryCardFinancialReportFragment$key } from './__generated__/categoryCardFinancialReportFragment.graphql'

const categoryCardCategoryFragment = graphql`
  fragment categoryCardCategoryFragment on TransactionCategory {
    id
    name
    type
    icon
  }
`

const categoryCardFinancialReportFragment = graphql`
  fragment categoryCardFinancialReportFragment on FinancialReport {
    incomeBreakdown {
      categories {
        category {
          id
        }
        total
        transactionCount
      }
    }
    expensesBreakdown {
      categories {
        category {
          id
        }
        total
        transactionCount
      }
    }
  }
`

type CategoryCardProps = {
  categoryRef: categoryCardCategoryFragment$key
  financialReportRef: categoryCardFinancialReportFragment$key
  className?: string
}

export function CategoryCard({
  categoryRef,
  financialReportRef,
  className: _className,
}: CategoryCardProps) {
  const category = useFragment(categoryCardCategoryFragment, categoryRef)
  const financialReport = useFragment(
    categoryCardFinancialReportFragment,
    financialReportRef,
  )
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { displayCurrencyCode } = useDisplayCurrency()

  // Look up this category's aggregate data
  const { total, transactionCount } = useMemo(() => {
    const categoryAgg = [
      financialReport.incomeBreakdown,
      financialReport.expensesBreakdown,
    ]
      .flatMap((typeAgg) => typeAgg.categories)
      .find((c) => c.category.id === category.id)

    return categoryAgg
      ? {
          total: categoryAgg.total,
          transactionCount: categoryAgg.transactionCount,
        }
      : { total: undefined, transactionCount: undefined }
  }, [financialReport, category.id])

  return (
    <RouterListItem
      from="/household/$householdId"
      to="/household/$householdId/categories/$categoryId"
      params={{ categoryId: category.id }}
      search={identity}
      label={category.name}
      startContent={<CategoryIcon type={category.type} icon={category.icon} />}
      description={
        transactionCount
          ? `${transactionCount} transaction${transactionCount === 1 ? '' : 's'}`
          : 'No transactions this period'
      }
      endContent={
        <Text hasTabularNumbers>
          {total
            ? formatCurrencyWithPrivacyMode({
                value: total,
                currencyCode: displayCurrencyCode,
              })
            : '—'}
        </Text>
      }
    />
  )
}
