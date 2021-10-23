import { nrepl } from "./deps.ts";
import { Connection, Diced } from "./types.ts";
import * as coreInterceptor from "./interceptor.ts";
import * as coreConnectionManager from "./connection_manager.ts";

export async function connect(
  diced: Diced,
  hostname: string,
  port: number,
): Promise<Connection> {
  const params = {
    hostname: hostname,
    port: port,
  };

  const res = await coreInterceptor.intercept(
    diced,
    "connect",
    params,
    async (ctx) => {
      const _hostname = ctx["hostname"] ?? hostname;
      const _port = ctx["port"] ?? port;
      if (typeof _hostname !== "string" || typeof _port !== "number") {
        throw new Deno.errors.InvalidData(
          "hostname or port number is invalid.",
        );
      }

      if (coreConnectionManager.hasConnection(diced, _port)) {
        throw new Deno.errors.AlreadyExists("Already connected");
      }

      const client = await nrepl.connect({ hostname: _hostname, port: _port });
      startClientReadLoop(diced, client);

      // get session id
      const cloneResp = await client.write({ op: "clone" });
      const session = cloneResp.getFirst("new-session");
      if (typeof session !== "string") {
        throw new Deno.errors.InvalidData("session id is not string");
      }

      const connection: Connection = {
        client: client,
        port: _port,
        session: session,
      };

      if (
        coreConnectionManager.addConnection(diced, connection)
      ) {
        coreConnectionManager.switchConnection(diced, _port);
      }

      ctx["connection"] = connection;
      return ctx;
    },
  );

  return res["connection"];
}

async function startClientReadLoop(diced: Diced, client: nrepl.NreplClient) {
  try {
    while (!client.isClosed) {
      const params = { client: client };
      await coreInterceptor.intercept(diced, "read", params, async (ctx) => {
        const _client = ctx["client"] as nrepl.NreplClient;
        ctx["response"] = await _client.read();
        return ctx;
      });
    }
  } catch (_err) {
    if (!client.isClosed) {
      client.close();
    }
  }
}
