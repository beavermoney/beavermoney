import {
  DropdownMenu,
  type DropdownMenuProps,
} from '@astryxdesign/core/DropdownMenu'
import { useHouseholdMembers } from '@/hooks/use-household-members'
import { ViewScopeSwitcher } from './view-scope-switcher'

export function HouseholdActionsMenu({
  showViewScope,
  ...props
}: DropdownMenuProps & { showViewScope: boolean }) {
  const members = useHouseholdMembers()

  return (
    <DropdownMenu
      {...props}
      footer={
        showViewScope && members.length > 1 ? <ViewScopeSwitcher /> : undefined
      }
    />
  )
}
