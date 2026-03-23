import { NodeType } from './node-types'

type ConnectionEntry = {
  connectionId: string
  nodeType: NodeType
  count: number
}

class ConnectionRegistry {
  private connections = new Map<string, ConnectionEntry>()

  register(connectionId: string, nodeType: NodeType): void {
    const key = `${nodeType}:${connectionId}`
    const existing = this.connections.get(key)

    if (existing) {
      this.connections.set(key, {
        ...existing,
        count: existing.count + 1,
      })
      return
    }

    this.connections.set(key, {
      connectionId,
      nodeType,
      count: 1,
    })
  }

  unregister(connectionId: string, nodeType: NodeType): void {
    const key = `${nodeType}:${connectionId}`
    const existing = this.connections.get(key)

    if (!existing) {
      return
    }

    if (existing.count <= 1) {
      this.connections.delete(key)
      return
    }

    this.connections.set(key, {
      ...existing,
      count: existing.count - 1,
    })
  }

  getByType(nodeType: NodeType): string[] {
    return Array.from(
      new Set(
        Array.from(this.connections.values())
          .filter((entry) => entry.nodeType === nodeType)
          .map((entry) => entry.connectionId),
      ),
    )
  }

  getAll(): string[] {
    return Array.from(
      new Set(
        Array.from(this.connections.values()).map(
          (entry) => entry.connectionId,
        ),
      ),
    )
  }
}

export const connectionRegistry = new ConnectionRegistry()
