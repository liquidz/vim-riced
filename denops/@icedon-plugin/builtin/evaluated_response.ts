import { icedon, unknownutil } from "../deps.ts";
import * as api from "../api.ts";

type InterceptorContext = icedon.InterceptorContext;

export class Interceptor extends icedon.InterceptorPlugin {
  readonly name = "com.github.liquidz.builtin.evaluated_response";
  readonly type = "evaluate";
  readonly pluginRequires = ["com.github.liquidz.builtin.message"];

  async leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    if (ctx.arg.params["response"] === undefined) {
      return Promise.resolve(ctx);
    }
    const resp = ctx.arg.params["response"] as icedon.NreplResponse;
    for (const v of resp.get("value")) {
      if (!unknownutil.isString(v)) {
        continue;
      }

      await api.log.raw(ctx.arg.app, v);
    }
    return ctx;
  }
}
