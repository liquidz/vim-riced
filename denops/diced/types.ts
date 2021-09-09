import { Denops, interceptor, nrepl } from "./deps.ts";

// core {{{
export interface Connection {
  client: nrepl.NreplClient;
  port: number;
  session: string;
}

export interface Diced {
  readonly denops: Denops;
  connection: Connection | undefined;
  interceptors: Record<string, Array<BaseInterceptor>>;
}

//deno-lint-ignore no-explicit-any
export type AnyParams = Record<string, any>;
export interface InterceptorParams {
  diced: Diced;
  params: AnyParams;
}

export type InterceptorContext = interceptor.Context<InterceptorParams>;

export abstract class BaseInterceptor
  implements interceptor.Interceptor<InterceptorParams> {
  readonly type: string = "none";
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
// }}}

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
export interface Cursor {
  line: number;
  column: number;
}

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

export interface Command {
  name: string;
  nargs?: string;
  range?: boolean;
  complete?: string;
  args?: string;
  plug?: string;
  run: (diced: Diced, args: unknown[]) => Promise<void>;
}

export interface NreplEvalOption {
  context?: nrepl.Context;
  session?: string;
  column?: number;
  filePath?: string;
  line?: number;
  namespace?: string;
}

export interface CompleteCandidate {
  word: string;
  kind?: string;
  menu?: string;
  info?: string;
  icase?: number;
}

export interface ParsedTestSummary {
  isSuccess: boolean;
  summary: string;
}

export interface ParsedTestError {
  filename: string;
  text: string;
  expected: string;
  actual: string;
  type: string;
  var: string;
  lnum?: number;
  diffs?: string;
}

export interface ParsedTestPass {
  var: string;
}

export interface ParsedTestActualValue {
  actual: string;
  diffs?: string;
}

export interface ParsedTestResult {
  errors: Array<ParsedTestError>;
  passes: Array<ParsedTestPass>;
  summary: ParsedTestSummary;
}
