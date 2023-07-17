import { Connection, ConnectionManager } from "../types.ts";

export class ConnectionManagerImpl implements ConnectionManager {
  readonly connections: Record<string, Connection>;

  constructor() {
    this.connections = {};
  }

  addConnection(conn: Connection): boolean {
    if (conn.id in this.connections) {
      return false;
    }

    this.connections[conn.id] = conn;
    return true;
  }

  getConnection(id: string): Connection | undefined {
    return this.connections[id];
  }

  async removeConnection(id: string): Promise<boolean> {
    const conn = this.connections[id];
    if (conn == null) {
      return false;
    }

    await conn.client.close();
    delete this.connections[id];

    return true;
  }

  async removeAllConnections(): Promise<boolean> {
    for (const id of Object.keys(this.connections)) {
      await this.removeConnection(id);
    }
    return true;
  }
}
