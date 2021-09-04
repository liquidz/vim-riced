import { Denops, dpsFns, dpsVars, unknownutil } from "../deps.ts";
import { Cursor } from "../types.ts";
import * as strParedit from "../string/paredit.ts";
import * as vimView from "../vim/view.ts";

async function currentCursor(denops: Denops): Promise<Cursor> {
  const pos = await dpsFns.getpos(denops, ".");
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
  denops: Denops,
  cursor: Cursor,
  offset: number,
): Promise<[string, number]> {
  const startLnum = Math.max(0, cursor.line - offset);
  const endLnum = cursor.line + offset;

  const lines = await dpsFns.getline(denops, startLnum, endLnum);
  return [lines.join("\n"), cursorToIndex(lines, startLnum, cursor)];
}

export async function getCurrentTopForm(denops: Denops): Promise<string> {
  const c = await currentCursor(denops);
  const [src, idx] = await getAroundSrcAndIdx(denops, c, 100);

  const range = strParedit.rangeForDefun(src, idx);
  if (range == null) {
    return Promise.reject(new Deno.errors.NotFound());
  }

  return src.substring(range[0], range[1]);
}

export async function getCurrentForm(denops: Denops): Promise<string> {
  const view = await vimView.saveView(denops);
  try {
    await denops.cmd("normal! yab");
    const code = await dpsVars.register.get(denops, "@");
    unknownutil.ensureString(code);
    return code;
  } finally {
    await vimView.restView(denops, view);
  }
}
