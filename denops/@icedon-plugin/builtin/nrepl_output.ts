import { icedon } from "../deps.ts";
import * as api from "../api.ts";

type InterceptorContext = icedon.InterceptorContext;

export class Interceptor extends icedon.InterceptorPlugin {
  readonly type = "read";
  readonly pluginRequires = ["builtin/info_buffer"];

  async leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    const resp = ctx.arg.params["response"] as icedon.NreplResponse;
    const isVerbose = resp.context["verbose"] !== "false";

    if (isVerbose) {
      const out = resp.getOne("out");
      if (typeof (out) === "string") {
        await api.infoBuffer.append(ctx.arg.app, out.split(/\r?\n/));
      }

      const err = resp.getOne("err");
      if (typeof (err) === "string") {
        await api.infoBuffer.append(ctx.arg.app, err.split(/\r?\n/));
      }

      const ex = resp.getOne("ex");
      if (typeof (ex) === "string") {
        await api.infoBuffer.append(ctx.arg.app, ex.split(/\r?\n/));
      }

      const pprintOut = resp.getOne("pprint-out");
      if (typeof (pprintOut) === "string") {
        await api.infoBuffer.append(ctx.arg.app, pprintOut.split(/\r?\n/));
      }
    }

    return ctx;
  }
}
