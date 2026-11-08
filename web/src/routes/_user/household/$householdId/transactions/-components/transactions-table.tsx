import { CategoryIcon } from '@/components/category-icon'
import { getLogoDomainURL } from '@/lib/logo'
import { Avatar } from '@astryxdesign/core/Avatar'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
} from '@astryxdesign/core/DropdownMenu'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { ScrollableArea } from '@astryxdesign/core/ScrollableArea'
import { Stack } from '@astryxdesign/core/Stack'
import { proportional, Table } from '@astryxdesign/core/Table'
import { Text } from '@astryxdesign/core/Text'
import { Link } from '@tanstack/react-router'
import { ArrowDownIcon, ArrowUpIcon, Columns3Icon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'
import { graphql, useFragment } from 'react-relay'

import { format, isToday, isYesterday } from 'date-fns'

import { useCurrency } from '@/hooks/use-currency'
import { useHousehold } from '@/hooks/use-household'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'

import type {
  transactionsTableFragment$data,
  transactionsTableFragment$key,
} from './__generated__/transactionsTableFragment.graphql'

const fragment = graphql`
  fragment transactionsTableFragment on Transaction @relay(plural: true) {
    id
    datetime
    description
    excludeFromReports
    category {
      icon
      type
      name
    }
    user {
      name
    }
    transactionEntries {
      id
      amount
      account {
        icon
        name
        householdCurrency {
          code
        }
      }
    }
    investmentLots {
      id
      amount
      price
      investment {
        symbol
        account {
          icon
          name
        }
        householdCurrency {
          code
        }
      }
    }
  }
`

type Transaction = transactionsTableFragment$data[number]
type Props = {
  fragmentRef: transactionsTableFragment$key
  direction: 'ASC' | 'DESC'
  onToggleSort: () => void
  isSorting: boolean
  hasNext: boolean
  isLoadingNext: boolean
  loadError: string | null
  onLoadMore: () => void
  onOpenTransaction: (transactionId: string) => void
  onPreloadTransaction: (transactionId: string) => void
}

const LABELS = {
  date: 'Date',
  description: 'Transaction',
  movement: 'Account / Movement',
  amount: 'Amount',
  owner: 'Member',
} as const
type ColumnId = keyof typeof LABELS

export function TransactionsTable({
  fragmentRef,
  direction,
  onToggleSort,
  isSorting,
  hasNext,
  isLoadingNext,
  onLoadMore,
  loadError,
  onOpenTransaction,
  onPreloadTransaction,
}: Props) {
  const transactions = useFragment(fragment, fragmentRef)
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const { household } = useHousehold()
  const [columnVisibility, setColumnVisibility] = useState<
    Partial<Record<ColumnId, boolean>>
  >({})
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
    null,
  )
  const { ref: loadMoreRef, inView } = useInView({
    root: scrollContainer,
    rootMargin: '0px 0px 160px 0px',
  })
  useEffect(() => {
    if (
      scrollContainer &&
      inView &&
      hasNext &&
      !isLoadingNext &&
      !isSorting &&
      !loadError
    )
      onLoadMore()
  }, [
    scrollContainer,
    inView,
    hasNext,
    isLoadingNext,
    isSorting,
    loadError,
    onLoadMore,
  ])
  const quantityFormatter = new Intl.NumberFormat(household.locale, {
    maximumFractionDigits: 8,
    signDisplay: 'exceptZero',
  })
  const columns: {
    id: ColumnId
    header: ReactNode
    enableHiding?: boolean
    cell: (transaction: Transaction) => ReactNode
  }[] = [
    {
      id: 'date',
      enableHiding: false,
      header: (
        <Button
          type="button"
          variant="ghost"
          label={`Date, ${direction === 'DESC' ? 'newest' : 'oldest'} first. Sort ${direction === 'DESC' ? 'oldest' : 'newest'} first`}
          onClick={() => {
            scrollContainer?.scrollTo({ top: 0 })
            onToggleSort()
          }}
          isDisabled={isSorting || isLoadingNext}
          endContent={
            direction === 'DESC' ? (
              <AstryxIcon icon={ArrowDownIcon} />
            ) : (
              <AstryxIcon icon={ArrowUpIcon} />
            )
          }
        >
          Date
        </Button>
      ),
      cell: (transaction) => (
        <time dateTime={transaction.datetime}>
          {isToday(new Date(transaction.datetime))
            ? 'Today'
            : isYesterday(new Date(transaction.datetime))
              ? 'Yesterday'
              : format(new Date(transaction.datetime), 'MMM d, yyyy')}
        </time>
      ),
    },
    {
      id: 'description',
      enableHiding: false,
      header: 'Transaction',
      cell: (transaction) => {
        const { category } = transaction
        return (
          <Stack direction="horizontal" gap={2} align="center">
            <CategoryIcon type={category.type} icon={category.icon} />
            <Stack direction="vertical" gap={0.5}>
              <Stack direction="horizontal" gap={2} align="center">
                <Link
                  to="."
                  resetScroll={false}
                  search={(search) => ({
                    ...search,
                    edit_transaction_id: transaction.id,
                  })}
                  onFocus={() => onPreloadTransaction(transaction.id)}
                  onClick={() => onPreloadTransaction(transaction.id)}

                  title={category.name}
                >
                  {category.name}
                </Link>
                {transaction.excludeFromReports && (
                  <Badge label={<>Excluded</>} />
                )}
              </Stack>
              {transaction.description && (
                <span title={transaction.description}>
                  {transaction.description}
                </span>
              )}
            </Stack>
          </Stack>
        )
      },
    },
    {
      id: 'movement',
      header: 'Account / Movement',
      cell: (transaction) => (
        <Stack direction="vertical" gap={1}>
          {transaction.transactionEntries?.map((entry) => (
            <AccountMovement key={entry.id} account={entry.account} />
          ))}
          {transaction.investmentLots?.map((lot) => (
            <AccountMovement
              key={lot.id}
              account={lot.investment.account}
              symbol={lot.investment.symbol}
            />
          ))}
        </Stack>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      enableHiding: false,
      cell: (transaction) => (
        <Stack direction="vertical" gap={1}>
          {transaction.transactionEntries?.map((entry) => (
            <span key={entry.id}>
              {formatCurrencyWithPrivacyMode({
                value: entry.amount,
                currencyCode: entry.account.householdCurrency.code,
              })}{' '}
              <Text type="supporting">
                {entry.account.householdCurrency.code}
              </Text>
            </span>
          ))}
          {transaction.investmentLots?.map((lot) => (
            <span key={lot.id}>
              {isPrivacyModeEnabled
                ? '•••••••'
                : quantityFormatter.format(Number(lot.amount))}{' '}
              <Text type="supporting">{lot.investment.symbol} @ </Text>
              {formatCurrencyWithPrivacyMode({
                value: lot.price,
                currencyCode: lot.investment.householdCurrency.code,
              })}{' '}
              <Text type="supporting">
                {lot.investment.householdCurrency.code}
              </Text>
            </span>
          ))}
        </Stack>
      ),
    },
    {
      id: 'owner',
      header: 'Member',
      cell: (transaction) => (
        <Stack
          direction="horizontal"
          gap={1.5}
          align="center"

          aria-label={transaction.user.name}
        >
          <Avatar
            name={String(transaction.user.name.slice(0, 2).toUpperCase())}
          />
          <span>{transaction.user.name}</span>
        </Stack>
      ),
    },
  ]
  const visibleColumns = columns.filter(
    (column) => columnVisibility[column.id] !== false,
  )

  return (
    <Stack
      direction="vertical"
      gap={2}
      as="section"
      aria-label="Transactions"
      aria-busy={isSorting || isLoadingNext}
    >
      <Stack direction="horizontal" gap={2} align="center" justify="between">
        <Text
          as="p"
          display="block"
          color="secondary"

          role="status"
        >
          {isSorting
            ? 'Sorting transactions…'
            : `${transactions.length} transaction${transactions.length === 1 ? '' : 's'}${hasNext ? ' loaded' : ''}`}
        </Text>
        <DropdownMenu
          alignment={'end'}
          renderTrigger={(triggerProps) => (
            <Button
              {...triggerProps}
              type="button"
              label={'Columns'}
              variant={'secondary'}

              icon={<AstryxIcon icon={Columns3Icon} />}
            />
          )}
        >
          <DropdownMenuGroup>
            {columns
              .filter((column) => column.enableHiding !== false)
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  value={columnVisibility[column.id] !== false}
                  onChange={(checked) =>
                    setColumnVisibility((previous) => ({
                      ...previous,
                      [column.id]: checked,
                    }))
                  }
                  label={<>{LABELS[column.id]}</>}
                ></DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuGroup>
        </DropdownMenu>
      </Stack>
      <ScrollableArea
        label="Scrollable content"
        ref={setScrollContainer}
        axis="block"
      >
        <Table
          aria-label="Transactions"
          data={[...transactions]}
          idKey="id"
          hasHover
          emptyState="No transactions in this date range."
          textOverflow="truncate"
          columns={visibleColumns.map((column) => ({
            key: column.id,
            header: column.header,
            width: proportional(
              column.id === 'description' || column.id === 'movement' ? 2 : 1,
              {
                minWidth:
                  column.id === 'description' || column.id === 'movement'
                    ? 200
                    : 120,
              },
            ),
            renderCell: column.cell,
          }))}
          plugins={{
            navigation: {
              transformBodyRow: (props, transaction) => ({
                ...props,
                htmlProps: {
                  ...props.htmlProps,
                  tabIndex: 0,
                  onKeyDown: (event) => {
                    if (event.target !== event.currentTarget || isSorting)
                      return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onOpenTransaction(transaction.id)
                    }
                  },
                  onPointerEnter: () => onPreloadTransaction(transaction.id),
                  onClick: (event) => {
                    if (
                      (event.target instanceof Element &&
                        event.target.closest('a,button,input')) ||
                      window.getSelection()?.toString() ||
                      isSorting
                    )
                      return
                    onOpenTransaction(transaction.id)
                  },
                },
              }),
            },
          }}
        />
        {hasNext && (
          <div ref={loadMoreRef} role="status">
            {loadError ? (
              <Stack direction="horizontal" gap={2} align="center" role="alert">
                {loadError}
                <Button
                  onClick={onLoadMore}
                  label={'Retry'}
                  variant={'secondary'}

                  isDisabled={isLoadingNext}
                >
                  Retry
                </Button>
              </Stack>
            ) : isLoadingNext ? (
              'Loading more transactions…'
            ) : null}
          </div>
        )}
      </ScrollableArea>
    </Stack>
  )
}

function AccountMovement({
  account,
  symbol,
}: {
  account: { name: string; icon?: string | null }
  symbol?: string
}) {
  return (
    <Stack
      direction="horizontal"
      gap={2}
      align="center"

      aria-label={`${account.name}${symbol ? ` · ${symbol}` : ''}`}
    >
      <Avatar src={getLogoDomainURL(account.icon || '')} name={String('')} />
      <span>
        {account.name}
        {symbol && <Text type="supporting"> · {symbol}</Text>}
      </span>
    </Stack>
  )
}
