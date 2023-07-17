import { core, InterceptorContext, std } from "../deps.ts";

type Arg = core.nrepl.NreplOutput;

export class OutputInterceptor extends std.connect.BaseOutputInterceptor {
  leave(ctx: InterceptorContext<Arg>): Promise<InterceptorContext<Arg>> {
    const parsedContext = std.evaluate.EvaluationContextSchema.safeParse(
      ctx.arg.params.context,
    );

    if (!parsedContext.success || !parsedContext.data.silent) {
      console.log(`OUT: ${ctx.arg.params.text}`);
    }

    return Promise.resolve(ctx);
  }
}
