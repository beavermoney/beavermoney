import { UserIcon, UsersIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import {
  type HouseholdMember,
  useHouseholdMembers,
} from '@/hooks/use-household-members'

export function ViewScopeSwitcher() {
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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 cursor-pointer gap-1 rounded-none border-0 bg-clip-border px-3 text-xs"
            data-testid="view-scope-switcher-trigger"
          >
            {showsAll ? (
              <UsersIcon className="size-4" />
            ) : (
              <UserIcon className="size-4" />
            )}
            {scopeLabel(showsAll, selectedMembers)}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuCheckboxItem
          checked={isCombinedAll}
          onCheckedChange={() => setViewUserIds(null)}
          closeOnClick={false}
        >
          All
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {members.map((m) => (
          <DropdownMenuCheckboxItem
            key={m.id}
            checked={selectedIDs.includes(m.id)}
            onCheckedChange={(checked) => toggleMember(m.id, checked === true)}
            closeOnClick={false}
          >
            {m.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function scopeLabel(
  showsAll: boolean,
  selectedMembers: ReadonlyArray<HouseholdMember>,
): string {
  if (showsAll) return 'All'
  if (selectedMembers.length === 0) return 'All'
  if (selectedMembers.length === 1) return selectedMembers[0].name
  if (selectedMembers.length === 2) {
    return `${selectedMembers[0].name} + ${selectedMembers[1].name}`
  }
  return `${selectedMembers.length} selected`
}
