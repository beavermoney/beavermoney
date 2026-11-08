import { Typeahead } from '@astryxdesign/core/Typeahead'
import type { LucideProps } from 'lucide-react'
import {
  DynamicIcon,
  dynamicIconImports,
  type IconName,
} from 'lucide-react/dynamic'
import { iconsData } from './icons-data'

export type { IconName }
export function Icon({ name, ...props }: LucideProps & { name: IconName }) {
  return <DynamicIcon name={name} {...props} />
}
const options = iconsData
  .filter((icon) => icon.name in dynamicIconImports)
  .map((icon) => ({
    id: icon.name,
    label: icon.name,
    keywords: [...icon.tags, ...icon.categories].join(' '),
  }))
export function IconPicker({
  value,
  onValueChange,
  id,
  onBlur,
}: {
  value?: IconName
  onValueChange?: (value: IconName) => void
  name?: string
  className?: string
  id?: string
  onBlur?: () => void
}) {
  return (
    <Typeahead
      id={id}
      label="Icon"
      isLabelHidden
      placeholder="Search icons"
      value={options.find((icon) => icon.id === value) ?? null}
      onChange={(icon) => {
        if (icon) onValueChange?.(icon.id as IconName)
      }}
      onBlur={onBlur}
      searchSource={{
        bootstrap: () => options.slice(0, 40),
        search: (query) =>
          options
            .filter((icon) =>
              (icon.label + ' ' + icon.keywords).includes(query.toLowerCase()),
            )
            .slice(0, 40),
      }}
      renderItem={(icon) => (
        <span>
          <Icon name={icon.id as IconName} />
          {icon.label}
        </span>
      )}
      maxMenuItems={40}
    />
  )
}
