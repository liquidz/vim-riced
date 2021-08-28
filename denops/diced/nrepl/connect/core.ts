import { nrepl } from "../../deps.ts";
import { Diced } from "../../types.ts";
import * as msg from "../../message/core.ts";

// Re export
export * from "./manager.ts";

async function handler(conn: nrepl.NreplClient) {
  try {
    while (!conn.isClosed) {
      const res = await conn.read();
      const isVerbose = (res.context["verbose"] !== "false");
      const out = res.getFirst("out");

      if (typeof out === "string" && isVerbose) {
        console.log(out);
      }
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
    handler(conn);

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
