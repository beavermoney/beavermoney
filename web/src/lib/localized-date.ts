import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale/zh-CN'

// ISO storage keys deliberately keep their original format.
const chinesePatterns: Record<string, string> = {
  'MMM d': 'M月d日',
  'LLL d': 'M月d日',
  'MMMM d': 'M月d日',
  'MMM d, yyyy': 'yyyy年M月d日',
  'MMMM yyyy': 'yyyy年M月',
}
export function formatLocalizedDate(
  date: Date,
  pattern: string,
  locale: string,
) {
  return locale === 'zh-CN'
    ? format(date, chinesePatterns[pattern] ?? pattern, { locale: zhCN })
    : format(date, pattern)
}
