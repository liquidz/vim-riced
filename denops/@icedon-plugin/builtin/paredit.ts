import { helper, icedon, unknownutil, vimFn } from "../deps.ts";
import {
  GetCurrentFormApi,
  GetCurrentTopFormApi,
  GetNsFormApi,
} from "../types.ts";
import { memoize } from "../util/fn/memoize.ts";

type App = icedon.App;
type Position = icedon.Position;

const rangeInitialize = memoize(async (app: App) => {
  const path = new URL(".", import.meta.url);
  path.pathname += "paredit/range.vim";
  await helper.load(app.denops, path);
}, (_) => "once");

function unknownToRange(range: unknown): [Position, Position] {
  unknownutil.assertArray<number>(range);
  if (range[0] === 0) {
    throw Deno.errors.NotFound;
  }

  // NOTE: start and end is 1-based index
  const start: Position = [range[0], range[1]];
  const end: Position = [range[2], range[3]];
  return [start, end];
}

async function getLinesByRange(
  app: App,
  start: Position,
  end: Position,
): Promise<string[]> {
  const lines = await vimFn.getline(app.denops, start[0], end[0]);
  unknownutil.assertArray<string>(lines);

  const len = lines.length;
  lines[0] = lines[0].substring(start[1] - 1);
  lines[len - 1] = lines[len - 1].substring(0, end[1]);
  return lines;
}

/**
 * Returns code and the starting line number
 */
const getCurrentTopForm = {
  name: GetCurrentTopFormApi,
  run: async (app: App, _args: unknown[]) => {
    await rangeInitialize(app);
    const range = await app.denops.call("IcedonGetTopFormRange");
    // NOTE: start and end is 1-based index
    const [start, end] = unknownToRange(range);
    const lines = await getLinesByRange(app, start, end);
    return [lines.join("\n"), start[0], start[1]];
  },
};

const getCurrentForm = {
  name: GetCurrentFormApi,
  run: async (app: App, _args: unknown[]) => {
    await rangeInitialize(app);
    const range = await app.denops.call("IcedonGetCurrentFormRange");
    // NOTE: start and end is 1-based index
    const [start, end] = unknownToRange(range);
    const lines = await getLinesByRange(app, start, end);
    return [lines.join("\n"), start[0], start[1]];
  },
};

const getNsForm = {
  name: GetNsFormApi,
  run: async (app: App, _args: unknown[]) => {
    await rangeInitialize(app);
    const range = await app.denops.call("IcedonGetNsFormRange");
    // NOTE: start and end is 1-based index
    const [start, end] = unknownToRange(range);
    const lines = await getLinesByRange(app, start, end);
    return [lines.join("\n"), start[0], start[1]];
  },
};

export class Api extends icedon.ApiPlugin {
  readonly name = "icedon builtin paredit";
  readonly apis = [getCurrentTopForm, getCurrentForm, getNsForm];
}
