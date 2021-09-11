import { dpsFns, dpsVars } from "../../deps.ts";
import { Diced } from "../../types.ts";

type SavedView = {
  reg: unknown;
  bufnr: unknown;
  view: unknown;
  marks: unknown;
};

export async function saveView(diced: Diced): Promise<SavedView> {
  const denops = diced.denops;
  return {
    reg: await dpsVars.register.get(denops, "@"),
    bufnr: await dpsFns.bufnr(denops, "%"),
    view: await dpsFns.winsaveview(denops),
    marks: "FIXME",
  };
}

export async function restView(diced: Diced, view: SavedView): Promise<void> {
  const denops = diced.denops;
  await denops.cmd(`b ${view.bufnr}`);
  await dpsFns.winrestview(denops, view.view);
  await dpsVars.register.set(denops, "@", view.reg);
}
