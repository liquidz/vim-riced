import { interceptor, unknownutil } from "../../deps.ts";
import { Command } from "../../types.ts";

import * as core from "../../core/mod.ts";
import * as msg from "../../std/message/core.ts";

export const Connect: Command = {
  name: "Connect",
  nargs: "?",
  args: "<q-args>",
  run: async (diced, args) => {
    if (args.length === 0 || !unknownutil.isString(args[0])) return;
    const portStr = args[0];
    const port: number = (portStr === "") ? NaN : parseInt(portStr);

    try {
      await core.connect(diced, "127.0.0.1", port);
    } catch (err) {
      if (err instanceof Deno.errors.ConnectionAborted) {
        // Skip to connect
      } else if (err instanceof Deno.errors.AlreadyExists) {
        await msg.info(diced, "AlreadyConnected");
      } else if (err instanceof interceptor.ExecutionError) {
        await msg.errorStr(diced, err.message);
      } else {
        await msg.error(diced, "UnexpectedError", { message: err.message });
      }
    }
  },
};

export const Disconnect: Command = {
  name: "Disconnect",
  run: async (diced, _) => {
    await core.disconnect(diced);
  },
};
