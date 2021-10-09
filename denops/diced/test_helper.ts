import { Context, Denops, Dispatcher, Meta, nrepl } from "./deps.ts";
import { bufio } from "./test_deps.ts";
import { BaseInterceptor, ConnectionManager, Diced } from "./types.ts";
import * as connManager from "./core/connection/manager.ts";

class DummyDenops implements Denops {
  name: string;
  meta: Meta;
  dispatcher: Dispatcher;

  constructor({ host }: { host?: "vim" | "nvim" }) {
    this.name = "diced dummy";
    this.meta = {
      mode: "test",
      host: host ?? "vim",
      version: "",
      platform: "linux",
    };
    this.dispatcher = {};
  }

  call(_fn: string, ..._args: unknown[]): Promise<unknown> {
    return Promise.resolve(true);
  }

  batch(..._calls: [string, ...unknown[]][]): Promise<unknown[]> {
    return Promise.resolve([]);
  }

  cmd(_cmd: string, _ctx?: Context): Promise<void> {
    return Promise.resolve();
  }

  eval(_expr: string, _ctx?: Context): Promise<unknown> {
    return Promise.resolve(true);
  }

  dispatch(_name: string, _fn: string, ..._args: unknown[]): Promise<unknown> {
    return Promise.resolve(true);
  }
}

function dummyConn(): Deno.Conn {
  return {
    rid: -1,
    closeWrite: () => Promise.resolve(),
    read: (_: Uint8Array): Promise<number | null> => Promise.resolve(0),
    write: (_: Uint8Array): Promise<number> => Promise.resolve(0),
    close: (): void => {},
    localAddr: { transport: "tcp", hostname: "0.0.0.0", port: 0 },
    remoteAddr: { transport: "tcp", hostname: "0.0.0.0", port: 0 },
  };
}

type DummyNreplDispacher = (
  msg: nrepl.NreplRequest,
  ctx: nrepl.Context,
) => nrepl.NreplDoneResponse;

class DummyNreplClient implements nrepl.NreplClient {
  conn: Deno.Conn;
  bufReader: bufio.BufReader;
  bufWriter: bufio.BufWriter;
  isClosed: boolean;
  status: nrepl.NreplStatus;
  dispatcher: DummyNreplDispacher;

  constructor(dispatcher: DummyNreplDispacher) {
    this.conn = dummyConn();
    this.bufReader = new bufio.BufReader(this.conn);
    this.bufWriter = new bufio.BufWriter(this.conn);

    this.isClosed = false;
    this.status = "Waiting";

    this.dispatcher = dispatcher;
  }

  close(): void {
    return;
  }

  read(): Promise<nrepl.NreplResponse> {
    return Promise.resolve(nrepl.util.doneResponse([{ status: ["done"] }]));
  }

  write(
    message: nrepl.NreplRequest,
    context?: nrepl.Context,
  ): Promise<nrepl.NreplDoneResponse> {
    const resp = this.dispatcher(message, context ?? {});
    return Promise.resolve(resp);
  }
}

class DummyDiced implements Diced {
  readonly denops: Denops;
  readonly interceptors: Record<string, Array<BaseInterceptor>>;
  readonly connection: ConnectionManager;

  constructor(dispacher: DummyNreplDispacher) {
    this.denops = new DummyDenops({});
    this.interceptors = {};
    this.connection = new connManager.ConnectionManagerImpl();

    connManager.addConnection(this.connection, "dummy", {
      type: "clj",
      client: new DummyNreplClient(dispacher),
      port: 9999,
      session: "dummy",
    });
    connManager.switchConnection(this.connection, "dummy");
  }
}

export function doneResponse(context?: nrepl.Context): nrepl.NreplDoneResponse {
  return nrepl.util.doneResponse([{ status: ["done"] }], context ?? {});
}

export function dummyDiced(dispacher?: DummyNreplDispacher): Diced {
  const d = dispacher ?? ((_, ctx) => {
    return doneResponse(ctx);
  });
  return new DummyDiced(d);
}
