import { useMemo } from 'react'
import { graphql, useFragment } from 'react-relay'
import { ResponsiveSankey, type CustomSankeyLayerProps } from '@nivo/sankey'
import currency from 'currency.js'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { Item } from '@/components/ui/item'
import { useHousehold } from '@/hooks/use-household'
import { useCurrency } from '@/hooks/use-currency'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import type { categoriesSankeyFragment$key } from './__generated__/categoriesSankeyFragment.graphql'
import { InfoIcon } from 'lucide-react'

const CategoriesSankeyFragment = graphql`
  fragment categoriesSankeyFragment on FinancialReport {
    incomeBreakdown {
      total
      categories {
        category {
          id
          name
          icon
        }
        total
      }
    }
    expensesBreakdown {
      total
      categories {
        category {
          id
          name
          icon
        }
        total
      }
    }
  }
`

type NodeKind = 'income' | 'center' | 'expense' | 'savings' | 'deficit'

const NODE_COLOR_VARS: Record<NodeKind, string> = {
  income: '--chart-net-worth',
  center: '--chart-asset',
  expense: '--chart-liability',
  savings: '--chart-receivable',
  deficit: '--chart-property',
}

function resolveNodeColors(): Record<NodeKind, string> {
  const style = getComputedStyle(document.documentElement)
  const resolve = (kind: NodeKind) => {
    const raw = style.getPropertyValue(NODE_COLOR_VARS[kind]).trim()
    return raw || '#888'
  }
  return {
    income: resolve('income'),
    center: resolve('center'),
    expense: resolve('expense'),
    savings: resolve('savings'),
    deficit: resolve('deficit'),
  }
}

type NivoNode = {
  id: string
  nodeColor: string
  amount: number
  percentage: number
  nodeKind: NodeKind
  icon: string | null
}

type NivoLink = {
  source: string
  target: string
  value: number
}

