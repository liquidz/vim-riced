import { Denops, fns } from "../deps.ts";
import * as nav from "./navigator.ts";

type Cursor = {
  line: number;
  column: number;
};
type LineRange = {
  startLine: number;
  endLine: number;
};

async function getAroundSrcAndIdx(
  denops: Denops,
  start: Cursor,
  offset: number,
  end?: Cursor,
): Promise<[string, number, number, LineRange]> {
  const { line: fromLine, column: fromColumn } = start;
  const { line: toLine, column: toColumn } = (end === undefined) ? start : end;

  const startLine = Math.max(0, fromLine - offset);
  const endLine = toLine + offset;
  const lines = await fns.getline(denops, fromLine, toLine + offset);

  let src = lines.join("\n");
  let idx = fromColumn;
  // WARN: In linewise visual mode, toColumn seems to be too large number (e.g. 2147483649)
  let endIdx = Math.min(
    lines[Math.max(0, toLine - fromLine - 1)].length - 1,
    toColumn,
  );

  if (toLine !== fromLine) {
    const srcBeforeEndCursor =
      lines.slice(0, Math.min(lines.length - 1, toLine - fromLine)).join("\n") +
      "\n";
    endIdx += srcBeforeEndCursor.length;
  }

  if (startLine !== fromLine) {
    const exLines = await fns.getline(denops, startLine, fromLine - 1);
    const exSrc = exLines.join("\n") + "\n";
    src = exSrc + src;
    idx += exSrc.length;
    endIdx += exSrc.length;
  }

  return [src, idx, endIdx, { startLine: startLine, endLine: endLine }];
}
