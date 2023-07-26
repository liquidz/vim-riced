import { nrepl } from "./deps.ts";

export type ConnectionType = "clojure" | "clojurescript";

export type Connection = {
  readonly id: string;
  readonly hostname: string;
  readonly port: number;
  readonly client: nrepl.NreplClient;

  baseDirectory: string | undefined;
  type: ConnectionType | undefined;
  session: string | undefined;
};

export type ConnectionManager = {
  readonly connections: Record<string, Connection>;

  addConnection(conn: Connection): boolean;
  getConnection(id: string): Connection | undefined;
  removeConnection(id: string): Promise<boolean>;
  removeAllConnections(): Promise<boolean>;
};

export type ConnectParameter = {
  hostname?: string;
  port: number;
  baseDirectory?: string;
};

export type Core = {
  readonly connectionManager: ConnectionManager;

  connect(param: ConnectParameter): Promise<boolean>;

  disconnect(): Promise<boolean>;
  disconnectAll(): Promise<boolean>;

  current: Connection | undefined;

  switchConnection(id: string): boolean;

  request(
    message: nrepl.bencode.BencodeObject,
    option?: nrepl.NreplWriteOption,
  ): Promise<nrepl.NreplResponse>;
};
