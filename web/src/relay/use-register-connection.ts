import { useEffect } from 'react'
import { connectionRegistry } from './connection-registry'
import { NodeType } from './node-types'

export function useRegisterConnection(
  connectionId: string,
  nodeType: NodeType,
): void {
  useEffect(() => {
    connectionRegistry.register(connectionId, nodeType)

    return () => {
      connectionRegistry.unregister(connectionId, nodeType)
    }
  }, [connectionId, nodeType])
}
