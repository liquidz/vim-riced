import { ApiPlugin, App } from "../../../types.ts";
import { unknownutil, vimFn } from "../../../deps.ts";
import { rangeForDefun } from "../../util/string/paredit.ts";

/**
 * Returns code and the starting line number
 */
const getCurrentTopForm = {
  name: "icedon_get_current_top_form",
  run: async (app: App, _args: unknown[]) => {
    const denops = app.denops;
    const startPos = await vimFn.searchpos(denops, "^\\S", "bcnW");
    unknownutil.assertArray<number>(startPos);

    const lines = await vimFn.getline(denops, startPos[0], "$");
    unknownutil.assertArray<string>(lines);

    const code = lines.join("\n");
    const [_, endIndex] = rangeForDefun(code, 0);

    return [code.substring(0, endIndex), startPos[0]];
  },
};

export class Api extends ApiPlugin {
  readonly name = "icedon builtin paredit";
  readonly apis = [getCurrentTopForm];
}
