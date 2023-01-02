import { ApiPlugin, App } from "../../../types.ts";
import * as api from "../../api.ts";
import { unknownutil } from "../../../deps.ts";
import { ConnectOption, NreplResponse } from "../../../core/types.ts";

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

    if (args.length === 0) {
      // auto connections
      console.log("Not supported");
      return;
    } else if (args.length === 1) {
      // port only
      const port = parseInt(args[0]);
      await app.icedon.connect("0.0.0.0", port, opt);
      console.log("Connected");

      return;
    } else if (args.length === 2) {
      // host and port
      const host = args[0];
      const port = parseInt(args[1]);
      const ret = await app.icedon.connect(host, port, opt);
      if (ret) {
        console.log("Connected");
      }
      return;
    }
    return Deno.errors.InvalidData;
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
