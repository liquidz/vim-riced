import { dpsHelper } from "../../deps.ts";
import { Diced } from "../../types.ts";
import * as stdFn from "../fn/mod.ts";

const viewInitialize = stdFn.memoize(async (diced: Diced) => {
  const path = new URL(".", import.meta.url);
  path.pathname = path.pathname + "view.vim";
  await dpsHelper.load(diced.denops, path);
}, (_) => "once");

export async function saveView(diced: Diced): Promise<unknown> {
  await viewInitialize(diced);
  return await diced.denops.call("DicedSaveView");
}

export async function restView(
  diced: Diced,
  savedView: unknown,
): Promise<void> {
  await viewInitialize(diced);
  await diced.denops.call("DicedRestView", savedView);
  return;
}
