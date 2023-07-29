import { Connection, ConnectionType } from "../types.ts";
import { nrepl } from "../deps.ts";

const defaultHostname = "127.0.0.1";
const nreplConnect = nrepl.connect;

export function getConnectionId({
  hostname,
  port,
  type,
}: {
  hostname?: string;
  port: number;
  type?: ConnectionType;
}): string {
  return `${hostname ?? defaultHostname}:${port}:${type ?? "unknown"}`;
}

export async function getSupportedOps(conn: Connection): Promise<Set<string>> {
  const describeResp = await conn.client.write({ op: "describe" });
  const ops = describeResp.getOne("ops");
  if (!nrepl.bencode.isObject(ops)) {
    return Promise.reject(
      new Deno.errors.InvalidData("invalid describe response"),
    );
  }
  return new Set(Object.keys(ops));
}

export async function createConnection({
  hostname,
  port,
  type,
  baseDirectory,
}: {
  hostname?: string;
  port: number;
  type?: ConnectionType;
  baseDirectory?: string;
}): Promise<Connection> {
  const client = await _internals.nreplConnect({ hostname, port });

  const conn: Connection = {
    id: getConnectionId({ hostname, port, type }),
    hostname: hostname ?? defaultHostname,
    port,
    client,
    baseDirectory,
    type,
    session: undefined,
  };

  const supportedOps = await getSupportedOps(conn);
  if (!supportedOps.has("clone")) {
    return Promise.reject(
      new Deno.errors.NotSupported("clone op is not supported"),
    );
  }

  const cloneResp = await client.write({ op: "clone" });
  const session = cloneResp.getOne("new-session");
  if (typeof session !== "string") {
    return Promise.reject(new Deno.errors.InvalidData("invalid session"));
  }

  conn.type ??= "clojure";
  conn.session = session;
  return conn;
}

export const _internals = { nreplConnect };
