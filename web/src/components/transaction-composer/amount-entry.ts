export type PendingCalculation = {
  left: string
  operator: '+' | '-'
  right: string
}

export function editAmount(
  raw: string,
  key: string,
  decimal: string,
  scale: number,
) {
  if (key === 'backspace') return raw.slice(0, -1)
  if (key === decimal)
    return scale > 0 && !raw.includes(decimal) ? `${raw || '0'}${decimal}` : raw
  if (!/^\d$/.test(key)) return raw
  const fraction = raw.split(decimal)[1]
  if (fraction !== undefined && fraction.length >= scale) return raw
  return raw === '0' ? key : raw + key
}

// Integer arithmetic preserves decimal cents and fractional shares exactly.
export function calculateAmount(
  left: string,
  right: string,
  operator: '+' | '-',
  decimal: string,
  scale: number,
) {
  const unit = 10n ** BigInt(scale)
  const parse = (value: string) => {
    const negative = value.startsWith('-')
    const [whole, fraction = ''] = value.replace(/^-/, '').split(decimal)
    const amount =
      BigInt(whole || '0') * unit +
      BigInt(fraction.padEnd(scale, '0').slice(0, scale) || '0')
    return negative ? -amount : amount
  }
  const result =
    operator === '+' ? parse(left) + parse(right) : parse(left) - parse(right)
  const absolute = result < 0n ? -result : result
  const fraction = (absolute % unit)
    .toString()
    .padStart(scale, '0')
    .replace(/0+$/, '')
  return `${result < 0n ? '-' : ''}${absolute / unit}${fraction ? decimal + fraction : ''}`
}
