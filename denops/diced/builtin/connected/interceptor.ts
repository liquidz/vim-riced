import { BaseInterceptor, InterceptorContext } from "../../types.ts";

import * as bufNs from "../../std/buffer/namespace.ts";
import * as bufConn from "../../std/buffer/connection.ts";
import * as msg from "../../std/message/core.ts";
import * as nreplEval from "../../std/nrepl/eval.ts";
import * as nreplNs from "../../std/nrepl/namespace.ts";

export class ConnectedInterceptor extends BaseInterceptor {
  readonly type: string = "connect";
  readonly name: string = "diced connection";

  async leave(
    ctx: InterceptorContext,
  ): Promise<InterceptorContext> {
    const diced = ctx.request.diced;
    if (ctx.response == null) {
      await msg.error(diced, "ConnectError");
      return ctx;
    }

    if (ctx.response.params["connection"] == null) {
      await msg.error(diced, "ConnectError");
      return ctx;
    }

    if (await bufConn.isValid(diced)) {
      // // set initial namespace
      const initialNamespace = await nreplNs.name(diced);
      // diced.connectionManager.currentConnection.initialNamespace =
      //   initialNamespace;

      // switch namespace
      const currentBufferNamespace = await bufNs.extractName(diced);
      if (currentBufferNamespace === initialNamespace) {
        await nreplNs.inNs(diced, currentBufferNamespace);
      } else {
        if (await nreplEval.loadFile(diced)) {
          await nreplNs.inNs(diced, currentBufferNamespace);
        }
      }
    }

    await msg.info(diced, "Connected");
    return ctx;
  }
}
