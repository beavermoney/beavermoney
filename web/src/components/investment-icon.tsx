import { Avatar } from '@astryxdesign/core/Avatar'
import { getLogoCryptoURL, getLogoTickerURL } from '@/lib/logo'

export function InvestmentIcon({
  symbol,
  name,
  type,
  tooltip = true,
}: {
  symbol?: string | null
  name: string
  type?: string
  tooltip?: boolean
}) {
  return (
    <Avatar
      size="xsm"
      tooltip={tooltip}
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
