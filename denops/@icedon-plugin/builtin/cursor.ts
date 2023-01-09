import { icedon, unknownutil, vimFn } from "../deps.ts";

type App = icedon.App;

const getPosition = {
  name: "icedon_get_cursor_position",
  run: async (app: App, _args: unknown[]) => {
    const vimpos = await vimFn.getcurpos(app.denops);
    unknownutil.assertArray<number>(vimpos);
    return [vimpos[1], vimpos[2]];
  },
};

export class Api extends icedon.ApiPlugin {
  readonly name = "icedon builtin cursor";
  readonly apis = [getPosition];
}
