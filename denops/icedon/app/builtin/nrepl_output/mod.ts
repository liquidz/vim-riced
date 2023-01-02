import {
  //App,
  BaseInterceptor,
  InterceptorContext,
  InterceptorPlugin,
} from "../../../types.ts";
import { NreplResponse } from "../../../core/types.ts";

class NreplOutputInterceptor extends BaseInterceptor {
  readonly name: string = "icedon_nrepl_output";
  readonly type: string = "read";

  leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    const resp = ctx.arg.params["response"] as NreplResponse;
    const isVerbose = (resp.context["verbose"] !== "false");

    if (isVerbose) {
      // ctx.arg.app.denops
      const out = resp.getOne("out");
      if (typeof (out) === "string") {
        console.log(out);
      }
      //
      // appendToBuf(diced, res.getFirst("out"));
      // appendToBuf(diced, res.getFirst("err"));
      // appendToBuf(diced, res.getFirst("ex"));
      // appendToBuf(diced, res.getFirst("pprint-out"));
    }

    // if (unknownutil.isObject<NreplResponse>(resp)) {
    // }
    return Promise.resolve(ctx);
  }
}

export class Interceptor extends InterceptorPlugin {
  readonly name = "icedon builtin nrepl debug";
  readonly interceptors = [new NreplOutputInterceptor()];

  // onInit(_app: App): Promise<void> {
  //   return Promise.resolve();
  // }
}
