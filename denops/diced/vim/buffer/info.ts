import { Denops, dpsFns } from "../../deps.ts";
import * as vimBuf from "./core.ts";

const bufName = "diced_info";

export async function open(denops: Denops): Promise<boolean> {
  const currentWin = await dpsFns.winnr(denops);
  if (await vimBuf.isVisible(denops, bufName)) return false;
  if (!await vimBuf.open(denops, bufName)) return false;
  await vimBuf.focusByWinNr(denops, currentWin);
  return true;
}

export async function ready(denops: Denops): Promise<void> {
  if (await dpsFns.bufnr(denops, bufName) !== -1) return;
  // NOTE: Call vim's function to avoid flickering of the screen
  denops.call("diced#buffer#info#ready", bufName);

  return;
}

export async function appendLines(
  denops: Denops,
  lines: Array<string>,
): Promise<void> {
  for (const line of lines) {
    await vimBuf.appendLine(denops, bufName, line);
  }
}
