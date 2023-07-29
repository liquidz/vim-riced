import { nrepl } from "./deps.ts";
import { asserts } from "./test_deps.ts";
import * as sut from "./mock.ts";
import * as connection from "./impl/connection.ts";

type Message = nrepl.bencode.BencodeObject;

const aliceRelay = (msg: Message): Message => {
  if (msg.op === "whoami") {
    return { name: "Alice", status: ["done"] };
  }
  return { status: ["done"] };
};

const bobRelay = (msg: Message): Message => {
  if (msg.op === "whoami") {
    return { name: "Bob", status: ["done"] };
  }
  return { status: ["done"] };
};

const alice = { hostname: "alice", port: 0, relay: aliceRelay };
const bob = { hostname: "bob", port: 0, relay: bobRelay };
const aliceId = connection.getConnectionId(alice);
const bobId = connection.getConnectionId(bob);

Deno.test("CoreMock", async () => {
  const core = new sut.CoreMock();

  // Not connected
  asserts.assertEquals(core.current, undefined);
  asserts.assertEquals(await core.disconnect(), false);
  asserts.assertRejects(() => {
    return core.request({ op: "whoami" });
  });

  // Connected
  asserts.assertEquals(await core.connect(alice), true);
  asserts.assertEquals(await core.connect(bob), true);

  asserts.assertEquals(
    core.connections.map((v) => v.id).sort(),
    [aliceId, bobId].sort(),
  );
  asserts.assertEquals(core.current?.id, bobId);
  asserts.assertEquals(
    (await core.request({ op: "whoami" })).getOne("name"),
    "Bob",
  );

  // Switch
  asserts.assertEquals(core.switchConnection("UNKNOWN"), false);
  asserts.assertEquals(core.current?.id, bobId);

  asserts.assertEquals(core.switchConnection(aliceId), true);
  asserts.assertEquals(core.current?.id, aliceId);
  asserts.assertEquals(
    (await core.request({ op: "whoami" })).getOne("name"),
    "Alice",
  );

  // Diconnect
  asserts.assertEquals(await core.disconnect(), true);
  asserts.assertEquals(core.connections.length, 1);
  asserts.assertEquals(core.current?.id, bobId);
  asserts.assertEquals(
    (await core.request({ op: "whoami" })).getOne("name"),
    "Bob",
  );

  // DisconnectAll
  asserts.assertEquals(await core.disconnectAll(), true);
  asserts.assertEquals(core.connections.length, 0);
  asserts.assertEquals(core.current?.id, undefined);
  asserts.assertRejects(() => {
    return core.request({ op: "whoami" });
  });
});
