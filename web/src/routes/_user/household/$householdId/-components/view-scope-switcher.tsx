import { useLingui } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuDivider,
} from '@astryxdesign/core/DropdownMenu'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { UserIcon, UsersIcon } from 'lucide-react'

import {
  type HouseholdMember,
  useHouseholdMembers,
} from '@/hooks/use-household-members'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'

export function ViewScopeSwitcher() {
  const { t } = useLingui()
  const members = useHouseholdMembers()
  const { viewUserIds, isCombinedAll, setViewUserIds } = useHouseholdViewScope()

  if (members.length <= 1) {
    return null
  }

  const selectedIDs = viewUserIds ?? members.map((m) => m.id)
  const selectedMembers = members.filter((m) => selectedIDs.includes(m.id))
  const showsAll = isCombinedAll || selectedMembers.length === members.length

  const toggleMember = (memberID: string, checked: boolean) => {
    const base = viewUserIds ?? members.map((m) => m.id)
    const next = checked
      ? Array.from(new Set([...base, memberID]))
      : base.filter((id) => id !== memberID)

    if (next.length === 0 || next.length === members.length) {
      setViewUserIds(null)
      return
    }
    setViewUserIds(next)
  }

  return (
    <DropdownMenu
      button={{
        label: scopeLabel(showsAll, selectedMembers),
        icon: showsAll ? (
          <AstryxIcon icon={UsersIcon} />
        ) : (
          <AstryxIcon icon={UserIcon} />
        ),
        variant: 'ghost',
      }}
      alignment="end"
    >
      <DropdownMenuCheckboxItem
        label={t`All`}
        value={isCombinedAll}
        onChange={() => setViewUserIds(null)}
        hasCloseOnSelect={false}
      />
      <DropdownMenuDivider />
      {members.map((member) => (
        <DropdownMenuCheckboxItem
          key={member.id}
          label={member.name}
          value={selectedIDs.includes(member.id)}
          onChange={(checked) => toggleMember(member.id, checked)}
          hasCloseOnSelect={false}
        />
      ))}
    </DropdownMenu>
  )
}

function scopeLabel(
  showsAll: boolean,
  selectedMembers: ReadonlyArray<HouseholdMember>,
): string {
  if (showsAll) return t`All`
  if (selectedMembers.length === 0) return t`All`
  if (selectedMembers.length === 1) return selectedMembers[0].name
  if (selectedMembers.length === 2) {
    return `${selectedMembers[0].name} + ${selectedMembers[1].name}`
  }
  return t`${selectedMembers.length} selected`
}
