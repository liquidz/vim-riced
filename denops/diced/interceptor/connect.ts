import {
  BaseInterceptor,
  InterceptorContext,
  InterceptorType,
} from "../types.ts";
import { findFileUpwards } from "../util/fs.ts";
import * as msg from "../message/core.ts";
import * as ns from "../nrepl/namespace.ts";

export class ConnectedInterceptor extends BaseInterceptor {
  readonly type: InterceptorType = "connect";
  readonly name: string = "diced connection";

  async leave(
    ctx: InterceptorContext,
  ): Promise<InterceptorContext> {
    const diced = ctx.request.diced;
    if (ctx.response == null) {
      await msg.error(diced, "ConnectError");
      return ctx;
    }

    const result = ctx.response.params["result"] ?? false;
    if (result) {
      // set initial namespace
      const initialNamespace = await ns.name(diced);
      diced.connectionManager.currentConnection.initialNamespace =
        initialNamespace;
    }

    await msg.info(diced, "Connected");

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
    } catch (_err) {
      return Promise.reject("FIXME");
    }

    if (isNaN(port)) {
      return Promise.reject("Invali");
    }

    ctx.request.params["port"] = port;
    return ctx;
  }
}
