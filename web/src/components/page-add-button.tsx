import { RouterButton } from '@/components/router-button'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import type { LinkOptions } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

type PageAddButtonProps = LinkOptions & {
  label: string
}

export function PageAddButton({ label, ...linkOptions }: PageAddButtonProps) {
  return (
    <RouterButton
      {...linkOptions}
      label={label}
      icon={<AstryxIcon icon={PlusIcon} />}
    />
  )
}
