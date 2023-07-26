import { InterceptorContext, InterceptorExecutionError, std } from "./deps.ts";

type Arg = std.connect.Arg;

export class Interceptor extends std.connect.BaseConnectInterceptor {
  readonly requireOthers = true;

  async leave(ctx: InterceptorContext<Arg>): Promise<InterceptorContext<Arg>> {
    if (ctx.arg.params.isConnected === true) {
      await std.namespace.create(ctx.arg.app);

      await std.message.info(
        ctx.arg.app,
        "connected",
        ctx.arg.params.hostname ?? "",
        `${ctx.arg.params.port}`,
      );
    }
    return ctx;
  }

  async error(
    ctx: InterceptorContext<Arg>,
    _: InterceptorExecutionError<Arg>,
  ): Promise<InterceptorContext<Arg>> {
    await std.message.error(
      ctx.arg.app,
      "failedToConnect",
      ctx.arg.params.hostname ?? "",
      `${ctx.arg.params.port}`,
    );
    return ctx;
  }
}
