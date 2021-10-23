import { dpsFns, dpsHelper } from "../../deps.ts";
import { Diced } from "../../types.ts";
import * as vimBuf from "../../std/vim/buffer.ts";

export const bufName = "diced_info";

export async function open(diced: Diced): Promise<boolean> {
  const denops = diced.denops;
  const currentWin = await dpsFns.winnr(denops);
  if (await vimBuf.isVisible(diced, bufName)) return false;
  if (!await vimBuf.open(diced, bufName)) return false;
  await vimBuf.focusByWinNr(diced, currentWin);
  return true;
}

export async function ready(diced: Diced): Promise<void> {
  const denops = diced.denops;
  if (await dpsFns.bufnr(denops, bufName) !== -1) return;

  dpsHelper.execute(
    denops,
    `
    silent execute ':split ${bufName}'
    silent execute ':q'

    call setbufvar('${bufName}', 'lsp_diagnostics_enabled', 0)
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
