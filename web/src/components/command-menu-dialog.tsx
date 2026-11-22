import { useLingui } from '@lingui/react/macro'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import {
  createCommandSearchSource,
  type CommandSearchItem,
} from '@/lib/command-search'
import {
  CommandPalette,
  CommandPaletteFooter,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { Icon } from '@astryxdesign/core/Icon'
import { Text } from '@astryxdesign/core/Text'
import { ArrowUpRight } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { fetchQuery, useRelayEnvironment } from 'react-relay'
import { MerchantAvatar } from './merchant-avatar'
import { AccountAvatar } from './account-avatar'
import { InvestmentIcon } from './investment-icon'
import type { commandMenuDialogQuery } from './__generated__/commandMenuDialogQuery.graphql'
import { graphql } from 'relay-runtime'
const query = graphql`
  query commandMenuDialogQuery($householdId: ID!, $viewUserIds: [ID!]) {
    node(id: $householdId) {
      ... on Household {
        merchants {
          edges {
            node {
              id
              name
              icon
            }
          }
        }
        accounts(where: { archived: false, userIDIn: $viewUserIds }) {
          edges {
            node {
              id
              name
              icon
              user {
                name
              }
              householdCurrency {
                code
              }
            }
          }
        }
        investments(
          where: {
            archived: false
            userIDIn: $viewUserIds
            hasAccountWith: { archived: false }
          }
        ) {
          edges {
            node {
              id
              name
              symbol
              type
              account {
                name
                icon
                user {
                  name
                }
                householdCurrency {
                  code
                }
              }
            }
          }
        }
      }
    }
  }
`

type AccountIdentity = {
  name: string
  icon?: string | null
  user: { name: string }
  householdCurrency: { code: string }
}
type PaletteItem = CommandSearchItem & {
  account?: AccountIdentity
  merchant?: { name: string; icon?: string | null }
  investment?: { name: string; symbol: string; type: string }
}

export default function CommandMenuDialog({
  householdId,
  viewUserIds,
  setOpen,
}: {
  householdId: string
  viewUserIds: string[] | null
  setOpen: (open: boolean) => Promise<void>
}) {
  const { t } = useLingui()
  const navigate = useNavigate()
  const environment = useRelayEnvironment()
  const selecting = useRef(false)
  const [failed, setFailed] = useState(false)
  const { open: openTransaction } = useLogTransaction()
  const destinations = [
    { label: t`Transactions`, to: '/household/$householdId/transactions' },
    { label: t`Journal`, to: '/household/$householdId/journal' },
    { label: t`Accounts`, to: '/household/$householdId/accounts' },
    { label: t`Investments`, to: '/household/$householdId/investments' },
    { label: t`Categories`, to: '/household/$householdId/categories' },
    { label: t`Merchants`, to: '/household/$householdId/merchants' },
    { label: t`Subscriptions`, to: '/household/$householdId/subscriptions' },
    { label: t`New Account`, to: '/household/$householdId/accounts/new' },
    { label: t`New Investment`, to: '/household/$householdId/investments/new' },
    { label: t`New Category`, to: '/household/$householdId/categories/new' },
    {
      label: t`New Subscription`,
      to: '/household/$householdId/subscriptions/new',
    },
  ] as const
  // Mounting a new dialog gives each opening a fresh index without effect hooks.
  const [source] = useState(() =>
    createCommandSearchSource<PaletteItem>({
      commands: [
        ...destinations.map((item) => ({
          id: `command:${item.to}`,
          label: item.label,
          keywords: '',
          auxiliaryData: { group: t`Go to` },
          run: async () => {
            await setOpen(false)
            void navigate({
              to: item.to,
              params: { householdId },
              search: (prev) => ({ ...prev, command_open: false }),
            })
          },
        })),
        {
          id: 'command:new-transaction',
          label: t`New Transaction`,
          keywords: '',
          auxiliaryData: { group: t`Go to` },
          run: async () => {
            await setOpen(false)
            openTransaction('expense')
          },
        },
      ],
      onError: setFailed,
      load: async () => {
        const data = await fetchQuery<commandMenuDialogQuery>(
          environment,
          query,
          { householdId, viewUserIds },
          { fetchPolicy: 'network-only' },
        ).toPromise()
        const household = data?.node
        if (!household?.accounts || !household.investments)
          throw new Error('Household unavailable')
        const items: PaletteItem[] = []
        for (const edge of household.accounts.edges ?? []) {
          const account = edge?.node
          if (!account) continue
          items.push({
            id: `account:${account.id}`,
            label: account.name,
            account: {
              name: account.name,
              icon: account.icon,
              user: account.user,
              householdCurrency: account.householdCurrency,
            },
            keywords: `${account.user.name} ${account.householdCurrency.code}`,
            auxiliaryData: { group: t`Accounts` },
            run: async () => {
              await setOpen(false)
              void navigate({
                to: '/household/$householdId/accounts/$accountId',
                params: { householdId, accountId: account.id },
                search: (prev) => ({ ...prev, command_open: false }),
              })
            },
          })
        }
        for (const edge of household.investments.edges ?? []) {
          const investment = edge?.node
          if (!investment) continue
          const { account } = investment
          items.push({
            id: `investment:${investment.id}`,
            label: investment.name,
            investment: {
              name: investment.name,
              symbol: investment.symbol,
              type: investment.type,
            },
            account: {
              name: account.name,
              icon: account.icon,
              user: account.user,
              householdCurrency: account.householdCurrency,
            },
            keywords: `${investment.symbol} ${account.name} ${account.user.name} ${account.householdCurrency.code}`,
            auxiliaryData: { group: t`Investments` },
            run: async () => {
              await setOpen(false)
              void navigate({
                to: '/household/$householdId/investments/$investmentId',
                params: { householdId, investmentId: investment.id },
                search: (prev) => ({ ...prev, command_open: false }),
              })
            },
          })
        }
        for (const edge of household.merchants?.edges ?? []) {
          const merchant = edge?.node
          if (!merchant) continue
          items.push({
            id: `merchant:${merchant.id}`,
            label: merchant.name,
            merchant,
            keywords: '',
            auxiliaryData: { group: t`Merchants` },
            run: async () => {
              await setOpen(false)
              void navigate({
                to: '/household/$householdId/merchants/$merchantId',
                params: { householdId, merchantId: merchant.id },
                search: (previous) => ({ ...previous, command_open: false }),
              })
            },
          })
        }
        return items.sort(
          (a, b) =>
            Number(Boolean(a.investment)) - Number(Boolean(b.investment)) ||
            a.label.localeCompare(b.label),
        )
      },
    }),
  )
  return (
    <CommandPalette
      isOpen
      onOpenChange={(open) => {
        if (!open && selecting.current) {
          selecting.current = false
          return
        }
        setOpen(open)
      }}
      label={t`Search accounts, investments and merchants`}
      input={
        <CommandPaletteInput
          placeholder={t`Search accounts, symbols, merchants, or owners…`}
        />
      }
      emptySearchText={t`No matching accounts, investments, merchants, or commands.`}
      searchSource={source}
      footer={
        failed ? (
          <CommandPaletteFooter>
            <Text
              type="supporting"
              role="status"
            >{t`Could not load search results. Type to retry.`}</Text>
          </CommandPaletteFooter>
        ) : undefined
      }
      renderItem={(item) => (
        <HStack gap={3} vAlign="center" width="100%" paddingBlock={1}>
          {item.investment ? (
            <InvestmentIcon {...item.investment} tooltip={false} />
          ) : item.merchant ? (
            <MerchantAvatar merchant={item.merchant} />
          ) : item.account ? (
            <AccountAvatar
              account={item.account}
              size="small"
              tooltip={false}
            />
          ) : (
            <Icon icon={ArrowUpRight} />
          )}
          <VStack gap={0.5} className="min-w-0 flex-1">
            <Text maxLines={1} hasTruncateTooltip={false}>
              {item.label}
            </Text>
            {item.account && (
              <Text type="supporting" maxLines={1} hasTruncateTooltip={false}>
                {item.investment
                  ? `${item.investment.symbol} · ${item.account.name} · ${item.account.user.name}`
                  : `${item.account.user.name} · ${item.account.householdCurrency.code}`}
              </Text>
            )}
          </VStack>
          {item.investment && item.account && (
            <AccountAvatar
              account={item.account}
              size="small"
              tooltip={false}
            />
          )}
        </HStack>
      )}
      onValueChange={(id) => {
        selecting.current = true
        source.select(id)
      }}
    />
  )
}
