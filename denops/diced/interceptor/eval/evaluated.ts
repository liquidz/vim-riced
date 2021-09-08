import { BaseInterceptor, InterceptorContext } from "../../types.ts";
import { nrepl } from "../../deps.ts";

import * as msg from "../../message/core.ts";

export class EvaluatedInterceptor extends BaseInterceptor {
  readonly type: string = "eval";
  readonly name: string = "diced evaluated result";

  leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    if (ctx.response == null) return Promise.resolve(ctx);

    const done = ctx.response.params["response"] as nrepl.NreplDoneResponse;
    const verbose = (done.context["verbose"] ?? "true") === "true";
    if (!verbose) return Promise.resolve(ctx);

    const diced = ctx.response.diced;
    const values = done.getAll("value");
    for (const v of values) {
      if (typeof v !== "string") continue;
      msg.echoStr(diced, v);
    }
    return Promise.resolve(ctx);
  }
}
