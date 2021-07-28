import { nrepl } from "../deps.ts";
import { Diced } from "../types.ts";

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
  } catch (err) {
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
      console.log("FIXME already connected");
      return false;
    }

    const conn = await nrepl.connect({ hostname: hostname, port: port });
    handler(conn);

    const cloneRes = await conn.write({ op: "clone" });
    const session = cloneRes.getFirst("new-session");

    if (typeof session !== "string") {
      console.log("FIXME");
      return false;
    }

    console.log(`DEBUG session = ${session}`);

    diced.connectionManager.add({ port: port, conn: conn, session: session });
    diced.connectionManager.switch(port);

    return true;
  } catch (err) {
    console.log(`FIXME ${err}`);
    return false;
  }
}

export function disconnect(diced: Diced) {
  if (!diced.connectionManager.isConnected) {
    console.log("FIXME not connected");
    return;
  }

  for (const conn of diced.connectionManager.connections) {
    conn.client.close();
  }

  diced.connectionManager.clear();
}
