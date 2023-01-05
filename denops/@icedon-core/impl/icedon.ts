import {
  Connection,
  ConnectionManager,
  ConnectOption,
  Icedon,
  NreplMessage,
  NreplResponse,
  NreplWriteOption,
} from "../types.ts";

export class IcedonImpl implements Icedon {
  connectionManager: ConnectionManager;

  constructor(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
  }

  current(): Connection | undefined {
    return this.connectionManager.current();
  }

  connect(
    host: string,
    port: number,
    option?: ConnectOption,
  ): Promise<boolean> {
    return this.connectionManager.connect(host, port, option);
  }

  disconnect(): Promise<boolean> {
    return this.connectionManager.disconnect();
  }

  request(
    message: NreplMessage,
    option?: NreplWriteOption,
  ): Promise<NreplResponse | Error> {
    return this.connectionManager.request(message, option);
  }
}
