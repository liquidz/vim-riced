import { Denops } from "../deps.ts";
import { Sexp } from "./types.ts";

function dummy(_: Denops, _row: number, _col: number): Promise<string> {
  return Promise.resolve("");
}

export const vimSexp: Sexp = {
  getTopList: dummy,
  getList: dummy,
  getForm: dummy,
};
