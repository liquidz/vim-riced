import { core, InterceptorContext, std } from "../deps.ts";

type Arg = std.evaluate.Arg;

export class EvaluatedInterceptor extends std.evaluate.BaseEvaluateInterceptor {
  async leave(ctx: InterceptorContext<Arg>): Promise<InterceptorContext<Arg>> {
    const resp = ctx.arg.params.response as core.nrepl.NreplResponse;
    const parsedContext = std.evaluate.EvaluationContextSchema.safeParse(
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
