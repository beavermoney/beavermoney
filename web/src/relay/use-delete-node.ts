import { useCallback } from 'react'
import { connectionRegistry } from './connection-registry'
import { NodeType } from './node-types'

export function useDeleteNode(
  nodeType: NodeType,
): <T>(mutationCommit: (connections: string[]) => T) => T {
  return useCallback(
    <T>(mutationCommit: (connections: string[]) => T): T => {
      const connections = connectionRegistry.getByType(nodeType)
      return mutationCommit(connections)
    },
    [nodeType],
  )
}
