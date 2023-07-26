import { BaseVimLeaveInterceptor, InterceptorContext } from "./deps.ts";

export class Interceptor extends BaseVimLeaveInterceptor {
  async enter(
    ctx: InterceptorContext<unknown>,
  ): Promise<InterceptorContext<unknown>> {
    await ctx.arg.app.core.disconnectAll();
    return ctx;
  }
}
