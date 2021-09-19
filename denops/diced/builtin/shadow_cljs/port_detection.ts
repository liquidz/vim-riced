import { BaseInterceptor, InterceptorContext } from "../../types.ts";
import { fs, path, unknownutil } from "../../deps.ts";

import { CandidateName } from "./constant.ts";
import * as denoFs from "../../deno/fs.ts";

export class PortDetectionInterceptor extends BaseInterceptor {
  readonly type = "connect";
  readonly name = "diced shadow-cljs port detection";
  readonly requires = ["diced port detection"];

  async enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    let port = NaN;
    const currentPort: number = ctx.request.params["port"] || NaN;

    try {
      const dotShadowCljs = await denoFs.findFileUpwards(".shadow-cljs");
      const filePath = path.join(dotShadowCljs, "nrepl.port");
      if (await fs.exists(filePath)) {
        port = parseInt(await Deno.readTextFile(filePath));
      }
    } catch (_err) {
      // do nothing
    }

    // No port found
    if (isNaN(port)) {
      return ctx;
    }

    if (isNaN(currentPort)) {
      ctx.request.params["port"] = port;
    } else {
      const candidates =
        unknownutil.isArray(ctx.request.params["portCandidates"])
          ? ctx.request.params["portCandidates"]
          : [];

      candidates.push({ name: "nREPL", port: currentPort });
      candidates.push({ name: CandidateName, port: port });
      ctx.request.params["portCandidates"] = candidates;
    }
    return ctx;
  }
}
