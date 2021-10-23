import { Diced } from "../../types.ts";
import { dpsHelper } from "../../deps.ts";
import * as stdFn from "../fn/mod.ts";

const tagstackInitialize = stdFn.memoize(async (diced: Diced) => {
  const path = new URL(".", import.meta.url);
  path.pathname = path.pathname + "tagstack.vim";
  await dpsHelper.load(diced.denops, path);
}, (_) => "once");

export async function add(
  diced: Diced,
  winnr: number,
  bufnr: number,
  line: number,
  column: number,
  tagname: string,
) {
  await tagstackInitialize(diced);
  return await diced.denops.call(
    "DicedTagstackAdd",
    winnr,
    bufnr,
    line,
    column,
    tagname,
  );
}

export async function addHere(diced: Diced, tagname: string) {
  await tagstackInitialize(diced);
  return await diced.denops.call("DicedTagstackAddHere", tagname);
}
