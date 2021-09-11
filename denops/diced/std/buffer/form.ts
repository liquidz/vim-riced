import { Denops, dpsFns, dpsVars, unknownutil } from "../../deps.ts";
import { Cursor, Diced } from "../../types.ts";
import * as strParedit from "../string/paredit.ts";
import * as vimView from "../vim/view.ts";

export async function cword(diced: Diced): Promise<string> {
  const res = await diced.denops.call("diced#buffer#cword");
  return (typeof res === "string") ? res : "";
}

async function currentCursor(diced: Diced): Promise<Cursor> {
  const pos = await dpsFns.getpos(diced.denops, ".");
  const [, lnum, col] = pos;
  // lnum and cnum is 1-based index, so convert to 0-based index
  return { line: lnum - 1, column: col - 1 };
}

export function cursorToIndex(
  lines: string[],
  baseLineNumber: number,
  cursor: Cursor,
): number {
  const lnum = cursor.line - baseLineNumber;

  let idx = lines.slice(0, lnum).reduce((acc, v) => acc + v.length + 1, 0);
  idx += cursor.column;

  return idx;
}

async function getAroundSrcAndIdx(
  diced: Diced,
  cursor: Cursor,
  offset: number,
): Promise<[string, number]> {
  const startLnum = Math.max(0, cursor.line - offset);
  const endLnum = cursor.line + offset;

  const lines = await dpsFns.getline(diced.denops, startLnum, endLnum);
  return [lines.join("\n"), cursorToIndex(lines, startLnum, cursor)];
}

export async function getCurrentTopForm(diced: Diced): Promise<string> {
  const c = await currentCursor(diced);
  const [src, idx] = await getAroundSrcAndIdx(diced, c, 100);

  const range = strParedit.rangeForDefun(src, idx);
  if (range == null) {
    return Promise.reject(new Deno.errors.NotFound());
  }

  return src.substring(range[0], range[1]);
}

export async function getCurrentForm(diced: Diced): Promise<string> {
  const denops = diced.denops;
  const view = await vimView.saveView(diced);
  try {
    await denops.cmd("normal! yab");
    const code = await dpsVars.register.get(denops, "@");
    unknownutil.ensureString(code);
    return code;
  } finally {
    await vimView.restView(diced, view);
  }
}
