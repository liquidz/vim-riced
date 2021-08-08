import {
  BaseInterceptor,
  InterceptorContext,
  InterceptorType,
} from "../types.ts";
import * as msg from "../message/core.ts";
import { findFileUpwards } from "../util/fs.ts";

export class ConnectedInterceptor extends BaseInterceptor {
  readonly type: InterceptorType = "connect";
  readonly name: string = "diced connection";

  async leave(
    ctx: InterceptorContext,
  ): Promise<InterceptorContext> {
    await msg.info(ctx.request.diced, "Connected");

    if (ctx.response == null) return ctx;

    ctx.response.diced;

    return ctx;
  }
}

export class PortDetectionInterceptor extends BaseInterceptor {
  readonly type: InterceptorType = "connect";
  readonly name: string = "diced port detection";

  async enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    let port: number = ctx.request.params["port"] || NaN;
    if (!isNaN(port)) return ctx;

    try {
      const filePath = await findFileUpwards(".nrepl-port");
      port = parseInt(await Deno.readTextFile(filePath));
    } catch (err) {
      return Promise.reject("FIXME");
    }

    if (isNaN(port)) {
      return Promise.reject("Invali");
    }

    ctx.request.params["port"] = port;
    return ctx;
  }
}
