import { asserts, nrepl_mock } from "../test_deps.ts";
import { ConnectOption, NreplMessage } from "../types.ts";
import * as sut from "./icedon.ts";
import { ConnectionManagerImpl } from "./connection_manager.ts";

const relay: nrepl_mock.RelayFunction = (_msg, _opt?): NreplMessage => {
  return {};
};

class DummyConnectionManager extends ConnectionManagerImpl {
  connect(_host: string, _port: number, option?: ConnectOption) {
    const client = new nrepl_mock.NreplClientMock(relay);
    return this.connectByClient(client, option);
  }
}

Deno.test("icedon", async () => {
  const icedon = new sut.IcedonImpl(new DummyConnectionManager());

  //current
  asserts.assertEquals(icedon.current(), undefined);

  //connect
  const connectResult = await icedon.connect("dummy", 0);
  asserts.assertEquals(connectResult, true);
  asserts.assertNotEquals(icedon.current(), undefined);

  //request
  const resp = await icedon.request({ op: "clone" });
  if (resp instanceof Error) {
    asserts.fail("request should be worked");
  }
  asserts.assertNotEquals(resp.getOne("new-session"), undefined);

  const disconnectResult = await icedon.disconnect();
  asserts.assertEquals(disconnectResult, true);
  asserts.assertEquals(icedon.current(), undefined);
});
