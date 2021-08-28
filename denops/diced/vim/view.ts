import { Denops, fns, vars } from "../deps.ts";

type SavedView = {
  reg: unknown;
  bufnr: unknown;
  view: unknown;
  marks: unknown;
};

export async function saveView(denops: Denops): Promise<SavedView> {
  return {
    reg: await vars.register.get(denops, "@"),
    bufnr: await fns.bufnr(denops, "%"),
    view: await fns.winsaveview(denops),
    marks: "FIXME",
  };
}

export async function restView(denops: Denops, view: SavedView): Promise<void> {
  await denops.cmd(`b ${view.bufnr}`);
  await fns.winrestview(denops, view.view);
  await vars.register.set(denops, "@", view.reg);
}
