import { nrepl } from "../../deps.ts";
import { Diced } from "../../types.ts";

import * as interceptor from "../../interceptor/core.ts";
import * as msg from "../../message/core.ts";

async function handler(diced: Diced, conn: nrepl.NreplClient) {
  try {
    while (!conn.isClosed) {
      const params = { connection: conn };
      await interceptor.execute(diced, "read", params, async (ctx) => {
        ctx.params["response"] = await ctx.params["connection"].read();
        return ctx;
      });
    }
  } catch (_err) {
    if (!conn.isClosed) {
      conn.close();
    }
  }
}

export async function connect(
  diced: Diced,
  hostname: string,
  port: number,
): Promise<boolean> {
  try {
    if (diced.connectionManager.ports.indexOf(port) !== -1) {
      msg.info(diced, "AlreadyConnected");
      return false;
    }

    const conn = await nrepl.connect({ hostname: hostname, port: port });
    handler(diced, conn);

    const cloneRes = await conn.write({ op: "clone" });
    const session = cloneRes.getFirst("new-session");

    if (typeof session !== "string") {
      await msg.error(diced, "UnexpectedError");
      return false;
    }

    diced.connectionManager.add({ port: port, conn: conn, session: session });
    diced.connectionManager.switch(port);

    return true;
  } catch (_err) {
    await msg.error(diced, "UnexpectedError");
    return false;
  }
}

export function disconnect(diced: Diced) {
  if (!diced.connectionManager.isConnected) {
    return;
  }

  for (const conn of diced.connectionManager.connections) {
    conn.client.close();
  }

  diced.connectionManager.clear();
}
