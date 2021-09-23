import { Diced } from "../../types.ts";

export interface PopupOption {
  row: number | "." | "nearCursor" | "top" | "bottom";
  col: number | "." | "nearCursor" | "tail" | "right";
  border?: boolean;
  wrap?: boolean;
  group?: string;
  moved?: "any" | "row";
}

export function open(
  diced: Diced,
  texts: Array<string>,
  option: PopupOption,
): Promise<unknown> {
  return diced.denops.call("diced#popup#open", texts, option);
}
