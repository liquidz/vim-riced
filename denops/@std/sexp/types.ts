import { Denops } from "../deps.ts";

export type Sexp = {
  getTopList: (
    denops: Denops,
    one_based_cursor_row: number,
    one_based_cursor_col: number,
  ) => Promise<string>;
  getList: (
    denops: Denops,
    one_based_cursor_row: number,
    one_based_cursor_col: number,
  ) => Promise<string>;
  getForm: (
    denops: Denops,
    one_based_cursor_row: number,
    one_based_cursor_col: number,
  ) => Promise<string>;
};
