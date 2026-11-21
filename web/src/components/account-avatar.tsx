import { Avatar } from '@astryxdesign/core/Avatar'
import { HStack } from '@astryxdesign/core/Layout'
import { getLogoDomainURL } from '@/lib/logo'

type Props = {
  account: {
    name: string
    icon?: string | null
    user: { name: string }
  }
  size?: 'small' | 'large'
}

export function AccountAvatar({ account, size = 'large' }: Props) {
  const small = size === 'small'
  return (
    <HStack
      gap={0}
      vAlign="center"
      className={small ? 'relative shrink-0' : 'relative shrink-0 pr-2 pb-2'}
    >
      <Avatar
        name={account.name}
        src={account.icon ? getLogoDomainURL(account.icon) : undefined}
        size={small ? 'xsm' : 'md'}
      />
      <HStack
        className={
          small
            ? 'relative z-10 -ml-1 rounded-full bg-(--color-background-card) ring-2 ring-(--color-background-card)'
            : 'absolute right-1 bottom-1 z-10 rounded-full bg-(--color-background-card) ring-2 ring-(--color-background-card)'
        }
      >
        <Avatar name={account.user?.name ?? '?'} size={small ? 16 : 'xsm'} />
      </HStack>
    </HStack>
  )
}
