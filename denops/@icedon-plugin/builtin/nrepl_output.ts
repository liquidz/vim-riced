import { icedon } from "../deps.ts";
import { appendLinesToInfoBuffer } from "../api/alias.ts";

type InterceptorContext = icedon.InterceptorContext;

export class Interceptor extends icedon.InterceptorPlugin {
  readonly name = "icedon builtin nrepl debug";
  readonly type = "read";

  async leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    const resp = ctx.arg.params["response"] as icedon.NreplResponse;
    const isVerbose = resp.context["verbose"] !== "false";

    if (isVerbose) {
      const out = resp.getOne("out");
      if (typeof (out) === "string") {
        await appendLinesToInfoBuffer(ctx.arg.app, out.split(/\r?\n/));
      }

      const err = resp.getOne("err");
      if (typeof (err) === "string") {
        await appendLinesToInfoBuffer(ctx.arg.app, err.split(/\r?\n/));
      }

      const ex = resp.getOne("ex");
      if (typeof (ex) === "string") {
        await appendLinesToInfoBuffer(ctx.arg.app, ex.split(/\r?\n/));
      }

      const pprintOut = resp.getOne("pprint-out");
      if (typeof (pprintOut) === "string") {
        await appendLinesToInfoBuffer(ctx.arg.app, pprintOut.split(/\r?\n/));
      }
    }

    return ctx;
  }
}
