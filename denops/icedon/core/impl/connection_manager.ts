import {
  Connection,
  ConnectionManager,
  ConnectOption,
  HandlerCallback,
  NreplClient,
  NreplMessage,
  NreplResponse,
  NreplWriteOption,
} from "../types.ts";
import { async, nrepl, unknownutil } from "../../deps.ts";

type Signal = async.Deferred<void>;

async function nreplReadHandler(
  signal: Signal,
  client: nrepl.NreplClient,
  callback?: HandlerCallback,
) {
  try {
    while (!client.isClosed) {
      const resp = await client.read();
      if (callback !== undefined) {
        callback(resp);
      }
    }
  } catch (_err) {
    if (!client.isClosed) {
      client.close();
    }
  } finally {
    signal.resolve();
  }
}

export class ConnectionManagerImpl implements ConnectionManager {
  connections: Record<string, Connection>;
  currentId: string;

  private signalMap: Record<string, Signal>;

  constructor() {
    this.connections = {};
    this.currentId = "";
    this.signalMap = {};
  }

  private addConnectionToManager(conn: Connection, signal: Signal): void {
    if (conn.client.isClosed) {
      return;
    }

    this.connections[conn.id] = conn;
    this.currentId = conn.id;
    this.signalMap[conn.id] = signal;
  }

  private async removeConnectionFromManager(conn: Connection): Promise<void> {
    delete this.connections[conn.id];
    if (conn.id === this.currentId) {
      const keys = Object.keys(this.connections);
      this.currentId = (keys.length === 0) ? "" : keys[0];
    }

    if (!conn.client.isClosed) {
      conn.client.close();
    }

    const signal = this.signalMap[conn.id];
    if (signal !== undefined) {
      signal.resolve();
      await signal;
      delete this.signalMap[conn.id];
    }
  }

  current(): Connection | undefined {
    if (this.currentId === "") {
      return undefined;
    }
    return this.connections[this.currentId];
  }

  async connectByClient(
    client: NreplClient,
    option?: ConnectOption,
  ): Promise<boolean> {
    let session: string | undefined = undefined;

    // Start to read bencode from nREPL server
    const signal = async.deferred<void>();
    nreplReadHandler(signal, client, option?.handlerCallback);

    const describeResp = await client.write({ op: "describe" });
    const ops = describeResp.getOne("ops");
    if (unknownutil.isObject(ops)) {
      const supportedOps = Object.keys(ops);
      if (supportedOps.indexOf("clone") !== -1) {
        const cloneResp = await client.write({ op: "clone" });
        const newSession = cloneResp.getOne("new-session");
        if (typeof newSession !== "string") {
          return false;
        }
        session = newSession;
      }
    }
    const id = crypto.randomUUID();
    const remote = client.conn.remoteAddr as Deno.NetAddr;
    const conn: Connection = {
      id: id,
      host: remote.hostname,
      port: remote.port,
      type: "clojure",
      client: client,
      session: session,
      baseDirectory: option?.baseDirectory,
    };
    this.addConnectionToManager(conn, signal);
    return true;
  }

  async connect(
    host: string,
    port: number,
    option?: ConnectOption,
  ): Promise<boolean> {
    const client = await nrepl.connect({ hostname: host, port: port });
    return this.connectByClient(client, option);
  }

  async disconnect(): Promise<boolean> {
    const conn = this.current();
    if (conn === undefined) {
      return Promise.resolve(false);
    }
    await this.removeConnectionFromManager(conn);
    return true;
  }

  async request(
    message: NreplMessage,
    option?: NreplWriteOption,
  ): Promise<NreplResponse | Error> {
    const conn = this.current();
    if (conn === undefined) {
      return new Deno.errors.NotConnected();
    }

    if (message["session"] === undefined && conn.session !== undefined) {
      message["session"] = conn.session;
    }

    return await conn.client.write(message, option);
  }
}
