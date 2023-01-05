import { asserts, nrepl_mock } from "../test_deps.ts";
import * as sut from "./connection_manager.ts";
import { nrepl } from "../deps.ts";

const relay: nrepl_mock.RelayFunction = (
  msg: nrepl.NreplMessage,
): nrepl.NreplMessage => {
  if (msg["op"] === "eval") {
    return { value: `${msg["code"]} world!` };
  }
  return {};
};

const dummyClient: nrepl.NreplClient = new nrepl_mock.NreplClientMock(relay);

Deno.test("connection manager", async () => {
  const cm = new sut.ConnectionManagerImpl();

  asserts.assertEquals(cm.current(), undefined);

  const connectResult = await cm.connectByClient(dummyClient);
  asserts.assertEquals(connectResult, true);
  const current = cm.current();

  if (current === undefined) {
    asserts.fail("current connection shouldn't be undefined");
  }

  const resp = await cm.request({ op: "eval", code: "hello" });
  if (resp instanceof Error) {
    asserts.fail("request shouldn't be failed");
  }

  asserts.assertEquals(resp.isDone(), true);
  asserts.assertEquals(resp.getOne("value"), "hello world!");
  // session should be completed automatically
  asserts.assertEquals(resp.getOne("session"), current.session);

  const disconnectResult = await cm.disconnect();
  asserts.assertEquals(disconnectResult, true);
  asserts.assertEquals(cm.current(), undefined);
});
