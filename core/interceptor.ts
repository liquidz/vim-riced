import { interceptor } from "./deps.ts";
import { AnyParams, Context, Diced, Handler, Interceptor } from "./types.ts";

import * as coreInterceptorManager from "./interceptor_manager.ts";

class HandlerInterceptor implements Interceptor {
  readonly name: string = "__handler__";
  readonly handler: Handler;

  constructor(handler: Handler) {
    this.handler = handler;
  }

  async enter(ctx: Context): Promise<Context> {
    const res = await this.handler(ctx.arg);
    if (res instanceof Error) throw res;
    ctx.arg = res;
    return ctx;
  }
}

export async function intercept(
  diced: Diced,
  interceptorType: string,
  param: AnyParams,
  handler: Handler,
): Promise<AnyParams> {
  const interceptors = [
    ...coreInterceptorManager.getInterceptors(diced, interceptorType),
    new HandlerInterceptor(handler),
  ];
  return await interceptor.execute<AnyParams>(interceptors, param);
}
