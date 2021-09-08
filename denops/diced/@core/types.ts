import { Denops, interceptor, nrepl } from "../deps.ts";

export type Connection = {
  client: nrepl.NreplClient;
  port: number;
  session: string;
};

export interface Diced {
  readonly denops: Denops;
  connection: Connection | undefined;
  interceptors: Record<string, Array<BaseInterceptor>>;
}

//deno-lint-ignore no-explicit-any
export type AnyParams = Record<string, any>;
export type InterceptorParams = {
  diced: Diced;
  params: AnyParams;
};

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
