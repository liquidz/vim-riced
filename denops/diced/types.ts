import { Denops, interceptor, nrepl } from "./deps.ts";

export type NreplOp =
  // nrepl built-in
  | "close"
  | "describe"
  | "eval"
  | "interrupt"
  | "load-file"
  // cider-nrepl
  | "complete"
  | "ns-vars-with-meta"
  | "test-var-query";

// 0-based
export type Cursor = {
  line: number;
  column: number;
};

export type Connection = {
  client: nrepl.NreplClient;
  session: string;
  initialNamespace?: string;
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
  readonly interceptors: { [key in InterceptorType]+?: BaseInterceptor[] };
  readonly connectionManager: ConnectionManager;
}

//deno-lint-ignore no-explicit-any
export type Params = Record<string, any>;
export type InterceptorParams = {
  diced: Diced;
  params: Params;
};

export type InterceptorType =
  | "connect"
  | "disconnect"
  | "none"
  | NreplOp;

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

export type NreplEvalOption = {
  context?: nrepl.Context;
  session?: string;
  column?: number;
  filePath?: string;
  line?: number;
  namespace?: string;
};

export type CompleteCandidate = {
  word: string;
  kind?: string;
  menu?: string;
  info?: string;
  icase?: number;
};
