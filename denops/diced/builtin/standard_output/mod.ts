import {
  BaseInterceptor,
  BasePlugin,
  Bencode,
  Diced,
  InterceptorContext,
  NreplResponse,
} from "../../types.ts";

import * as dicedApi from "../../std/diced/api.ts";

function appendToBuf(diced: Diced, x: Bencode) {
  if (typeof x === "string") {
    dicedApi.call(diced, "info_buffer_append_lines", x.split(/\r?\n/));
  }
}

class StdOutInterceptor extends BaseInterceptor {
  readonly type: string = "read";
  readonly name: string = "diced nrepl read";

  leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    const res = ctx.arg.params["response"] as NreplResponse;
    const isVerbose = (res.context["verbose"] !== "false");

    if (isVerbose) {
      const diced = ctx.arg.diced;
      appendToBuf(diced, res.getFirst("out"));
      appendToBuf(diced, res.getFirst("err"));
      appendToBuf(diced, res.getFirst("ex"));
      appendToBuf(diced, res.getFirst("pprint-out"));
    }

    return Promise.resolve(ctx);
  }
}

export class Plugin extends BasePlugin {
  readonly interceptors = [
    new StdOutInterceptor(),
  ];
}
