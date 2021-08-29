import {
  BaseInterceptor,
  InterceptorContext,
  InterceptorType,
} from "../types.ts";
import * as denoFs from "../deno/fs.ts";
import * as msg from "../message/core.ts";
import * as nreplNs from "../nrepl/namespace.ts";
import * as nreplEval from "../nrepl/eval.ts";
import * as bufNs from "../buffer/namespace.ts";
import * as vimBufInfo from "../vim/buffer/info.ts";

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
    if (!result) {
      await msg.error(diced, "ConnectError");
      return ctx;
    }

    // set initial namespace
    const initialNamespace = await nreplNs.name(diced);
    diced.connectionManager.currentConnection.initialNamespace =
      initialNamespace;

    // switch namespace
    const currentBufferNamespace = await bufNs.extractName(diced);
    if (currentBufferNamespace === initialNamespace) {
      await nreplNs.inNs(diced, currentBufferNamespace);
    } else {
      if (await nreplEval.loadFile(diced)) {
        await nreplNs.inNs(diced, currentBufferNamespace);
      }
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

export class BufferInitializationInterceptor extends BaseInterceptor {
  readonly type: InterceptorType = "connect";
  readonly name: string = "diced buffer initialization";

  async leave(
    ctx: InterceptorContext,
  ): Promise<InterceptorContext> {
    const denops = ctx.request.diced.denops;
    await vimBufInfo.ready(denops);
    return ctx;
  }
}
