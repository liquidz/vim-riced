import {
  Connection,
  ConnectionManager,
  ConnectParameter,
  Core,
} from "../types.ts";
import { createConnection, getConnectionId } from "./connection.ts";
import { ConnectionManagerImpl } from "./connection_manager.ts";
import { nrepl } from "../deps.ts";

export class CoreImpl implements Core {
  readonly connectionManager: ConnectionManager;

  #currentId: string | undefined;

  constructor() {
    this.connectionManager = new ConnectionManagerImpl();
  }

  async connect({
    hostname,
    port,
    baseDirectory,
  }: ConnectParameter): Promise<boolean> {
    const id = getConnectionId({ hostname, port });

    // already connected
    if (this.connectionManager.getConnection(id) != null) {
      return false;
    }

    const conn = await createConnection({ hostname, port, baseDirectory });
    this.connectionManager.addConnection(conn);
    this.#currentId = conn.id;
    return true;
  }

  disconnect(): Promise<boolean> {
    return this.connectionManager.removeAllConnections();
  }

  get current(): Connection | undefined {
    if (this.#currentId == null) {
      return undefined;
    }

    return this.connectionManager.getConnection(this.#currentId);
  }

  switchConnection(id: string): boolean {
    if (this.connectionManager.getConnection(id) == null) {
      return false;
    }
    this.#currentId = id;
    return true;
  }

  async request(
    message: nrepl.bencode.BencodeObject,
    option?: nrepl.NreplWriteOption,
  ): Promise<nrepl.NreplResponse> {
    if (this.current == null) {
      return Promise.reject(new Deno.errors.NotConnected("no connection"));
    }

    if (this.current.session != null) {
      message.session ??= this.current.session;
    }

    return await this.current.client.write(message, option);
  }
}
