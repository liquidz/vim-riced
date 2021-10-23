import { Connection, ConnectionManager, Diced } from "./types.ts";

export class ConnectionManagerImpl implements ConnectionManager {
  connections = {};
  current = undefined;
}

export function hasConnection(diced: Diced, port: number): boolean {
  return (diced.connectionManager.connections[port.toString()] != null);
}

export function addConnection(diced: Diced, c: Connection): boolean {
  const portStr = c.port.toString();
  if (diced.connectionManager.connections[portStr] != null) return false;
  diced.connectionManager.connections[portStr] = c;
  return true;
}

export function switchConnection(diced: Diced, port: number): boolean {
  const conn = diced.connectionManager.connections[port.toString()];
  if (conn != null) return false;

  diced.connectionManager.current = conn;
  return true;
}
