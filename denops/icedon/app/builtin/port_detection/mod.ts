import { unknownutil } from "../../../deps.ts";
import {
  BaseInterceptor,
  InterceptorContext,
  InterceptorPlugin,
} from "../../../types.ts";
import * as denoFs from "../../util/deno/fs.ts";

class PortDetectionInterceptor extends BaseInterceptor {
  readonly name: string = "icedon_port_detection";
  readonly type: string = "connect";

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

export class Interceptor extends InterceptorPlugin {
  readonly name = "icedon builtin port detection";
  readonly interceptors = [
    new PortDetectionInterceptor(),
  ];
}
