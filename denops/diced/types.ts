import { Denops, interceptor, nrepl } from "./deps.ts";

// Re-export
export type Bencode = nrepl.bencode.Bencode;
export type BencodeObject = nrepl.bencode.BencodeObject;
export type NreplDoneResponse = nrepl.NreplDoneResponse;

// =core {{{
export interface Connection {
  type: "clj" | "cljs";
  client: nrepl.NreplClient;
  port: number;
  session: string;
}

export interface ConnectionManager {
  // Connection Name=> Connection
  connectionMap: Record<string, Connection>;
  currentName: string;
  current: Connection | undefined;
}

export interface Diced {
  readonly denops: Denops;
  connection: ConnectionManager;
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

export abstract class BasePlugin {
  readonly apis: Array<API> = [];
  readonly commands: Array<Command> = [];
  readonly interceptors: Array<BaseInterceptor> = [];

  onInit(_diced: Diced): Promise<void> {
    return Promise.resolve();
  }
}

// =nREPL {{{
export interface NreplEvalOption {
  context?: nrepl.Context;
  session?: string;
  column?: number;
  filePath?: string;
  line?: number;
  namespace?: string;
}
// }}}

// 0-based
export interface Cursor {
  line: number;
  column: number;
}

export interface Command {
  name: string;
  nargs?: string;
  range?: boolean;
  complete?: string;
  args?: string;
  plug?: string;
  run: (diced: Diced, args: unknown[]) => Promise<void>;
}

export interface API {
  name: string;
  run: (diced: Diced, args: unknown[]) => Promise<unknown>;
}

// vim: fdm=marker fdl=0
