import { InterceptorContext, std } from "./deps.ts";

type Arg = std.disconnect.Arg;

export class Interceptor extends std.disconnect.BaseDisconnectInterceptor {
  async leave(ctx: InterceptorContext<Arg>): Promise<InterceptorContext<Arg>> {
    if (ctx.arg.params.isDisconnected === true) {
      await std.message.info(
        ctx.arg.app,
        "disconnected",
      );
    }
    return ctx;
  }
}
