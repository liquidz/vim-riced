import { ApiPlugin, App } from "../types.ts";
import { unknownutil, vimFn } from "../deps.ts";

const getPosition = {
  name: "icedon_get_cursor_position",
  run: async (app: App, _args: unknown[]) => {
    const vimpos = await vimFn.getcurpos(app.denops);
    unknownutil.assertArray<number>(vimpos);
    return [vimpos[1], vimpos[2]];
  },
};

export class Api extends ApiPlugin {
  readonly name = "icedon builtin cursor";
  readonly apis = [getPosition];
}
