import { CategoryIcon } from '@/components/category-icon'
import { BottomSheet } from '@astryxdesign/core/BottomSheet'
import { Button } from '@astryxdesign/core/Button'
import { Grid } from '@astryxdesign/core/Grid'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useEffect, useState, type ReactNode } from 'react'
import { ComposerContext } from './context'
import { ComposerEditor } from './controls'
import { ComposerChipRail } from './chip-rail'

export function MobileTransactionComposer({
  kind,
  stableAmounts = false,
  category,
  header,
  amounts,
  entryRows,
  chips,
  details,
  date,
  firstAmount,
  pending,
  onSave,
  mode = 'create',
  initialCategory,
  embedded = false,
  onPendingChange,
}: {
  stableAmounts?: boolean
  kind: string
  mode?: 'create' | 'edit'
  initialCategory?: { name: string; type: string; icon?: string | null }
  embedded?: boolean
  onPendingChange?: (pending: boolean) => void
  header?: ReactNode
  category?: ReactNode
  entryRows?: ReactNode
  amounts?: ReactNode
  chips: ReactNode
  details: ReactNode
  date: ReactNode
  firstAmount: string
  pending: boolean
  onSave: (again: boolean) => Promise<boolean>
}) {
  const [isOpen, setOpen] = useState(mode === 'edit' || !category)
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string
    type: string
    icon?: string | null
  } | null>(initialCategory ?? null)
  const [activeAmount, setActiveAmount] = useState(firstAmount)
  const [editor, setEditor] = useState<string | null>(null)
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [keypadTarget, setKeypadTarget] = useState<HTMLElement | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const busy = saving || pending
  useEffect(() => {
    onPendingChange?.(busy)
    return () => onPendingChange?.(false)
  }, [busy, onPendingChange])
  // A currency change can swap the single amount for debit/credit inputs.
  const [lastFirstAmount, setLastFirstAmount] = useState(firstAmount)
  if (lastFirstAmount !== firstAmount) {
    setLastFirstAmount(firstAmount)
    setActiveAmount(firstAmount)
  }
  async function save(again: boolean) {
    if (busy) return
    setSaving(true)
    setError('')
    try {
      const valid = await onSave(again)
      if (!valid) setError('Check the highlighted fields before saving.')
    } catch {
      setError('Could not save. Your entry is still here—please try again.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <ComposerContext
      value={{
        activeAmount,
        setActiveAmount,
        editor,
        setEditor,
        target,
        keypadTarget,
        dateField: date,
        compactCategories: kind === 'transfer',
        compactAmounts: !!entryRows || stableAmounts,
        chooseCategory: (name, type, icon) => {
          setSelectedCategory({ name, type, icon })
          setEditor(null)
          setOpen(true)
        },
      }}
    >
      {mode === 'create' && (
        <Stack gap={4}>
          {category ?? (
            <Text type="supporting">
              Choose your investment and enter its details.
            </Text>
          )}
          {!category && (
            <Button label={`Enter ${kind}`} onClick={() => setOpen(true)} />
          )}
        </Stack>
      )}
      <ComposerSurface
        className="transaction-composer-sheet"
        embedded={embedded}
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!busy) setOpen(open)
        }}
        label={`${mode === 'edit' ? 'Edit' : 'New'} ${kind}`}
        purpose={busy ? 'required' : 'info'}
        height="hug"
        padding={4}
      >
        <fieldset
          disabled={busy}
          aria-label="Transaction details"
          className="min-w-0"
        >
          <Stack className="composer-workspace">
            <Stack
              gap={4}
              className={editor ? 'invisible' : undefined}
              aria-hidden={editor ? true : undefined}
              inert={!!editor}
            >
              {header ? (
                <Stack
                  direction="horizontal"
                  gap={2}
                  vAlign="center"
                  wrap="wrap"
                >
                  {header}
                </Stack>
              ) : (
                <Stack
                  direction="horizontal"
                  hAlign="between"
                  vAlign="center"
                  gap={2}
                >
                  <Button
                    variant="ghost"
                    label={selectedCategory?.name || `New ${kind}`}
                    icon={
                      selectedCategory ? (
                        <CategoryIcon
                          type={selectedCategory.type}
                          icon={selectedCategory.icon}
                        />
                      ) : undefined
                    }
                    onClick={() =>
                      category && mode === 'edit'
                        ? setEditor('category')
                        : setOpen(false)
                    }
                  />
                </Stack>
              )}
              {entryRows ?? (
                <Stack
                  gap={2}
                  className={
                    stableAmounts
                      ? 'composer-investment-amounts'
                      : 'composer-amounts'
                  }
                >
                  {amounts}
                </Stack>
              )}
              <ComposerChipRail>
                {chips}
                <Button
                  type="button"
                  label="Add note / options"
                  onClick={() => setEditor('details')}
                />
              </ComposerChipRail>
              {mode === 'edit' && (
                <ComposerEditor name="category">{category}</ComposerEditor>
              )}
              <ComposerEditor name="details">
                <Stack gap={4}>{details}</Stack>
              </ComposerEditor>
              <Stack gap={4}>
                <Stack ref={setKeypadTarget} />
                {error && <Text role="alert">{error}</Text>}
                <Grid columns={mode === 'edit' ? 1 : 2} gap={3}>
                  {mode === 'create' && (
                    <Button
                      label="Save again"
                      size="lg"
                      width="100%"
                      isDisabled={busy}
                      onClick={() => void save(true)}
                    />
                  )}
                  <Button
                    label={busy ? 'Saving…' : 'Save'}
                    size="lg"
                    width="100%"
                    variant="primary"
                    isDisabled={busy}
                    onClick={() => void save(false)}
                  />
                </Grid>
              </Stack>
            </Stack>
            <Stack
              gap={3}
              className={editor ? 'composer-editor-pane' : 'hidden'}
            >
              <Stack ref={setTarget} gap={3} className="composer-editor" />
              <Button
                label="Done"
                size="lg"
                width="100%"
                variant="secondary"
                onClick={() => {
                  if (document.activeElement instanceof HTMLElement)
                    document.activeElement.blur()
                  setEditor(null)
                }}
              />
            </Stack>
          </Stack>
        </fieldset>
      </ComposerSurface>
    </ComposerContext>
  )
}

function ComposerSurface({
  embedded,
  children,
  ...props
}: React.ComponentProps<typeof BottomSheet> & { embedded: boolean }) {
  return embedded ? (
    <Stack padding={4}>{children}</Stack>
  ) : (
    <BottomSheet {...props}>{children}</BottomSheet>
  )
}
