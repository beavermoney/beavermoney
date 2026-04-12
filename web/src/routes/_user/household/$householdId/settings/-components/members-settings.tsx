import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'

import type { membersSettingsFragment$key } from './__generated__/membersSettingsFragment.graphql'

import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { useUser } from '@/hooks/use-user'

const membersSettingsFragment = graphql`
  fragment membersSettingsFragment on Household {
    userHouseholds {
      id
      role
      householdCurrency {
        code
      }
      user {
        id
        name
        email
      }
    }
  }
`

type MembersSettingsProps = {
  householdRef: membersSettingsFragment$key
}

export function MembersSettings({ householdRef }: MembersSettingsProps) {
  const { userHouseholds } = useFragment(membersSettingsFragment, householdRef)
  const user = useUser()

  const members = userHouseholds ?? []

  return (
    <div className="flex max-w-md flex-col gap-3">
      <ItemGroup>
        {members.map((uh) => {
          const isCurrentUser = uh.user.id === user.id
          return (
            <Item key={uh.id} variant="outline" size="sm">
              <ItemContent>
                <ItemTitle>
                  {uh.user.name}
                  {isCurrentUser && (
                    <span className="text-muted-foreground font-normal">
                      (you)
                    </span>
                  )}
                  <Badge variant={'outline'}>{uh.householdCurrency.code}</Badge>
                </ItemTitle>
                <ItemDescription>{uh.user.email}</ItemDescription>
              </ItemContent>
              <Badge variant={uh.role === 'admin' ? 'default' : 'secondary'}>
                {uh.role}
              </Badge>
            </Item>
          )
        })}
      </ItemGroup>
      <p className="text-muted-foreground text-xs/relaxed">
        Invite and role management coming soon.
      </p>
    </div>
  )
}
