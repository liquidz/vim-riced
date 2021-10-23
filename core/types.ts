import { interceptor, nrepl } from "./deps.ts";

//deno-lint-ignore no-explicit-any
export type AnyParams = Record<string, any>;
export type Handler = (param: AnyParams) => Promise<AnyParams | Error>;

export type Interceptor = interceptor.Interceptor<AnyParams>;
export type Context = interceptor.Context<AnyParams>;

export interface Connection {
  client: nrepl.NreplClient;
  port: number;
  session: string;
}

export interface ConnectionManager {
  // str(port) => Connection
  connections: Record<string, Connection>;
  current: Connection | undefined;
}

export interface InterceptorManager {
  // interceptor type => Interceptor
  interceptors: Record<string, Array<Interceptor>>;
}

export interface Diced {
  connectionManager: ConnectionManager;
  interceptorManager: InterceptorManager;
}
