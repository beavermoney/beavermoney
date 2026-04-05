import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeftRightIcon,
  BanknoteArrowDownIcon,
  BanknoteArrowUpIcon,
  TrendingUpIcon,
  WrenchIcon,
} from 'lucide-react'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { match } from 'ts-pattern'
import currency from 'currency.js'
import { useMemo } from 'react'
import type { TransactionCategoryType } from './__generated__/categoryCardFragment.graphql'
import { cn } from '@/lib/utils'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { useCurrency } from '@/hooks/use-currency'
import { useHousehold } from '@/hooks/use-household'
import { categoryCardCategoryFragment$key } from './__generated__/categoryCardCategoryFragment.graphql'
import { categoryCardFinancialReportFragment$key } from './__generated__/categoryCardFinancialReportFragment.graphql'
import { identity } from 'lodash-es'

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
  className,
}: CategoryCardProps) {
  const category = useFragment(categoryCardCategoryFragment, categoryRef)
  const financialReport = useFragment(
    categoryCardFinancialReportFragment,
    financialReportRef,
  )
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { household } = useHousehold()

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
    <Item
      className={cn(className)}
      render={
        <Link
          className="no-underline!"
          from="/household/$householdId/"
          to="/household/$householdId/categories/$categoryId"
          search={identity}
          activeOptions={{ exact: true }}
          params={{ categoryId: category.id }}
        >
          {({ isActive }) => (
            <>
              <ItemMedia variant="image" className="rounded-full">
                {getCategoryTypeIcon({
                  type: category.type,
                  icon: category.icon,
                })}
              </ItemMedia>
              <ItemContent className="gap-px">
                <ItemTitle className={cn(isActive && 'font-semibold')}>
                  {category.name}
                </ItemTitle>
              </ItemContent>
              {total && (
                <ItemContent className="items-end gap-px">
                  <ItemTitle className="tabular-nums">
                    <span className="font-semibold">
                      {formatCurrencyWithPrivacyMode({
                        value: currency(total),
                        currencyCode: household.currency.code,
                      })}
                    </span>
                  </ItemTitle>
                  {transactionCount !== undefined && (
                    <ItemDescription>
                      <span>
                        {transactionCount}{' '}
                        {transactionCount === 1
                          ? 'transaction'
                          : 'transactions'}
                      </span>
                    </ItemDescription>
                  )}
                </ItemContent>
              )}
            </>
          )}
        </Link>
      }
    ></Item>
  )
}

function getCategoryTypeIcon({
  type,
  icon,
}: {
  type: TransactionCategoryType
  icon: string | null | undefined
}) {
  // If custom icon is provided, use DynamicIcon
  if (icon) {
    return match(type)
      .with('income', () => (
        <DynamicIcon
          name={icon as unknown as IconName}
          className="size-10 bg-green-500/90 p-1.5 text-white"
        />
      ))
      .with('expense', () => (
        <DynamicIcon
          name={icon as unknown as IconName}
          className="size-10 bg-red-500/90 p-1.5 text-white"
        />
      ))
      .with('transfer', () => (
        <DynamicIcon
          name={icon as unknown as IconName}
          className="size-10 bg-orange-500/90 p-1.5 text-white"
        />
      ))
      .with('setup', () => (
        <DynamicIcon
          name={icon as unknown as IconName}
          className="size-10 bg-orange-500/90 p-1.5 text-white"
        />
      ))
      .with('investment', () => (
        <DynamicIcon
          name={icon as unknown as IconName}
          className="size-10 bg-blue-500/90 p-1.5 text-white"
        />
      ))
      .otherwise(() => null)
  }

  // Fallback to default icons
  return match(type)
    .with('income', () => (
      <BanknoteArrowUpIcon className="size-10 bg-green-500/90 p-1.5 text-white" />
    ))
    .with('expense', () => (
      <BanknoteArrowDownIcon className="size-10 bg-red-500/90 p-1.5 text-white" />
    ))
    .with('transfer', () => (
      <ArrowLeftRightIcon className="size-10 bg-orange-500/90 p-1.5 text-white" />
    ))
    .with('setup', () => (
      <WrenchIcon className="size-10 bg-orange-500/90 p-1.5 text-white" />
    ))
    .with('investment', () => (
      <TrendingUpIcon className="size-10 bg-blue-500/90 p-1.5 text-white" />
    ))
    .otherwise(() => null)
}
