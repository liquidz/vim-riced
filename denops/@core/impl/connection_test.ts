import { nrepl } from "../deps.ts";
import { asserts, mock } from "../test_deps.ts";
import * as sut from "./connection.ts";
import * as helper from "./test_helper.ts";

Deno.test("getConnectionId", () => {
  asserts.assertEquals(
    sut.getConnectionId({ hostname: "localhost", port: 1234 }),
    "localhost:1234",
  );
});

Deno.test("getSupportedOps", async () => {
  const conn = helper.dummyConnection({
    relay: (msg: nrepl.bencode.BencodeObject): nrepl.bencode.BencodeObject => {
      if (msg["op"] === "describe") {
        return { ops: { clone: 1, close: 1, eval: 1 }, status: ["done"] };
      } else {
        return { status: ["done"] };
      }
    },
  });

  asserts.assertEquals(
    await sut.getSupportedOps(conn),
    new Set(["clone", "close", "eval"]),
  );
});

Deno.test("createConnection", async () => {
  const dummyClient = helper.dummyClient(
    (msg: nrepl.bencode.BencodeObject): nrepl.bencode.BencodeObject => {
      if (msg["op"] === "clone") {
        return { "new-session": "test-session", status: ["done"] };
      } else {
        return { status: ["done"] };
      }
    },
  );
  const nreplConnectStub = mock.stub(
    sut._internals,
    "nreplConnect",
    () => Promise.resolve(dummyClient),
  );

  try {
    const conn = await sut.createConnection({
      hostname: "localhost",
      port: 1234,
    });
    asserts.assertEquals(conn.id, "localhost:1234");
    asserts.assertEquals(conn.session, "test-session");
  } finally {
    nreplConnectStub.restore();
  }
});
