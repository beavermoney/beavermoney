import { fetchQuery, graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { useFragment } from 'react-relay'
import { capitalize, groupBy, map } from 'lodash-es'
import { Fragment } from 'react/jsx-runtime'
import { useMemo } from 'react'
import currency from 'currency.js'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { CategoryCard } from './category-card'
import type { categoriesPanelFragment$key } from './__generated__/categoriesPanelFragment.graphql'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion'
import { ItemGroup, ItemSeparator } from '@/components/ui/item'
import { useCurrency } from '@/hooks/use-currency'
import { cn } from '@/lib/utils'
import { useHousehold } from '@/hooks/use-household'
import { CATEGORY_TYPE_LIST } from '@/constant'
import { useNavigate } from '@tanstack/react-router'
import { DateRangeFilter } from './date-range-filter'
import { useSearch } from '@tanstack/react-router'
import { FinancialSummaryCards } from '@/components/financial-summary-cards'
import { parseISO } from 'date-fns'
import { CategoriesQuery } from '../__generated__/CategoriesQuery.graphql'
import { environment } from '@/environment'
import { categoriesQuery } from '../-categories-query'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { PlusButton } from '@/components/plus-button'

const CategoriesPanelFragment = graphql`
  fragment categoriesPanelFragment on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 50 }
    cursor: { type: "Cursor" }
    startDate: { type: "Time!" }
    endDate: { type: "Time!" }
  )
  @refetchable(queryName: "categoriesPanelRefetch") {
    transactionCategories(first: $count, after: $cursor)
      @connection(key: "categoriesPanel_transactionCategories") {
      edges {
        node {
          id
          type
          ...categoryCardCategoryFragment
        }
      }
    }
    household {
      financialReport(period: { startDate: $startDate, endDate: $endDate }) {
        incomeBreakdown {
          categoryType
          total
          transactionCount
        }
        expensesBreakdown {
          categoryType
          total
          transactionCount
        }
        ...categoryCardFinancialReportFragment
        ...financialSummaryCardsFragment
      }
    }
  }
`

type CategoriesListPageProps = {
  fragmentRef: categoriesPanelFragment$key
}

export function CategoriesPanel({ fragmentRef }: CategoriesListPageProps) {
  const search = useSearch({ from: '/_user/household/$householdId/categories' })
  const startDate = parseISO(search.start).toISOString()
  const endDate = parseISO(search.end).toISOString()
  const data = useFragment(CategoriesPanelFragment, fragmentRef)

  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const groupedCategories = useMemo(
    () =>
      groupBy(data.transactionCategories.edges, (edge) => {
        invariant(edge?.node, 'Category node is null')
        return edge.node.type
      }),
    [data.transactionCategories],
  )

  const { household } = useHousehold()

  const navigate = useNavigate()

  const financialReport = data.household.financialReport

  // Build map for category type aggregates
  const categoryTypeMap = useMemo(() => {
    const typeMap = new Map<string, { total: string; count: number }>()

    // Process income categories
    const incomeBreakdown = financialReport.incomeBreakdown
    typeMap.set(incomeBreakdown.categoryType, {
      total: incomeBreakdown.total,
      count: incomeBreakdown.transactionCount,
    })

    const expensesBreakdown = financialReport.expensesBreakdown
    typeMap.set(expensesBreakdown.categoryType, {
      total: expensesBreakdown.total,
      count: expensesBreakdown.transactionCount,
    })

    return typeMap
  }, [financialReport])

  const onDateRangeChange = async (start: string, end: string) => {
    const period = parseDateRangeFromURL(start, end)
    await fetchQuery<CategoriesQuery>(environment, categoriesQuery, {
      startDate: period.startDate,
      endDate: period.endDate,
    }).toPromise()

    // Now navigate - the route loader will read from Relay store cache
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        start,
        end,
      }),
    })
  }

  return (
    <Fragment>
      <div className="fixed right-4 bottom-4 lg:absolute">
        <PlusButton />
      </div>
      <FinancialSummaryCards fragmentRef={financialReport} />
      <div className="py-2"></div>
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
      />
      <div className="py-2"></div>
      <Accordion
        multiple
        className="w-full"
        defaultValue={[...CATEGORY_TYPE_LIST]}
      >
        {map(CATEGORY_TYPE_LIST, (type) => {
          if (type in groupedCategories === false) {
            return null
          }
          const categories = groupedCategories[type]
          const typeAggregate = categoryTypeMap.get(type)
          return (
            <AccordionItem value={type} key={type}>
              <AccordionTrigger className="cursor-pointer justify-normal gap-2 hover:no-underline **:data-[slot=accordion-trigger-icon]:ml-0">
                <span>{capitalize(type)}</span>
                <span className="grow"></span>
                {typeAggregate && (
                  <span className="mr-3 tabular-nums">
                    {formatCurrencyWithPrivacyMode({
                      value: currency(typeAggregate.total),
                      currencyCode: household.currency.code,
                    })}
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent className="pb-1">
                <ItemGroup className="gap-0">
                  {categories.map((category) => {
                    invariant(category?.node, 'Category node is null')
                    return (
                      <Fragment key={category.node.id}>
                        <ItemSeparator className="my-1" />
                        <CategoryCard
                          categoryRef={category.node}
                          financialReportRef={financialReport}
                        />
                      </Fragment>
                    )
                  })}
                </ItemGroup>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </Fragment>
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          '**:data-[slot=accordion-trigger-icon]:text-muted-foreground group/accordion-trigger flex flex-1 items-start justify-between gap-6 border border-transparent p-2 text-left text-xs/relaxed font-medium transition-all outline-none hover:underline disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4',
          className,
        )}
        {...props}
      >
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <HugeiconsIcon
          icon={ArrowUp01Icon}
          strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}
