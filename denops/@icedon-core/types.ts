import { nrepl } from "./deps.ts";

// Re export
export type NreplClient = nrepl.NreplClient;
export type NreplMessage = nrepl.NreplMessage;
export type NreplResponse = nrepl.NreplResponse;
export type NreplStatus = nrepl.NreplStatus;
export type NreplWriteOption = nrepl.NreplWriteOption;

export type ConnectionType = "clojure" | "clojurescript";

export type Connection = {
  readonly id: string;
  host: string;
  port: number;
  type: ConnectionType;
  client: NreplClient;
  session: string | undefined;
  baseDirectory: string | undefined;
};

export type HandlerCallback = (resp: NreplResponse) => NreplResponse;

export type ConnectOption = {
  baseDirectory?: string;
  handlerCallback?: HandlerCallback;
};

export type ConnectionManager = {
  readonly connections: Record<string, Connection>;
  readonly currentId: string;

  current(): Connection | undefined;
  connectByClient(
    client: NreplClient,
    option?: ConnectOption,
  ): Promise<boolean>;
  connect(host: string, port: number, option?: ConnectOption): Promise<boolean>;
  disconnect(): Promise<boolean>;
  request(
    message: NreplMessage,
    option?: NreplWriteOption,
  ): Promise<NreplResponse | Error>;
};

export type Icedon = {
  readonly connectionManager: ConnectionManager;

  current(): Connection | undefined;
  connect(host: string, port: number, option?: ConnectOption): Promise<boolean>;
  disconnect(): Promise<boolean>;
  request(
    message: NreplMessage,
    option?: NreplWriteOption,
  ): Promise<NreplResponse | Error>;
};
