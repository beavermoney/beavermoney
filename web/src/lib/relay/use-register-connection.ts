import { useCallback } from 'react'
import { connectionRegistry } from './connection-registry'
import { NodeType } from './node-types'

export function useRegisterConnection(
  connectionId: string,
  nodeType: NodeType,
) {
  return useCallback(
    (element: HTMLElement | null) => {
      if (!element) return
      connectionRegistry.register(connectionId, nodeType)

      return () => {
        connectionRegistry.unregister(connectionId, nodeType)
      }
    },
    [connectionId, nodeType],
  )
}
