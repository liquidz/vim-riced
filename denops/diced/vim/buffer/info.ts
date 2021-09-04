import { Denops, dpsFns, dpsHelper } from "../../deps.ts";
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

  dpsHelper.execute(
    denops,
    `
    silent execute ':split ${bufName}'
    silent execute ':q'

    call setbufvar('${bufName}', '&bufhidden', 'hide')
    call setbufvar('${bufName}', '&buflisted', 0)
    call setbufvar('${bufName}', '&buftype', 'nofile')
    call setbufvar('${bufName}', '&filetype', 'clojure')
    call setbufvar('${bufName}', '&swapfile', 0)
    call setbufvar('${bufName}', '&wrap', 0)
    `,
  );

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
