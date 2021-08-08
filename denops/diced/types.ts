import { Denops, interceptor, nrepl } from "./deps.ts";

// 0-based
export type Cursor = {
  line: number;
  column: number;
};

// 0-based
export type LineRange = {
  startLine: number;
  endLine: number;
};

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

export interface Diced {
  readonly denops: Denops;
  readonly interceptors: Record<InterceptorType, BaseInterceptor[]>;
  readonly connectionManager: ConnectionManager;
}

export type Params = Record<string, any>;
export type InterceptorParams = {
  diced: Diced;
  params: Params;
};

export type InterceptorType =
  | "connect"
  | "disconnect"
  | "eval"
  | "none";

export type InterceptorContext = interceptor.Context<InterceptorParams>;

export abstract class BaseInterceptor
  implements interceptor.Interceptor<InterceptorParams> {
  readonly type: InterceptorType = "none";
  readonly name: string = "none";
  readonly requires?: string[];

  enter(
    ctx: InterceptorContext,
  ): Promise<InterceptorContext> {
    return Promise.resolve(ctx);
  }

  leave(
    ctx: InterceptorContext,
  ): Promise<InterceptorContext> {
    return Promise.resolve(ctx);
  }
}
