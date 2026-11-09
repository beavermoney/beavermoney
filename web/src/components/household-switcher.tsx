import { useLingui } from '@lingui/react/macro'
import type { MouseEvent } from 'react'
import { Avatar } from '@astryxdesign/core/Avatar'
import {
  DropdownMenu,
  DropdownMenuDivider,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@astryxdesign/core/DropdownMenu'
import { Icon } from '@astryxdesign/core/Icon'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import {
  useSideNavCollapse,
  useSideNavRenderMode,
} from '@astryxdesign/core/SideNav'
import { Button } from '@astryxdesign/core/Button'
import { Item } from '@astryxdesign/core/Item'
import { Text } from '@astryxdesign/core/Text'
import { useAppShellMobile } from '@astryxdesign/core/AppShell'
import { Check, ChevronUp, LogOut, Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { graphql, useFragment } from 'react-relay'

import { useHousehold } from '@/hooks/use-household'
import { logout } from '@/lib/auth'
import type { householdSwitcherFragment$key } from './__generated__/householdSwitcherFragment.graphql'

const HouseholdSwitcherFragment = graphql`
  fragment householdSwitcherFragment on Query {
    user {
      name
      email
    }
    households {
      id
      name
    }
  }
`

export function HouseholdSwitcher({
  fragmentRef,
}: {
  fragmentRef: householdSwitcherFragment$key
}) {
  const { t } = useLingui()
  const data = useFragment(HouseholdSwitcherFragment, fragmentRef)
  const { household: activeHousehold } = useHousehold()
  const navigate = useNavigate()
  const { closeMobileNav } = useAppShellMobile()
  const { isCollapsed } = useSideNavCollapse()
  const renderMode = useSideNavRenderMode()
  const iconOnly = isCollapsed && renderMode === 'default'

  return (
    <DropdownMenu
      placement="above"
      alignment="start"
      menuWidth={260}
      menuMaxHeight={560}
      renderTrigger={(triggerProps) =>
        iconOnly ? (
          <Button
            {...triggerProps}
            label={t`${data.user.name}, user menu`}
            variant="ghost"
            isIconOnly
            icon={<Avatar aria-hidden="true" name={data.user.name} size="sm" />}
          />
        ) : (
          <Item
            {...triggerProps}
            onClick={(event) =>
              triggerProps.onClick(event as MouseEvent<HTMLElement>)
            }
            as="button"
            role="button"
            label={data.user.name}
            aria-label={t`${data.user.name}, user menu`}
            density="compact"
            className="w-full text-left"
            startContent={
              <Avatar aria-hidden="true" name={data.user.name} size="sm" />
            }
            endContent={<Icon icon={ChevronUp} size="sm" />}
          />
        )
      }
    >
      <DropdownMenuGroup
        title={
          <HStack gap={2} vAlign="center">
            <Avatar aria-hidden="true" name={data.user.name} size="sm" />
            <VStack gap={0}>
              <Text type="label">{data.user.name}</Text>
              {data.user.email && (
                <Text type="supporting" color="secondary">
                  {data.user.email}
                </Text>
              )}
            </VStack>
          </HStack>
        }
      >
        {data.households.map((household) => (
          <DropdownMenuItem
            key={household.id}
            label={household.name}
            icon={<Avatar aria-hidden="true" name={household.name} size="sm" />}
            aria-current={
              household.id === activeHousehold.id ? 'true' : undefined
            }
            endContent={
              household.id === activeHousehold.id ? (
                <Icon icon={Check} />
              ) : undefined
            }
            onClick={() => {
              if (household.id === activeHousehold.id) return
              closeMobileNav()
              void navigate({
                to: '/household/$householdId',
                params: { householdId: household.id },
                reloadDocument: true,
              })
            }}
          />
        ))}
        <DropdownMenuItem
          label={t`Add household`}
          icon={Plus}
          onClick={() => {
            closeMobileNav()
            void navigate({ to: '/household/new' })
          }}
        />
      </DropdownMenuGroup>
      <DropdownMenuDivider />
      <DropdownMenuItem
        label={t`Log out`}
        icon={LogOut}
        onClick={() => {
          closeMobileNav()
          logout()
          void navigate({ to: '/' })
        }}
      />
    </DropdownMenu>
  )
}
