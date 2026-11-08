import { Collapsible } from '@astryxdesign/core/Collapsible'
import { Heading } from '@astryxdesign/core/Heading'
import { List } from '@astryxdesign/core/List'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import currency from 'currency.js'
import { capitalize, groupBy, map } from 'lodash-es'
import { useMemo } from 'react'
import { useFragment, useRelayEnvironment } from 'react-relay'
import { Fragment } from 'react/jsx-runtime'
import { fetchQuery, graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import type { categoriesPanelFragment$key } from './__generated__/categoriesPanelFragment.graphql'
import { CategoryCard } from './category-card'

import { FinancialSummaryCards } from '@/components/financial-summary-cards'
import { PageAddButton } from '@/components/page-add-button'
import { CATEGORY_TYPE_LIST } from '@/constant'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { NodeType, useRegisterConnection } from '@/lib/relay'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { parseISO } from 'date-fns'
import type { categoriesPanelRefetch } from './__generated__/categoriesPanelRefetch.graphql'
import categoriesPanelRefetchNode from './__generated__/categoriesPanelRefetch.graphql'
import { CategoriesSankey } from './categories-sankey'
import { DateRangeFilter } from './date-range-filter'

const CategoriesPanelFragment = graphql`
  fragment categoriesPanelFragment on Household
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 50 }
    cursor: { type: "Cursor" }
    startDate: { type: "Time!" }
    endDate: { type: "Time!" }
    viewUserIds: { type: "[ID!]" }
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
      viewUserIDs: $viewUserIds
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
    from: '/_user/household/$householdId/categories',
  })
  const startDate = parseISO(search.start).toISOString()
  const endDate = parseISO(search.end).toISOString()
  const data = useFragment(CategoriesPanelFragment, fragmentRef)
  const { household } = useHousehold()
  const { displayCurrencyCode } = useDisplayCurrency()
  const environment = useRelayEnvironment()
  const { householdId } = useParams({
    from: '/_user/household/$householdId',
  })
  const { viewUserIds } = useHouseholdViewScope()

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
        viewUserIds,
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
      <Heading level={1}>Categories</Heading>
      <FinancialSummaryCards fragmentRef={financialReport} />

      <Stack direction="horizontal" gap={2} align="center" justify="between">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={onDateRangeChange}
        />
        <PageAddButton
          label="Add category"
          to="/household/$householdId/categories/new"
          params={{ householdId }}
        />
      </Stack>

      <CategoriesSankey fragmentRef={financialReport} />

      <Stack direction="vertical" gap={4}>
        {map(CATEGORY_TYPE_LIST, (type) => {
          if (type in groupedCategories === false) {
            return null
          }
          const categories = groupedCategories[type]
          const typeAggregate = categoryTypeMap.get(type)
          return (
            <Collapsible
              value={type}
              key={type}
              trigger={
                <Stack
                  direction="horizontal"
                  gap={3}
                  align="center"
                  width="100%"
                >
                  <span>{capitalize(type)}</span>
                  <span></span>
                  {typeAggregate && (
                    <Text type="label" hasTabularNumbers>
                      {formatCurrencyWithPrivacyMode({
                        value: currency(typeAggregate.total),
                        currencyCode: displayCurrencyCode,
                      })}
                    </Text>
                  )}
                </Stack>
              }
              defaultIsOpen
            >
              <List hasDividers>
                {categories.map((category) => {
                  invariant(category?.node, 'Category node is null')
                  return (
                    <CategoryCard
                      key={category.node.id}
                      categoryRef={category.node}
                      financialReportRef={financialReport}
                    />
                  )
                })}
              </List>
            </Collapsible>
          )
        })}
      </Stack>
    </Fragment>
  )
}
