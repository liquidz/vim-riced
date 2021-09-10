import { Connection, ConnectionManager } from "../../types.ts";

export class ConnectionManagerImpl implements ConnectionManager {
  connectionMap: Record<string, Connection>;
  currentName: string;

  constructor() {
    this.currentName = "";
    this.connectionMap = {};
  }

  get current(): Connection | undefined {
    return this.connectionMap[this.currentName];
  }
}

export function hasConnection(cm: ConnectionManager, port: number): boolean {
  return (Object.values(cm.connectionMap).some((c) => c.port === port));
}

export function addConnection(
  cm: ConnectionManager,
  name: string,
  conn: Connection,
): boolean {
  if (cm.connectionMap[name] != null) {
    return false;
  }

  if (hasConnection(cm, conn.port)) {
    return false;
  }

  cm.connectionMap[name] = conn;
  return true;
}

export function switchConnection(cm: ConnectionManager, name: string): boolean {
  if (cm.connectionMap[name] == null) {
    return false;
  }

  cm.currentName = name;
  return true;
}
