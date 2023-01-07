import {
  InterceptorContext,
  InterceptorPlugin,
  NreplResponse,
} from "../types.ts";

export class Interceptor extends InterceptorPlugin {
  readonly name = "icedon builtin evaluated response";
  readonly type = "evaluate";

  leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    if (ctx.arg.params["response"] === undefined) {
      return Promise.resolve(ctx);
    }
    const resp = ctx.arg.params["response"] as NreplResponse;
    for (const v of resp.get("value")) {
      if (v === null) continue;
      console.log(v);
    }
    return Promise.resolve(ctx);
  }
}
