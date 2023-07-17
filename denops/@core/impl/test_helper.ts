import { nrepl } from "../deps.ts";
import { nrepl_mock } from "../test_deps.ts";
import { Connection } from "../types.ts";

type Message = nrepl.bencode.BencodeObject;

const defaultRelay = (_: Message): Message => {
  return { status: ["done"] };
};

export function dummyClient(
  relay?: (msg: Message) => Message,
): nrepl.NreplClient {
  return new nrepl_mock.NreplClientMock(relay ?? defaultRelay);
}

export function dummyConnection({
  host,
  port,
  relay,
}: {
  host?: string;
  port?: number;
  relay?: (msg: Message) => Message;
}): Connection {
  const client = dummyClient(relay);
  const _host = host ?? "localhost";
  const _port = port ?? 12345;
  return {
    id: `${_host}${_port}`,
    hostname: _host,
    port: _port,
    client,
    baseDirectory: undefined,
    type: undefined,
    session: undefined,
  };
}
