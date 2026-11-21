import { Stack } from '@astryxdesign/core/Stack'
import { MerchantAvatar } from './merchant-avatar'
import { CategoryIcon } from './category-icon'

export function MerchantCategoryAvatar({
  merchant,
  category,
}: {
  merchant: { name: string; icon?: string | null }
  category: { type: string; icon?: string | null }
}) {
  return (
    <Stack className="relative size-9 shrink-0" align="start">
      <MerchantAvatar merchant={merchant} size="large" />
      <Stack
        align="center"
        justify="center"
        className="absolute -right-1 -bottom-1 size-5 rounded-full bg-(--color-background-card) ring-2 ring-(--color-background-card)"
      >
        <CategoryIcon type={category.type} icon={category.icon} size="sm" />
      </Stack>
    </Stack>
  )
}
