import { interceptor, nrepl } from "../deps.ts";
import { Diced } from "../types.ts";
import * as coreInterceptor from "./interceptor.ts";
import * as connManager from "./connection/manager.ts";

export function isConnected(diced: Diced): boolean {
  if (diced.connection.current == null) return false;
  return !diced.connection.current.client.isClosed;
}

export function session(diced: Diced): string {
  return isConnected(diced) ? diced.connection.current!.session : "";
}

async function nReplClientHandler(diced: Diced, conn: nrepl.NreplClient) {
  try {
    while (!conn.isClosed) {
      const params = { connection: conn };
      await coreInterceptor.intercept(diced, "read", params, async (ctx) => {
        const conn = ctx.params["connection"] as nrepl.NreplClient;
        ctx.params["response"] = await conn.read();
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
    const params = {
      host: hostname,
      port: port,
    };

    await coreInterceptor.intercept(diced, "connect", params, async (ctx) => {
      const _host = ctx.params["host"] ?? hostname;
      const _port = ctx.params["port"] ?? port;

      if (_host === "" || _port <= 0) {
        return Promise.reject(
          new Deno.errors.ConnectionAborted("hostname or port is invalid"),
        );
      }

      if (connManager.hasConnection(diced.connection, _port)) {
        return Promise.reject(
          new Deno.errors.AlreadyExists("Already connected"),
        );
      }

      const conn = await nrepl.connect({ hostname: _host, port: _port });

      // Start to read bencode from nREPL server
      nReplClientHandler(diced, conn);

      // Fetch session id for this connection
      const cloneRes = await conn.write({ op: "clone" });
      const session = cloneRes.getFirst("new-session");
      if (typeof session !== "string") {
        return Promise.reject(
          new Deno.errors.InvalidData("new-session is not string"),
        );
      }

      const addResult = connManager.addConnection(diced.connection, "dummy", {
        type: "clj",
        client: conn,
        port: _port,
        session: session,
      });
      if (addResult) {
        connManager.switchConnection(diced.connection, "dummy");
      }

      ctx.params["connection"] = conn;
      return ctx;
    });

    return true;
  } catch (err) {
    if (err instanceof interceptor.ExecutionError) {
      return Promise.reject(err);
    } else {
      return Promise.reject(new Deno.errors.ConnectionRefused(err.message));
    }
  }
}

export async function disconnect(diced: Diced) {
  if (!isConnected(diced)) return;

  await coreInterceptor.intercept(diced, "disconnect", {}, (ctx) => {
    const conn = ctx.diced.connection.current;
    if (conn != null) {
      conn.client.close();
      ctx.diced.connection.currentName = "";
      //ctx.diced.connection = undefined;
    }
    return Promise.resolve(ctx);
  });
}
