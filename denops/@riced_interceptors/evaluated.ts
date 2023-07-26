import { core, InterceptorContext, std } from "./deps.ts";

type Arg = std.op.nrepl.EvalArg;

export class Interceptor extends std.op.nrepl.BaseEvaluateInterceptor {
  async leave(ctx: InterceptorContext<Arg>): Promise<InterceptorContext<Arg>> {
    const resp = ctx.arg.params.response as core.nrepl.NreplResponse;
    const parsedContext = std.op.nrepl.EvalContextSchema.safeParse(
      resp.context,
    );
    const value = resp.getOne("value");

    if (
      parsedContext.success && !parsedContext.data.silent &&
      typeof value === "string"
    ) {
      await std.message.raw(ctx.arg.app, value);
    }

    return Promise.resolve(ctx);
  }
}
