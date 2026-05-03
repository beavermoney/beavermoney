import { fetchQuery, graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { useFragment, useRelayEnvironment } from 'react-relay'
import { capitalize, groupBy, map } from 'lodash-es'
import { Fragment } from 'react/jsx-runtime'
import { useMemo } from 'react'
import currency from 'currency.js'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { CategoryCard } from './category-card'
import type { categoriesPanelFragment$key } from './__generated__/categoriesPanelFragment.graphql'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion'

import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { useUser } from '@/hooks/use-user'
import { cn } from '@/lib/utils'
import { useHousehold } from '@/hooks/use-household'
import { CATEGORY_TYPE_LIST } from '@/constant'
import { useNavigate, useParams } from '@tanstack/react-router'
import { DateRangeFilter } from './date-range-filter'
import { CategoriesSankey } from './categories-sankey'
import { useSearch } from '@tanstack/react-router'
import { FinancialSummaryCards } from '@/components/financial-summary-cards'
import { parseISO } from 'date-fns'
import type { categoriesPanelRefetch } from './__generated__/categoriesPanelRefetch.graphql'
import categoriesPanelRefetchNode from './__generated__/categoriesPanelRefetch.graphql'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { PlusButton } from '@/components/plus-button'
import { NodeType, useRegisterConnection } from '@/lib/relay'

const CategoriesPanelFragment = graphql`
  fragment categoriesPanelFragment on Household
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 50 }
    cursor: { type: "Cursor" }
    startDate: { type: "Time!" }
    endDate: { type: "Time!" }
    viewUserId: { type: "ID", defaultValue: null }
  )
  @refetchable(queryName: "categoriesPanelRefetch") {
    transactionCategories(first: $count, after: $cursor)
      @connection(key: "categoriesPanel_transactionCategories") {
      __id
      edges {
        node {
          id
          type
          ...categoryCardCategoryFragment
        }
      }
    }
    financialReport(
      period: { startDate: $startDate, endDate: $endDate }
      viewUserID: $viewUserId
    ) {
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
      ...categoriesSankeyFragment
    }
  }
`

type CategoriesListPageProps = {
  fragmentRef: categoriesPanelFragment$key
}

export function CategoriesPanel({ fragmentRef }: CategoriesListPageProps) {
  const search = useSearch({
    from: '/_user/household/$householdId/{-$viewUserId}/categories',
  })
  const startDate = parseISO(search.start).toISOString()
  const endDate = parseISO(search.end).toISOString()
  const data = useFragment(CategoriesPanelFragment, fragmentRef)
  const { household } = useHousehold()
  const { displayCurrencyCode } = useDisplayCurrency()
  const environment = useRelayEnvironment()
  const { householdId } = useParams({
    from: '/_user/household/$householdId/{-$viewUserId}',
  })
  const { viewUserId } = useHouseholdViewScope()
  const { user } = useUser()
  const isViewingOtherUser = viewUserId !== null && viewUserId !== user.id

  useRegisterConnection(
    data.transactionCategories.__id,
    NodeType.TransactionCategory,
  )

  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const groupedCategories = useMemo(
    () =>
      groupBy(data.transactionCategories.edges, (edge) => {
        invariant(edge?.node, 'Category node is null')
        return edge.node.type
      }),
    [data.transactionCategories],
  )

  const navigate = useNavigate()

  const financialReport = data.financialReport

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

    await fetchQuery<categoriesPanelRefetch>(
      environment,
      categoriesPanelRefetchNode,
      {
        id: household.id,
        startDate: period.startDate,
        endDate: period.endDate,
        viewUserId,
      },
    ).toPromise()

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
      {!isViewingOtherUser && (
        <div className="fixed right-4 bottom-4 lg:absolute">
          <PlusButton
            to="/household/$householdId/{-$viewUserId}/categories/new"
            params={{ householdId }}
          />
        </div>
      )}
      <FinancialSummaryCards fragmentRef={financialReport} />
      <div className="py-2"></div>
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
      />
      <div className="py-2"></div>
      <CategoriesSankey fragmentRef={financialReport} />
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
            <AccordionItem
              value={type}
              key={type}
              className="data-open:bg-transparent"
            >
              <AccordionTrigger className="bg-muted/60 flex cursor-pointer items-center justify-normal gap-2 hover:no-underline **:data-[slot=accordion-trigger-icon]:ml-0">
                <span>{capitalize(type)}</span>
                <span className="grow"></span>
                {typeAggregate && (
                  <span className="mr-3 text-sm font-semibold tracking-wide tabular-nums">
                    {formatCurrencyWithPrivacyMode({
                      value: currency(typeAggregate.total),
                      currencyCode: displayCurrencyCode,
                    })}
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent className="-mx-2 pb-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {categories.map((category) => {
                    invariant(category?.node, 'Category node is null')
                    return (
                      <CategoryCard
                        className="rounded-none"
                        key={category.node.id}
                        categoryRef={category.node}
                        financialReportRef={financialReport}
                      />
                    )
                  })}
                </div>
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
          '**:data-[slot=accordion-trigger-icon]:text-muted-foreground group/accordion-trigger flex flex-1 items-start justify-between gap-6 border border-transparent p-2 text-left text-sm/relaxed font-semibold transition-all outline-none hover:underline disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4',
          className,
        )}
        {...props}
      >
        <ChevronDownIcon
          strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}
