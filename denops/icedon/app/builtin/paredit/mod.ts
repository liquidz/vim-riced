import { ApiPlugin, App, Position } from "../../../types.ts";
import { helper, unknownutil, vimFn } from "../../../deps.ts";
import { memoize } from "../../util/fn/memoize.ts";

const rangeInitialize = memoize(async (app: App) => {
  const path = new URL(".", import.meta.url);
  path.pathname += "range.vim";
  await helper.load(app.denops, path);
}, (_) => "once");

/**
 * Returns code and the starting line number
 */
const getCurrentTopForm = {
  name: "icedon_get_current_top_form",
  run: async (app: App, _args: unknown[]) => {
    await rangeInitialize(app);

    const range = await app.denops.call("IcedonGetTopFormRange");
    unknownutil.assertArray<number>(range);

    if (range[0] === 0) {
      return Deno.errors.NotFound;
    }

    // NOTE: start and end is 1-based index
    const start: Position = [range[0], range[1]];
    const end: Position = [range[2], range[3]];
    const denops = app.denops;

    const lines = await vimFn.getline(denops, start[0], end[0]);
    unknownutil.assertArray<string>(lines);

    const len = lines.length;
    lines[0] = lines[0].substring(start[1] - 1);
    lines[len - 1] = lines[len - 1].substring(0, end[1]);

    return [lines.join("\n"), start[0], start[1]];
  },
};

export class Api extends ApiPlugin {
  readonly name = "icedon builtin paredit";
  readonly apis = [getCurrentTopForm];
}
