import { Command, Diced } from "../types.ts";

//import * as interceptor from "../interceptor/core.ts";
import * as core from "../core/mod.ts";
import * as msg from "../message/core.ts";
import * as iEvalDebug from "../interceptor/eval/debug.ts";

export const ToggleDebug: Command = {
  name: "ToggleDebug",
  run: (diced: Diced, _: unknown[]) => {
    const debug = new iEvalDebug.DebuggingEvaluationInterceptor();
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
