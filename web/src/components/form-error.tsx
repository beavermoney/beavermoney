import { FieldStatus } from '@astryxdesign/core/FieldStatus'
import type { ReactNode } from 'react'

export function FormError({
  errors,
  children,
  id,
}: {
  errors?: readonly ({ message?: string } | undefined)[]
  children?: ReactNode
  id?: string
}) {
  const message =
    children ??
    [...new Set(errors?.map((error) => error?.message).filter(Boolean))].join(
      '. ',
    )
  return message ? (
    <FieldStatus id={id} type="error" message={String(message)} />
  ) : null
}
