import { Connection, ConnectParameter } from "./types.ts";
import { nrepl } from "./deps.ts";
import { nrepl_mock } from "./test_deps.ts";
import { CoreImpl } from "./impl/core.ts";
import * as connection from "./impl/connection.ts";

type Message = nrepl.bencode.BencodeObject;
type RelayFunction = (msg: Message) => Message;

function defaultRelay(msg: Message): Message {
  if (msg.op === "describe") {
    return { ops: { clone: 1, close: 1, eval: 1 }, status: ["done"] };
  } else if (msg.op === "clone") {
    return { "new-session": crypto.randomUUID(), status: ["done"] };
  }

  return { status: ["done"] };
}

function generateRelayFunction(
  relay: RelayFunction | undefined,
): RelayFunction {
  return (msg: Message): Message => {
    if (relay == null) {
      return defaultRelay(msg);
    }

    const result = relay(msg);
    const keys = Object.keys(result);

    if (keys.length === 1 && keys[0] === "status") {
      return defaultRelay(msg);
    }

    return result;
  };
}

type MockConnectParameter = ConnectParameter & {
  relay?: nrepl_mock.RelayFunction;
};

export class CoreMock extends CoreImpl {
  connect(
    { hostname, port, baseDirectory, relay }: MockConnectParameter,
  ): Promise<boolean> {
    const id = connection.getConnectionId({ hostname, port });
    if (this.connectionManager.getConnection(id) != null) {
      return Promise.resolve(false);
    }

    const conn: Connection = {
      id,
      hostname: hostname ?? "localhost",
      port,
      baseDirectory,
      client: new nrepl_mock.NreplClientMock(generateRelayFunction(relay)),
      type: "clojure",
      session: undefined,
    };

    this.connectionManager.addConnection(conn);
    this.currentId = conn.id;
    return Promise.resolve(true);
  }
}
