import {
  BaseInterceptor,
  BasePlugin,
  Command,
  InterceptorContext,
  NreplDoneResponse,
} from "../../types.ts";

import * as core from "../../core/mod.ts";
import * as msg from "../../std/message/core.ts";

class DebuggingEvaluationInterceptor extends BaseInterceptor {
  readonly type: string = "eval";
  readonly name: string = "debugging evaluation";

  enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    console.log(">>>>> REQUEST");
    console.log(ctx.request.params["message"]);
    return Promise.resolve(ctx);
  }

  leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    if (ctx.response != null) {
      const done = ctx.response.params["response"] as NreplDoneResponse;
      console.log("<<<<< RESPONSE");
      for (const res of done.responses) {
        console.log(res.response);
      }
    }
    return Promise.resolve(ctx);
  }
}

const ToggleDebug: Command = {
  name: "ToggleDebug",
  run: (diced, _) => {
    const debug = new DebuggingEvaluationInterceptor();
    if (core.hasInterceptor(diced, debug)) {
      core.removeInterceptor(diced, debug);
      msg.info(diced, "Disabled", { name: "debug" });
    } else {
      core.addInterceptor(diced, debug);
      msg.info(diced, "Enabled", { name: "debug" });
    }

    return Promise.resolve();
  },
};

export class Plugin extends BasePlugin {
  readonly commands = [ToggleDebug];
}
