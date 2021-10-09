import {
  BaseInterceptor,
  BasePlugin,
  Diced,
  InterceptorContext,
} from "../../types.ts";

import * as bufNs from "../../std/buffer/namespace.ts";
import * as bufConn from "../../std/buffer/connection.ts";
import * as stdFn from "../../std/fn/mod.ts";
import * as nreplNs from "../../std/nrepl/namespace.ts";

const requireNs = stdFn.memoize((diced: Diced, nsName: string) => {
  return nreplNs.require(diced, nsName);
}, ([_, nsName]) => nsName);

class AutoRequiringNsInterceptor extends BaseInterceptor {
  readonly type: string = "vimBufEnter";
  readonly name: string = "AutoInNsInterceptor";

  async leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    const diced = ctx.arg.diced;
    if (!await bufConn.isValid(diced)) return ctx;

    try {
      const nsName = await bufNs.extractName(diced);
      await requireNs(diced, nsName);
      await nreplNs.inNs(ctx.arg.diced, nsName);
    } catch (_) {
      // do nothing
    }

    return ctx;
  }
}

export class Plugin extends BasePlugin {
  readonly interceptors = [
    new AutoRequiringNsInterceptor(),
  ];
}
