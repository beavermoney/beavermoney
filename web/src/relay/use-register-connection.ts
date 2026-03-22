import { useEffect, useMemo } from 'react'
import { ConnectionHandler } from 'react-relay'
import { connectionRegistry } from './connection-registry'
import { NodeType } from './node-types'

export function useRegisterConnection<TFilters extends object>(
  parentId: string,
  connectionKey: string,
  nodeType: NodeType,
  filters?: TFilters,
): void {
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])

  const registryKey = useMemo(
    () => `${parentId}-${connectionKey}-${filtersKey}`,
    [parentId, connectionKey, filtersKey],
  )

  useEffect(() => {
    const parsedFilters: TFilters | undefined =
      filtersKey === undefined
        ? undefined
        : (JSON.parse(filtersKey) as TFilters)

    const connectionId = ConnectionHandler.getConnectionID(
      parentId,
      connectionKey,
      parsedFilters,
    )

    connectionRegistry.register(registryKey, { connectionId, nodeType })

    return () => {
      connectionRegistry.unregister(registryKey)
    }
  }, [parentId, connectionKey, nodeType, filtersKey, registryKey])
}
