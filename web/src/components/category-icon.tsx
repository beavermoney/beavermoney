import { CategoryGlyph } from '@/components/category-glyph'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import {
  ArrowLeftRightIcon,
  BanknoteArrowDownIcon,
  BanknoteArrowUpIcon,
  TrendingUpIcon,
  WrenchIcon,
} from 'lucide-react'
import { dynamicIconImports, type IconName } from 'lucide-react/dynamic'

export function CategoryIcon({
  type,
  icon,
  size: _size = 'default',
}: {
  type: string
  icon?: string | null
  size?: 'inline' | 'sm' | 'default'
}) {
  const TypeIcon =
    type === 'income'
      ? BanknoteArrowUpIcon
      : type === 'expense'
        ? BanknoteArrowDownIcon
        : type === 'investment'
          ? TrendingUpIcon
          : type === 'setup'
            ? WrenchIcon
            : ArrowLeftRightIcon
  const fallback = <AstryxIcon icon={TypeIcon} />

  return (
    <span aria-hidden="true">
      {icon && Object.hasOwn(dynamicIconImports, icon) ? (
        <CategoryGlyph name={icon as IconName} fallback={fallback} />
      ) : (
        fallback
      )}
    </span>
  )
}
