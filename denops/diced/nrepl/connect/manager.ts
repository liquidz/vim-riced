import { nrepl } from "../../deps.ts";
import { Connection, ConnectionManager } from "../../types.ts";

export class ConnectionManagerImpl implements ConnectionManager {
  private currentPort: number;
  private manager: Record<number, Connection>;

  constructor() {
    this.currentPort = -1;
    this.manager = {};
  }

  add(
    { port, conn, session }: {
      port: number;
      conn: nrepl.NreplClient;
      session: string;
    },
  ) {
    this.manager[port] = { client: conn, session: session };
  }

  remove(port: number) {
    delete this.manager[port];
  }

  clear() {
    this.currentPort = -1;
    this.manager = {};
  }

  switch(port: number) {
    if (this.manager[port] == null) {
      throw Error("FIXME");
    }
    this.currentPort = port;
  }

  get isConnected(): boolean {
    return (this.currentPort !== -1);
  }

  get currentConnection(): Connection {
    return this.manager[this.currentPort];
  }

  get ports(): number[] {
    return Object.keys(this.manager).map((v) => parseInt(v));
  }

  get connections(): Connection[] {
    return Object.values(this.manager);
  }
}
