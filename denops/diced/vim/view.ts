import { Denops, dpsFns, dpsVars } from "../deps.ts";

type SavedView = {
  reg: unknown;
  bufnr: unknown;
  view: unknown;
  marks: unknown;
};

export async function saveView(denops: Denops): Promise<SavedView> {
  return {
    reg: await dpsVars.register.get(denops, "@"),
    bufnr: await dpsFns.bufnr(denops, "%"),
    view: await dpsFns.winsaveview(denops),
    marks: "FIXME",
  };
}

export async function restView(denops: Denops, view: SavedView): Promise<void> {
  await denops.cmd(`b ${view.bufnr}`);
  await dpsFns.winrestview(denops, view.view);
  await dpsVars.register.set(denops, "@", view.reg);
}
