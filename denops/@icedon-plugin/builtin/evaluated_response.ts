import { icedon } from "../deps.ts";

type InterceptorContext = icedon.InterceptorContext;

export class Interceptor extends icedon.InterceptorPlugin {
  readonly name = "icedon builtin evaluated response";
  readonly type = "evaluate";

  leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    if (ctx.arg.params["response"] === undefined) {
      return Promise.resolve(ctx);
    }
    const resp = ctx.arg.params["response"] as icedon.NreplResponse;
    for (const v of resp.get("value")) {
      if (v === null) continue;
      console.log(v);
    }
    return Promise.resolve(ctx);
  }
}
