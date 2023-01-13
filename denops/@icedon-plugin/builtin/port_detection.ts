import { icedon, unknownutil } from "../deps.ts";
import * as denoFs from "../util/deno/fs.ts";

type InterceptorContext = icedon.InterceptorContext;

export class Interceptor extends icedon.InterceptorPlugin {
  readonly group = "connect";

  async enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    const currentPort = ctx.arg.params["port"];
    if (unknownutil.isNumber(currentPort) && !isNaN(currentPort)) {
      return ctx;
    }

    const filePath = denoFs.findFileUpwards(".nrepl-port");
    const port = parseInt(await Deno.readTextFile(filePath));

    if (isNaN(port)) {
      throw new Deno.errors.InvalidData("port is NaN");
    }

    ctx.arg.params["port"] = port;
    return ctx;
  }
}
