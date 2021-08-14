import {
  BaseInterceptor,
  InterceptorContext,
  InterceptorType,
} from "../../types.ts";
import { vars } from "../../deps.ts";

export class NormalizeCodeInterceptor extends BaseInterceptor {
  readonly type: InterceptorType = "eval";
  readonly name: string = "normalize code";

  async enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    const msg = ctx.request.params["message"] ?? {};
    const code = msg["code"] ?? "";
    if (code === "") return ctx;

    const flag = await vars.g.get(
      ctx.request.diced.denops,
      "diced_does_eval_inside_comment",
    );
    if (flag !== true) return ctx;

    msg["code"] = code.replace(/^\(comment/, "(do");
    ctx.request.params["message"] = msg;
    return ctx;
  }
}
