import { ApiPlugin, App } from "../../types.ts";
import * as api from "../../api.ts";
import { unknownutil } from "../../deps.ts";

const evaluate = {
  name: "icedon_eval",
  run: async (app: App, args: unknown[]) => {
    unknownutil.assertArray<string>(args);
    if (app.icedon.current() === undefined) {
      return Deno.errors.NotConnected;
    }

    const code = args[0];
    const ret = await app.icedon.request({ op: "eval", code: code });
    console.log(ret);
    return ret;
  },
};

export class Api extends ApiPlugin {
  readonly name = "icedon builtin evaluation";
  readonly apis = [evaluate];

  async onInit(app: App) {
    await api.registerApiCommand(app, evaluate, { nargs: "1" });
  }
}
