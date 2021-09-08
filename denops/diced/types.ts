//import { Denops, interceptor, nrepl } from "./deps.ts";
import { nrepl } from "./deps.ts";
import { Diced } from "./@core/types.ts";

// Re export
export { BaseInterceptor } from "./@core/types.ts";
export type {
  AnyParams,
  Connection,
  Diced,
  InterceptorContext,
  InterceptorParams,
} from "./@core/types.ts";

export type NreplOp =
  // nrepl built-in
  | "close"
  | "describe"
  | "eval"
  | "interrupt"
  | "load-file"
  // cider-nrepl
  | "complete"
  | "info"
  | "ns-path"
  | "ns-vars-with-meta"
  | "test-var-query";

// 0-based
export type Cursor = {
  line: number;
  column: number;
};

// export type Connection = {
//   client: nrepl.NreplClient;
//   session: string;
//   initialNamespace?: string;
// };
//
// export interface ConnectionManager {
//   isConnected: boolean;
//   currentConnection: Connection;
//   ports: number[];
//   connections: Connection[];
//   add(
//     { port, conn, session }: {
//       port: number;
//       conn: nrepl.NreplClient;
//       session: string;
//     },
//   ): void;
//   switch(port: number): void;
//   remove(port: number): void;
//   clear(): void;
// }
//
// export interface Diced {
//   readonly denops: Denops;
//   readonly interceptors: { [key in InterceptorType]+?: BaseInterceptor[] };
//   readonly connectionManager: ConnectionManager;
// }
//
// //deno-lint-ignore no-explicit-any
// export type Params = Record<string, any>;
// export type InterceptorParams = {
//   diced: Diced;
//   params: Params;
// };
//
// export type InterceptorType =
//   | "connect"
//   | "disconnect"
//   | "read"
//   | "none"
//   | NreplOp;
//
// export type InterceptorContext = interceptor.Context<InterceptorParams>;
//
// export abstract class BaseInterceptor
//   implements interceptor.Interceptor<InterceptorParams> {
//   readonly type: InterceptorType = "none";
//   readonly name: string = "none";
//   readonly requires?: string[];
//
//   enter(
//     ctx: InterceptorContext,
//   ): Promise<InterceptorContext> {
//     return Promise.resolve(ctx);
//   }
//
//   leave(
//     ctx: InterceptorContext,
//   ): Promise<InterceptorContext> {
//     return Promise.resolve(ctx);
//   }
// }

export type Command = {
  name: string;
  nargs?: string;
  range?: boolean;
  complete?: string;
  args?: string;
  plug?: string;
  run: (diced: Diced, args: unknown[]) => Promise<void>;
};

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

export type ParsedTestSummary = {
  isSuccess: boolean;
  summary: string;
};

export type ParsedTestError = {
  filename: string;
  text: string;
  expected: string;
  actual: string;
  type: string;
  var: string;
  lnum?: number;
  diffs?: string;
};

export type ParsedTestPass = {
  var: string;
};

export type ParsedTestActualValue = {
  actual: string;
  diffs?: string;
};

export type ParsedTestResult = {
  errors: Array<ParsedTestError>;
  passes: Array<ParsedTestPass>;
  summary: ParsedTestSummary;
};
