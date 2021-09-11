import {
  BaseInterceptor,
  BasePlugin,
  InterceptorContext,
} from "../../types.ts";

import * as denoFs from "../../deno/fs.ts";

class PortDetectionInterceptor extends BaseInterceptor {
  readonly type: string = "connect";
  readonly name: string = "diced port detection";

  async enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    let port: number = ctx.request.params["port"] || NaN;
    if (!isNaN(port)) return ctx;

    try {
      const filePath = await denoFs.findFileUpwards(".nrepl-port");
      port = parseInt(await Deno.readTextFile(filePath));
    } catch (err) {
      return Promise.reject(err);
    }

    if (isNaN(port)) {
      return Promise.reject(new Deno.errors.InvalidData("port is nan"));
    }

    ctx.request.params["port"] = port;
    return ctx;
  }
}

export class Plugin extends BasePlugin {
  readonly interceptors = [
    new PortDetectionInterceptor(),
  ];
}
