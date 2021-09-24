import { Diced } from "../../../types.ts";
import { dpsHelper } from "../../../deps.ts";
import * as stdFn from "../../fn/mod.ts";

export interface PopupOption {
  row: number | "." | "nearCursor" | "top" | "bottom";
  col: number | "." | "nearCursor" | "tail" | "right";
  border?: boolean;
  wrap?: boolean;
  group?: string;
  moved?: "any" | "row";
}

const initialize = stdFn.memoize(async (diced: Diced) => {
  const path = new URL(".", import.meta.url);
  path.pathname = path.pathname + "popup.vim";
  await dpsHelper.load(diced.denops, path);
}, (_) => "once");

export async function open(
  diced: Diced,
  texts: Array<string>,
  option: PopupOption,
): Promise<unknown> {
  await initialize(diced);
  return await diced.denops.call("DicedPopupOpen", texts, option);
}
