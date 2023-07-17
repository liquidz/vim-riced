import { App, Denops, vimFn } from "../deps.ts";
import { memoize } from "../util/fn/memoize.ts";
import { neovimSexp } from "./neovim.ts";
import { vimSexp } from "./vim.ts";

const getModule = memoize(
  async (denops: Denops) => {
    return (await vimFn.has(denops, "nvim")) ? neovimSexp : vimSexp;
  },
  (_) => "once",
);

export async function getTopList(
  app: App,
  one_based_cursor_row: number,
  one_based_cursor_col: number,
): Promise<string> {
  const mod = await getModule(app.denops);
  return await mod.getTopList(
    app.denops,
    one_based_cursor_row,
    one_based_cursor_col,
  );
}

export async function getList(
  app: App,
  one_based_cursor_row: number,
  one_based_cursor_col: number,
): Promise<string> {
  const mod = await getModule(app.denops);
  return await mod.getList(
    app.denops,
    one_based_cursor_row,
    one_based_cursor_col,
  );
}

export async function getForm(
  app: App,
  one_based_cursor_row: number,
  one_based_cursor_col: number,
): Promise<string> {
  const mod = await getModule(app.denops);
  return await mod.getForm(
    app.denops,
    one_based_cursor_row,
    one_based_cursor_col,
  );
}