function processCategories(
  categories: ReadonlyArray<{
    readonly category: {
      readonly id: string
      readonly name: string
      readonly icon: string | null
    }
    readonly total: string
  }>,
  maxCount: number,
  otherLabel: string,
  referenceTotal: number,
): Array<{ name: string; amount: number; icon: string | null }> {
  const parsed = categories
    .map((c) => ({
      name: c.category.name,
      amount: currency(c.total).value,
      icon: c.category.icon,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const significant = parsed.filter(
    (c) => referenceTotal > 0 && (c.amount / referenceTotal) * 100 >= 1,
  )
  const minor = parsed.filter(
    (c) => referenceTotal <= 0 || (c.amount / referenceTotal) * 100 < 1,
  )

  const capped =
    significant.length <= maxCount
      ? significant
      : significant.slice(0, maxCount)
  const remainderFromCap = significant.slice(maxCount)
  const otherAmount = [...remainderFromCap, ...minor].reduce(
    (sum, c) => sum + c.amount,
    0,
  )

  if (otherAmount > 0) {
    return [...capped, { name: otherLabel, amount: otherAmount, icon: null }]
  }
  return capped
}

function buildNivoSankeyData(
  colors: Record<NodeKind, string>,
  incomeBreakdown: {
    readonly total: string
    readonly categories: ReadonlyArray<{
      readonly category: {
        readonly id: string
        readonly name: string
        readonly icon: string | null
      }
      readonly total: string
    }>
  },
  expensesBreakdown: {
    readonly total: string
    readonly categories: ReadonlyArray<{
      readonly category: {
        readonly id: string
        readonly name: string
        readonly icon: string | null
      }
      readonly total: string
    }>
  },
): { nodes: NivoNode[]; links: NivoLink[] } | null {
  const incomeTotal = currency(incomeBreakdown.total).value
  const expenseTotal = currency(expensesBreakdown.total).value

  if (incomeTotal <= 0 && expenseTotal <= 0) return null

  const incomeCats = processCategories(
    incomeBreakdown.categories,
    8,
    'Other Income',
    incomeTotal,
  )
  const expenseCats = processCategories(
    expensesBreakdown.categories,
    8,
    'Other Expenses',
    incomeTotal,
  )

  if (incomeCats.length === 0) return null

  const nodes: NivoNode[] = []
  const links: NivoLink[] = []

  const centerId = '__total_income__'
  const diff = incomeTotal - expenseTotal
  const hasDeficit = diff < 0
  const hasSavings = diff > 0

  incomeCats.forEach((c) => {
    const id = `inc_${c.name}`
    nodes.push({
      id,
      nodeColor: colors.income,
      amount: c.amount,
      percentage: incomeTotal > 0 ? (c.amount / incomeTotal) * 100 : 0,
      nodeKind: 'income',
      icon: c.icon,
    })
    links.push({ source: id, target: centerId, value: c.amount })
  })

  if (hasDeficit) {
    const id = '__deficit__'
    nodes.push({
      id,
      nodeColor: colors.deficit,
      amount: Math.abs(diff),
      percentage: expenseTotal > 0 ? (Math.abs(diff) / expenseTotal) * 100 : 0,
      nodeKind: 'deficit',
      icon: null,
    })
    links.push({ source: id, target: centerId, value: Math.abs(diff) })
  }

  nodes.push({
    id: centerId,
    nodeColor: colors.center,
    amount: Math.max(incomeTotal, expenseTotal),
    percentage: 100,
    nodeKind: 'center',
    icon: null,
  })

  expenseCats.forEach((c) => {
    const id = `exp_${c.name}`
    nodes.push({
      id,
      nodeColor: colors.expense,
      amount: c.amount,
      percentage: incomeTotal > 0 ? (c.amount / incomeTotal) * 100 : 0,
      nodeKind: 'expense',
      icon: c.icon,
    })
    links.push({ source: centerId, target: id, value: c.amount })
  })

  if (hasSavings) {
    const id = '__savings__'
    nodes.push({
      id,
      nodeColor: colors.savings,
      amount: diff,
      percentage: incomeTotal > 0 ? (diff / incomeTotal) * 100 : 0,
      nodeKind: 'savings',
      icon: null,
    })
    links.push({ source: centerId, target: id, value: diff })
  }

  if (expenseCats.length === 0 && !hasSavings && incomeTotal > 0) {
    const id = '__savings__'
    nodes.push({
      id,
      nodeColor: colors.savings,
      amount: incomeTotal,
      percentage: 100,
      nodeKind: 'savings',
      icon: null,
    })
    links.push({ source: centerId, target: id, value: incomeTotal })
  }

  if (links.length === 0) return null

  return { nodes, links }
}

function getNodeLabel(node: NivoNode): string {
  if (node.id === '__total_income__') return 'Total Income'
  if (node.id === '__savings__') return 'Savings'
  if (node.id === '__deficit__') return 'Deficit'
  return node.id.replace(/^(inc_|exp_)/, '')
}

const ICON_SIZE = 14
const ICON_GAP = 4

interface CategoriesSankeyProps {
  fragmentRef: categoriesSankeyFragment$key
}

export function CategoriesSankey({ fragmentRef }: CategoriesSankeyProps) {
  const data = useFragment(CategoriesSankeyFragment, fragmentRef)
  const { household } = useHousehold()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const nodeColors = useMemo(() => resolveNodeColors(), [])

  const sankeyData = useMemo(
    () =>
      buildNivoSankeyData(
        nodeColors,
        data.incomeBreakdown,
        data.expensesBreakdown,
      ),
    [nodeColors, data.incomeBreakdown, data.expensesBreakdown],
  )

  if (!sankeyData) {
    return (
      <Item
        variant="outline"
        className="flex items-center gap-2 overflow-x-auto"
      >
        <InfoIcon size="16" />
        Log some transactions to see the Sankey chart
      </Item>
    )
  }

  const formatAmount = (amount: number) =>
    formatCurrencyWithPrivacyMode({
      value: currency(amount),
      currencyCode: household.currency.code,
      numberFormatOptions: { notation: 'compact', maximumFractionDigits: 1 },
      privacyMaskLength: 5,
    })

  const formatPct = (pct: number) =>
    isPrivacyModeEnabled ? '•••' : `${pct.toFixed(1)}%`

  const customLabels = (props: CustomSankeyLayerProps<NivoNode, NivoLink>) => {
    return props.nodes.map((node) => {
      const n = node as {
        x: number
        y: number
        width: number
        height: number
        depth: number
      } & NivoNode
      const isLeft = n.depth === 0
      const hasIcon = n.icon !== null
      const iconOffset = hasIcon ? ICON_SIZE + ICON_GAP : 0
      const textX = isLeft
        ? n.x - 8 - iconOffset
        : n.x + n.width + 8 + iconOffset
      const anchor = isLeft ? 'end' : 'start'
      const centerY = n.y + n.height / 2
      const label = getNodeLabel(n)

      const iconX = isLeft ? n.x - 8 - ICON_SIZE : n.x + n.width + 8

      return (
        <g key={n.id}>
          {hasIcon && (
            <foreignObject
              x={iconX}
              y={centerY - ICON_SIZE / 2}
              width={ICON_SIZE}
              height={ICON_SIZE}
            >
              <DynamicIcon
                xmlns="http://www.w3.org/1999/xhtml"
                name={n.icon as IconName}
                size={ICON_SIZE}
                color={n.nodeColor}
              />
            </foreignObject>
          )}
          <text
            x={textX}
            y={centerY}
            textAnchor={anchor}
            dominantBaseline="central"
            style={{ fontFamily: 'inherit' }}
            fill="currentColor"
          >
            <tspan x={textX} dy="-0.45em" fontSize={11} fontWeight={500}>
              {label}
            </tspan>
            <tspan x={textX} dy="1.2em" fontSize={10} opacity={0.55}>
              {formatAmount(n.amount)} ({formatPct(n.percentage)})
            </tspan>
          </text>
        </g>
      )
    })
  }

  return (
    <Item
      variant="outline"
      className="flex-col items-stretch gap-0 overflow-x-auto px-0 py-0"
    >
      <div
        className="min-w-120"
        style={{ height: Math.max(360, sankeyData.nodes.length * 32) }}
      >
        <ResponsiveSankey
          data={sankeyData}
          margin={{ top: 32, right: 128, bottom: 32, left: 128 }}
          align="justify"
          sort="auto"
          colors={(node) => (node as NivoNode).nodeColor}
          nodeOpacity={1}
          nodeHoverOpacity={1}
          nodeThickness={10}
          nodeSpacing={32}
          nodeBorderWidth={0}
          nodeBorderRadius={2}
          linkOpacity={0.4}
          linkHoverOpacity={0.4}
          linkContract={2}
          linkBlendMode="normal"
          enableLinkGradient
          enableLabels={false}
          isInteractive={false}
          layers={['links', 'nodes', customLabels]}
        />
      </div>
    </Item>
  )
}
