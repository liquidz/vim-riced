import { nrepl } from "../deps.ts";
import { asserts, mock } from "../test_deps.ts";
import * as connection from "./connection.ts";
import * as sut from "./core.ts";
import * as helper from "./test_helper.ts";

Deno.test("connect", async () => {
  const nreplConnectStub = mock.stub(
    connection._internals,
    "nreplConnect",
    () => Promise.resolve(helper.dummyClient()),
  );

  try {
    const core = new sut.CoreImpl();
    asserts.assertEquals(core.current, undefined);
    asserts.assertEquals(core.connections.map((v) => v.id), []);

    const param = { hostname: "", port: 0, baseDirectory: "" };
    asserts.assertEquals(await core.connect(param), true);

    asserts.assertNotEquals(core.current, undefined);
    asserts.assertEquals(core.connections.map((v) => v.id), [
      connection.getConnectionId(param),
    ]);
  } finally {
    nreplConnectStub.restore();
  }
});

Deno.test("disconnect", async () => {
  const nreplConnectStub = mock.stub(
    connection._internals,
    "nreplConnect",
    () => Promise.resolve(helper.dummyClient()),
  );

  try {
    const core = new sut.CoreImpl();
    const a = { hostname: "a", port: 1, baseDirectory: "" };
    const b = { hostname: "b", port: 2, baseDirectory: "" };
    const aId = connection.getConnectionId(a);
    const bId = connection.getConnectionId(b);

    await core.connect(a);
    await core.connect(b);
    asserts.assertEquals(core.current?.id, bId);
    asserts.assertEquals(core.connections.length, 2);

    // Disconnect from b
    asserts.assertEquals(await core.disconnect(), true);
    asserts.assertEquals(core.connections.length, 1);

    // Should be switched to a
    asserts.assertEquals(core.current?.id, aId);

    // Disconnect from a
    asserts.assertEquals(await core.disconnect(), true);
    asserts.assertEquals(core.connections.length, 0);
    // Already disconnected
    asserts.assertEquals(await core.disconnect(), false);
    asserts.assertEquals(core.connections.length, 0);

    asserts.assertEquals(core.current, undefined);
  } finally {
    nreplConnectStub.restore();
  }
});

Deno.test("disconnectAll", async () => {
  const nreplConnectStub = mock.stub(
    connection._internals,
    "nreplConnect",
    () => Promise.resolve(helper.dummyClient()),
  );

  try {
    const core = new sut.CoreImpl();
    await core.connect({ hostname: "a", port: 1, baseDirectory: "" });
    await core.connect({ hostname: "b", port: 2, baseDirectory: "" });

    asserts.assertNotEquals(core.current, undefined);
    asserts.assertEquals(core.connections.length, 2);

    await core.disconnectAll();

    asserts.assertEquals(core.current, undefined);
    asserts.assertEquals(core.connections.length, 0);
  } finally {
    nreplConnectStub.restore();
  }
});

Deno.test("switchConnection", async () => {
  const nreplConnectStub = mock.stub(
    connection._internals,
    "nreplConnect",
    () => Promise.resolve(helper.dummyClient()),
  );

  try {
    const core = new sut.CoreImpl();
    const a = { hostname: "a", port: 1, baseDirectory: "" };
    const b = { hostname: "b", port: 2, baseDirectory: "" };
    const aId = connection.getConnectionId(a);
    const bId = connection.getConnectionId(b);

    await core.connect(a);
    await core.connect(b);

    asserts.assertEquals(core.current?.id, bId);

    asserts.assertEquals(core.switchConnection(aId), true);
    asserts.assertEquals(core.current?.id, aId);

    asserts.assertEquals(core.switchConnection("UNKNOWN"), false);
    asserts.assertEquals(core.current?.id, aId);
  } finally {
    nreplConnectStub.restore();
  }
});

Deno.test("request", async () => {
  const describeOps = { clone: 1, close: 1, eval: 1 };
  const relay = (
    msg: nrepl.bencode.BencodeObject,
  ): nrepl.bencode.BencodeObject => {
    if (msg["op"] === "describe") {
      return { ops: describeOps, status: ["done"] };
    } else {
      return { status: ["done"] };
    }
  };

  const nreplConnectStub = mock.stub(
    connection._internals,
    "nreplConnect",
    () => Promise.resolve(helper.dummyClient(relay)),
  );

  try {
    const core = new sut.CoreImpl();
    await core.connect({ hostname: "", port: 0, baseDirectory: "" });

    // describe
    const describeResp = await core.request({ op: "describe" });
    asserts.assertEquals(describeResp.context, {});
    asserts.assertEquals(describeResp.get("ops"), [describeOps]);

    // context
    const contextResp = await core.request({ op: "dummy" }, {
      context: { foo: "bar" },
    });
    asserts.assertEquals(contextResp.context, { foo: "bar" });
  } finally {
    nreplConnectStub.restore();
  }
});
