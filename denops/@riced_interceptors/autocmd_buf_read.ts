import { BaseBufReadInterceptor, InterceptorContext, std } from "./deps.ts";

export class Interceptor extends BaseBufReadInterceptor {
  async enter(
    ctx: InterceptorContext<unknown>,
  ): Promise<InterceptorContext<unknown>> {
    if (ctx.arg.app.core.current == null) {
      return ctx;
    }

    await std.namespace.create(ctx.arg.app);

    return ctx;
  }
}
