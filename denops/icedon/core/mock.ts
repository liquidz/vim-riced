import { ConnectOption } from "./types.ts";
import { nrepl_mock } from "../test_deps.ts";
import { IcedonImpl } from "./impl/icedon.ts";
import { ConnectionManagerImpl } from "./impl/connection_manager.ts";

export class IcedonMock extends IcedonImpl {
  private relay: nrepl_mock.RelayFunction;

  constructor(relay: nrepl_mock.RelayFunction) {
    super(new ConnectionManagerImpl());
    this.relay = relay;
  }

  connect(_host: string, _port: number, _option?: ConnectOption) {
    const client = new nrepl_mock.NreplClientMock(this.relay);
    return this.connectionManager.connectByClient(client);
  }
}
