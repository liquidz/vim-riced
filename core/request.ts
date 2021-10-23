import { nrepl } from "./deps.ts";
import { Connection, Diced } from "./types.ts";
import * as coreInterceptor from "./interceptor.ts";

function selectConnection(
  diced: Diced,
  portStr: string,
): Connection | undefined {
  const conn = diced.connectionManager.connections[portStr];
  return (conn == null) ? diced.connectionManager.current : conn;
}

export async function request(
  diced: Diced,
  message: nrepl.NreplRequest,
  context?: nrepl.Context,
): Promise<nrepl.NreplDoneResponse> {
  const portStr = (context ?? {})["port"];
  const conn = selectConnection(diced, portStr);

  if (conn == null || conn.client.isClosed) {
    throw new Deno.errors.NotConnected();
  }

  const op = message["op"];
  if (typeof op !== "string" || op === "") {
    throw new Deno.errors.InvalidData("op must be a string");
  }

  message["id"] ??= crypto.randomUUID();
  message["session"] ??= conn.session;

  const params = {
    message: message,
    context: context,
  };

  const res = await coreInterceptor.intercept(
    diced,
    op,
    params,
    async (ctx) => {
      const _message = ctx["message"];
      if (!nrepl.bencode.isObject(_message)) {
        return new Deno.errors.InvalidData();
      }

      ctx["response"] = await conn.client.write(_message, ctx["context"] ?? {});
      return ctx;
    },
  );

  return res["response"];
}
