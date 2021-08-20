import { fns, vars } from "../deps.ts";
import { Diced } from "../types.ts";

type SavedView = {
  reg: unknown;
  bufnr: unknown;
  view: unknown;
  marks: unknown;
};

export async function saveView(diced: Diced): Promise<SavedView> {
  const denops = diced.denops;
  return {
    reg: await vars.register.get(denops, "@"),
    bufnr: await fns.bufnr(denops, "%"),
    view: await fns.winsaveview(denops),
    marks: "FIXME",
  };
}

export async function restView(diced: Diced, view: SavedView): Promise<void> {
  const denops = diced.denops;
  await denops.cmd(`b ${view.bufnr}`);
  await fns.winrestview(denops, view.view);
  await vars.register.set(denops, "@", view.reg);
}
