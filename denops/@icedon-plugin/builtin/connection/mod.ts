import { ApiPlugin, App, ConnectOption, NreplResponse } from "../../types.ts";
import * as api from "../../api.ts";
import { unknownutil } from "../../deps.ts";

function connectOption(app: App): ConnectOption {
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
        console.log("FIXME could not connect");
        return ctx;
      }
      if (!await ctx.app.icedon.connect(host, port, opt)) {
        throw Deno.errors.NotConnected;
      }

      // FIXME
      console.log("Connected");

      return ctx;
    });
  },
};

const disconnect = {
  name: "icedon_disconnect",
  run: async (app: App, _args: unknown[]) => {
    const ret = await app.icedon.disconnect();
    if (ret) {
      console.log("Disconnected");
    }
  },
};

export class Api extends ApiPlugin {
  readonly name = "icedon builtin connect";
  readonly apis = [connect, disconnect];

  async onInit(app: App) {
    await api.registerApiCommand(app, connect, { nargs: "*" });
    await api.registerApiCommand(app, disconnect);
  }
}
