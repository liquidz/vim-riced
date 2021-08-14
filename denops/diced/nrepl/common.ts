import { nrepl } from "../deps.ts";
import { Diced, NreplOp } from "../types.ts";
import { execute } from "../interceptor/core.ts";

export async function request(
  diced: Diced,
  op: NreplOp,
  message: nrepl.NreplRequest,
  context?: nrepl.Context,
): Promise<nrepl.NreplDoneResponse> {
  if (!diced.connectionManager.isConnected) {
    return Promise.reject("FIXME not connected");
  }
  const conn = diced.connectionManager.currentConnection;

  message["op"] = op;
  message["id"] ??= crypto.randomUUID();
  message["session"] ??= conn.session;

  const res = await execute(
    diced,
    op,
    { message: message, context: context },
    async (ctx) => {
      ctx.params["response"] = await conn.client.write(
        ctx.params["message"],
        ctx.params["context"] || {},
      );
      return ctx;
    },
  );

  return res["response"];
}
