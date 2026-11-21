import type { SearchSource } from '@astryxdesign/core/Typeahead'

export type CommandSearchItem = {
  id: string
  label: string
  keywords: string
  auxiliaryData: { group: string }
  run: () => void
}

function normalize(value: string) {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase()
}

export function searchCommands<T extends CommandSearchItem>(
  items: readonly T[],
  query: string,
): T[] {
  const tokens = normalize(query).trim().split(/\s+/).filter(Boolean)
  return items
    .filter((item) => {
      const text = normalize(`${item.label} ${item.keywords}`)
      return tokens.every((token) => text.includes(token))
    })
    .sort((a, b) => {
      const prefix = normalize(query).trim()
      return (
        Number(normalize(b.label).startsWith(prefix)) -
        Number(normalize(a.label).startsWith(prefix))
      )
    })
}

/** One fresh index per palette opening; keystrokes share its in-flight request. */
export function createCommandSearchSource<T extends CommandSearchItem>({
  commands,
  load,
  onError,
}: {
  commands: T[]
  load: () => Promise<T[]>
  onError: (failed: boolean) => void
}): SearchSource<T> & { select: (id: string) => void } {
  let request: Promise<T[]> | undefined
  const byId = new Map(commands.map((item) => [item.id, item]))
  const getItems = () => {
    request ??= load().then(
      (items) => {
        onError(false)
        items.forEach((item) => byId.set(item.id, item))
        return items
      },
      () => {
        request = undefined
        onError(true)
        return []
      },
    )
    return request
  }
  return {
    async bootstrap() {
      const entities = await getItems()
      const counts = new Map<string, number>()
      const suggestions = entities.filter((item) => {
        const group = item.auxiliaryData.group
        const count = counts.get(group) ?? 0
        counts.set(group, count + 1)
        return count < 3
      })
      return [...suggestions, ...commands.slice(0, 6)]
    },
    async search(query) {
      return searchCommands([...(await getItems()), ...commands], query)
    },
    select(id) {
      byId.get(id)?.run()
    },
  }
}
