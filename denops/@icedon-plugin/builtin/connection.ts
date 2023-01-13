import { icedon, unknownutil } from "../deps.ts";
import * as api from "../api.ts";

type App = icedon.App;
type NreplResponse = icedon.NreplResponse;

function connectOption(app: App): icedon.ConnectOption {
  return {
    handlerCallback: (resp: NreplResponse): NreplResponse => {
      app.intercept(
        "read",
        { response: resp },
        (ctx) => Promise.resolve(ctx),
      );
      return resp;
    },
  };
}

const connect = {
  name: "icedon_connect",
  run: async (app: App, args: unknown[]) => {
    unknownutil.assertArray<string>(args);
    const opt = connectOption(app);

    let host: string | undefined;
    let port: number | undefined;

    if (args.length === 1) {
      port = parseInt(args[0]);
    } else if (args.length === 2) {
      host = args[0];
      port = parseInt(args[1]);
    }

    await app.intercept("connect", { host: host, port: port }, async (ctx) => {
      const host = ctx.params["host"] || "0.0.0.0";
      const port = ctx.params["port"];

      if (
        !unknownutil.isString(host) ||
        !unknownutil.isNumber(port) ||
        (unknownutil.isNumber(port) && isNaN(port))
      ) {
        await api.log.warn(app, "failedToConnect", `${host}:${port}`);
        return ctx;
      }
      if (!await ctx.app.icedon.connect(host, port, opt)) {
        throw Deno.errors.NotConnected;
      }

      await api.log.info(app, "connected", `${host}:${port}`);

      return ctx;
    });
  },
};

const disconnect = {
  name: "icedon_disconnect",
  run: async (app: App, _args: unknown[]) => {
    const ret = await app.icedon.disconnect();
    if (ret) {
      await api.log.info(app, "disconnected");
    }
  },
};

export class Api extends icedon.ApiPlugin {
  readonly name = "com.github.liquidz.builtin.connect";
  readonly apis = [connect, disconnect];
  readonly pluginRequires = ["com.github.liquidz.builtin.message"];

  async onInit(app: App) {
    await api.registerApiCommand(app, connect, { nargs: "*" });
    await api.registerApiCommand(app, disconnect);
  }
}
