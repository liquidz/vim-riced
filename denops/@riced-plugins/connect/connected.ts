import { InterceptorContext, InterceptorExecutionError, std } from "../deps.ts";

type Arg = std.connect.Arg;

export class ConnectedInterceptor extends std.connect.BaseConnectInterceptor {
  async leave(ctx: InterceptorContext<Arg>): Promise<InterceptorContext<Arg>> {
    if (ctx.arg.params.doesConnected === true) {
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
