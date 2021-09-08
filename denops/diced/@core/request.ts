import { nrepl } from "../deps.ts";
import { Diced } from "./types.ts";
import { isConnected } from "./connection.ts";
import { intercept } from "./interceptor.ts";

export async function request(
  diced: Diced,
  message: nrepl.NreplRequest,
  context?: nrepl.Context,
): Promise<nrepl.NreplDoneResponse> {
  const conn = diced.connection;
  if (conn == null || !isConnected(diced)) {
    return Promise.reject(new Deno.errors.NotConnected());
  }

  const op = message["op"];
  if (typeof op !== "string" || op === "") {
    return Promise.reject(new Deno.errors.InvalidData());
  }

  message["id"] ??= crypto.randomUUID();
  message["session"] ??= conn.session;

  const params = {
    message: message,
    context: context,
  };
  const res = await intercept(diced, op, params, async (ctx) => {
    const msg = ctx.params["message"];
    if (!nrepl.bencode.isObject(msg)) {
      return new Deno.errors.InvalidData();
    }
    ctx.params["response"] = await conn.client.write(
      msg,
      ctx.params["context"] || {},
    );

    return ctx;
  });

  return res["response"];
}
