import {
  BaseInterceptor,
  BasePlugin,
  InterceptorContext,
} from "../../types.ts";

import { dpsVars } from "../../deps.ts";

class NormalizeCodeInterceptor extends BaseInterceptor {
  readonly type: string = "eval";
  readonly name: string = "normalize code";

  async enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    const msg = ctx.arg.params["message"] ?? {};
    const code = msg["code"] ?? "";
    if (code === "") return ctx;

    const flag = await dpsVars.g.get(
      ctx.arg.diced.denops,
      "diced_does_eval_inside_comment",
    );
    if (flag !== true) return ctx;

    msg["code"] = code.replace(/^\(comment/, "(do");
    ctx.arg.params["message"] = msg;
    return ctx;
  }
}

export class Plugin extends BasePlugin {
  readonly interceptors = [
    new NormalizeCodeInterceptor(),
  ];
}
