import * as sut from "./mock.ts";
import { asserts, nrepl_mock } from "../test_deps.ts";
import { nrepl } from "../deps.ts";

const relay: nrepl_mock.RelayFunction = (
  msg: nrepl.NreplMessage,
): nrepl.NreplMessage => {
  if (msg["op"] === "eval") {
    return { value: `${msg["code"]} world?` };
  }
  return {};
};

Deno.test("IcedonMock", async () => {
  const icedon = new sut.IcedonMock(relay);
  asserts.assertEquals(icedon.current(), undefined);

  const connectResult = await icedon.connect("dummy", 0);
  asserts.assertEquals(connectResult, true);
  asserts.assertNotEquals(icedon.current(), undefined);

  const resp = await icedon.request({ op: "eval", code: "hello" });
  if (resp instanceof Error) {
    asserts.fail("request shouldn't be failed");
  }
  asserts.assertEquals(resp.isDone(), true);
  asserts.assertEquals(resp.getOne("value"), "hello world?");

  const disconnectResult = await icedon.disconnect();
  asserts.assertEquals(disconnectResult, true);
  asserts.assertEquals(icedon.current(), undefined);
});
