import { Denops, vimFn } from "../deps.ts";
import { Sexp } from "./types.ts";

async function getCurrentTopList(
  denops: Denops,
  cursor_row: number,
  cursor_col: number,
): Promise<string> {
  const res = await denops.call(
    "luaeval",
    `require('vim-riced.sexp').get_top_list(${cursor_row - 1}, ${
      cursor_col - 1
    })`,
  );
  return typeof res === "string" ? res : "";
}

async function getCurrentList(
  denops: Denops,
  cursor_row: number,
  cursor_col: number,
): Promise<string> {
  const res = await denops.call(
    "luaeval",
    `require('vim-riced.sexp').get_list(${cursor_row - 1}, ${cursor_col - 1})`,
  );
  return typeof res === "string" ? res : "";
}

async function getCurrentForm(
  denops: Denops,
  cursor_row: number,
  cursor_col: number,
): Promise<string> {
  const res = await denops.call(
    "luaeval",
    `require('vim-riced.sexp').get_form(${cursor_row - 1}, ${cursor_col - 1})`,
  );
  return typeof res === "string" ? res : "";
}

export const neovimSexp: Sexp = {
  getTopList: getCurrentTopList,
  getList: getCurrentList,
  getForm: getCurrentForm,
};
