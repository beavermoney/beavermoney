import { NodeType } from './node-types'

type ConnectionEntry = {
  connectionId: string
  nodeType: NodeType
}

class ConnectionRegistry {
  private connections = new Map<string, ConnectionEntry>()

  register(key: string, entry: ConnectionEntry): void {
    this.connections.set(key, entry)
  }

  unregister(key: string): void {
    this.connections.delete(key)
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
