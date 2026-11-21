import { Avatar } from '@astryxdesign/core/Avatar'
import { getLogoDomainURL } from '@/lib/logo'

type Props = {
  merchant: { name: string; icon?: string | null }
  size?: 'small' | 'large'
}

export function MerchantAvatar({ merchant, size = 'small' }: Props) {
  return (
    <Avatar
      name={merchant.name}
      src={merchant.icon ? getLogoDomainURL(merchant.icon) : undefined}
      size={size === 'large' ? 'md' : 'xsm'}
      tooltip={false}
    />
  )
}
