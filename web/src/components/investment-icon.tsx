import { Avatar } from '@astryxdesign/core/Avatar'
import { getLogoCryptoURL, getLogoTickerURL } from '@/lib/logo'

export function InvestmentIcon({
  symbol,
  name,
  type,
}: {
  symbol?: string | null
  name: string
  type?: string
}) {
  return (
    <Avatar
      size="xsm"
      name={name}
      src={
        symbol
          ? type === 'crypto'
            ? getLogoCryptoURL(symbol)
            : getLogoTickerURL(symbol)
          : undefined
      }
    />
  )
}
