import { icedon, unknownutil, vimFn } from "../deps.ts";
import { GetCursorPositionApi } from "../types.ts";

type App = icedon.App;

const getPosition = {
  name: GetCursorPositionApi,
  run: async (app: App, _args: unknown[]) => {
    const vimpos = await vimFn.getcurpos(app.denops);
    unknownutil.assertArray<number>(vimpos);
    return [vimpos[1], vimpos[2]];
  },
};

export class Api extends icedon.ApiPlugin {
  readonly name = "com.github.liquidz.builtin.cursor";
  readonly apis = [getPosition];
}
