import { Denops, nrepl } from "./deps.ts";

export type Connection = {
  client: nrepl.NreplClient;
  session: string;
};

export interface ConnectionManager {
  isConnected: boolean;
  currentConnection: Connection;
  ports: number[];
  connections: Connection[];
  add(
    { port, conn, session }: {
      port: number;
      conn: nrepl.NreplClient;
      session: string;
    },
  ): void;
  switch(port: number): void;
  remove(port: number): void;
  clear(): void;
}

export type HookType =
  | "connection prepared"
  | "connecting"
  | "connected"
  | "disconnected"
  | "test finished"
  | "namespace required"
  | "session switched"
  | "evaluation prepared"
  | "evaluated"
  | "none";

export type HookParams = Record<string, any>;

export abstract class Hook {
  type: HookType = "none";
  abstract run(diced: Diced, params: HookParams): Promise<HookParams>;
}

export interface Diced {
  readonly denops: Denops;
  readonly hooks: Hook[];
  readonly connectionManager: ConnectionManager;
}
