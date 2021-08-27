import { Denops, fns } from "../../deps.ts";
import * as vimBuf from "./core.ts";

const bufName = "diced_info";

export async function open(denops: Denops): Promise<void> {
  if (await vimBuf.isVisible(denops, bufName)) return;

  await vimBuf.open(denops, bufName);

  // initialize
  await denops.batch(
    ["setbufvar", bufName, "&bufhidden", "hide"],
    ["setbufvar", bufName, "&buflisted", 0],
    ["setbufvar", bufName, "&buftype", "nofile"],
    ["setbufvar", bufName, "&filetype", "clojure"],
    ["setbufvar", bufName, "&swapfile", 0],
    ["setbufvar", bufName, "&wrap", 0],
  );
}

export async function ready(denops: Denops): Promise<void> {
  if (await fns.bufnr(denops, bufName) !== -1) return;
  await open(denops);
  await denops.cmd("q");
}

export async function appendLines(
  denops: Denops,
  lines: Array<string>,
): Promise<void> {
  for (const line of lines) {
    await vimBuf.appendLine(denops, bufName, line);
  }
}
