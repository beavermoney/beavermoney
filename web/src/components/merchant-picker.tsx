import { useMemo, useRef, useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { Typeahead, type SearchSource } from '@astryxdesign/core/Typeahead'
import { Button } from '@astryxdesign/core/Button'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay'
import { MerchantAvatar } from './merchant-avatar'
import { ScrollingName } from './scrolling-name'
import { useComposer } from './transaction-composer/context'
import { ComposerEditor } from './transaction-composer/controls'
import type { merchantPickerQuery } from './__generated__/merchantPickerQuery.graphql'

const query = graphql`
  query merchantPickerQuery($query: String!) {
    household {
      merchantSearch(query: $query, first: 20) {
        id
        name
        icon
      }
    }
  }
`

export type MerchantSelection = {
  id?: string
  name: string
  icon?: string | null
}

type MerchantItem = {
  id: string
  label: string
  merchant: MerchantSelection
}

type MerchantPickerProps = {
  value: MerchantSelection | null
  onChange: (value: MerchantSelection | null) => void
  allowCreate?: boolean
  excludedIds?: readonly string[]
  disabled?: boolean
  label?: string
}

export function MerchantPicker(props: MerchantPickerProps) {
  const { t } = useLingui()
  const composer = useComposer()
  if (!composer) return <MerchantSearch {...props} />
  return (
    <>
      <Button
        label={
          props.value ? t`Merchant: ${props.value.name}` : t`Choose merchant`
        }
        variant="secondary"
        width="100%"
        className="composer-merchant"
        isDisabled={props.disabled}
        aria-expanded={composer.editor === 'merchant'}
        onClick={() => composer.setEditor('merchant')}
      >
        <Stack gap={1} align="center" className="w-full min-w-0">
          <Text type="supporting" color="inherit">{t`Merchant`}</Text>
          <Stack
            direction="horizontal"
            gap={2}
            align="center"
            className="max-w-full min-w-0"
          >
            {props.value && <MerchantAvatar merchant={props.value} />}
            <ScrollingName type="large" size="xl">
              {props.value?.name ?? t`Choose`}
            </ScrollingName>
          </Stack>
        </Stack>
      </Button>
      <ComposerEditor name="merchant">
        <MerchantSearch
          {...props}
          autoFocus
          onChange={(value) => {
            props.onChange(value)
            composer.setEditor(null)
          }}
        />
      </ComposerEditor>
    </>
  )
}

function MerchantSearch({
  value,
  onChange,
  allowCreate = true,
  excludedIds,
  disabled,
  label,
  autoFocus = false,
}: MerchantPickerProps & { autoFocus?: boolean }) {
  const { t } = useLingui()
  const environment = useRelayEnvironment()
  const [error, setError] = useState(false)
  const request = useRef(0)
  const excludedKey = (excludedIds ?? []).join(',')
  const source = useMemo<SearchSource<MerchantItem>>(() => {
    const excluded = new Set(excludedKey.split(','))
    const search = async (input: string): Promise<MerchantItem[]> => {
      const current = ++request.current
      const name = input.trim().replace(/\s+/gu, ' ')
      try {
        const data = await fetchQuery<merchantPickerQuery>(
          environment,
          query,
          { query: name },
          { fetchPolicy: 'network-only' },
        ).toPromise()
        if (current !== request.current) return []
        setError(false)
        const matches = data?.household.merchantSearch ?? []
        const rows: MerchantItem[] = matches
          .filter((merchant) => !excluded.has(merchant.id))
          .map((merchant) => ({
            id: merchant.id,
            label: merchant.name,
            merchant,
          }))
        const normalized = name.normalize('NFKC').toLocaleLowerCase()
        if (
          allowCreate &&
          name &&
          Array.from(name.normalize('NFKC')).length <= 120 &&
          !matches.some(
            (merchant) =>
              merchant.name.normalize('NFKC').toLocaleLowerCase() ===
              normalized,
          )
        ) {
          rows.push({
            id: `new:${name}`,
            label: t`Add “${name}”`,
            merchant: { name },
          })
        }
        return rows
      } catch {
        if (current === request.current) setError(true)
        return []
      }
    }
    return {
      search,
      bootstrap: () => search(''),
      cancel: () => {
        request.current++
      },
    }
  }, [environment, excludedKey, allowCreate, t])
  const selected: MerchantItem | null = value
    ? {
        id: value.id ?? `new:${value.name}`,
        label: value.name,
        merchant: value,
      }
    : null
  return (
    <Stack gap={3} className="min-w-0">
      <Typeahead<MerchantItem>
        label={label ?? t`Merchant`}
        isOptional
        placeholder={
          allowCreate ? t`Search or add a merchant` : t`Search merchants`
        }
        searchSource={source}
        value={selected}
        onChange={(item) => onChange(item?.merchant ?? null)}
        isDisabled={disabled}
        hasEntriesOnFocus
        hasAutoFocus={autoFocus}
        minQueryLength={0}
        maxMenuItems={21}
        width="100%"
        emptySearchText={
          error
            ? t`Could not load merchants. Type to retry.`
            : t`No matching merchants.`
        }
        renderItem={(item) => (
          <Stack direction="horizontal" gap={2} align="center">
            <MerchantAvatar merchant={item.merchant} />
            <Text maxLines={2}>{item.label}</Text>
          </Stack>
        )}
      />
      {value && !value.id && (
        <Text
          type="supporting"
          color="secondary"
        >{t`This merchant will be created when you save the expense.`}</Text>
      )}
      {autoFocus && (
        <Button
          label={t`No merchant`}
          variant="ghost"
          onClick={() => onChange(null)}
        />
      )}
    </Stack>
  )
}
