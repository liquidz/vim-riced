import { Command, Params } from "../types.ts";
import { unknownutil } from "../deps.ts";

import * as interceptor from "../interceptor/core.ts";
import * as nreplConnect from "../nrepl/connect/core.ts";

export const Connect: Command = {
  name: "Connect",
  nargs: "?",
  args: "<q-args>",
  run: async (diced, args) => {
    if (args.length === 0 || !unknownutil.isString(args[0])) return;
    const portStr = args[0];
    const port: number = (portStr === "") ? NaN : parseInt(portStr);
    const params: Params = {
      "host": "127.0.0.1",
      "port": port,
    };
    await interceptor.execute(diced, "connect", params, async (ctx) => {
      const result = await nreplConnect.connect(
        ctx.diced,
        ctx.params["host"] || "127.0.0.1",
        ctx.params["port"] || port,
      );
      ctx.params["result"] = result;
      return ctx;
    });
  },
};

export const Disconnect: Command = {
  name: "Disconnect",
  run: (diced, _) => {
    return Promise.resolve(nreplConnect.disconnect(diced));
  },
};
