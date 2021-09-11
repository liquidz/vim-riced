import { dpsFns } from "../../deps.ts";
import { Diced } from "../../types.ts";

export async function focusByWinNr(
  diced: Diced,
  winNr: unknown,
): Promise<void> {
  await diced.denops.cmd(
    `execute printf('%dwincmd w', ${winNr})`,
  );
}

export async function focusByName(
  diced: Diced,
  bufName: string,
): Promise<void> {
  await diced.denops.cmd(
    `execute printf('%dwincmd w', bufwinnr('${bufName}'))`,
  );
}

export async function isVisible(
  diced: Diced,
  bufName: string,
): Promise<boolean> {
  return (await dpsFns.bufwinnr(diced.denops, bufName) !== -1);
}

export async function open(
  diced: Diced,
  bufName: string,
  option?: { mods: string; opener: string },
): Promise<boolean> {
  const denops = diced.denops;
  if (await isVisible(diced, bufName)) return false;

  const opt = option ?? { mods: "", opener: "split" };
  await denops.cmd(`${opt.mods} ${opt.opener} ${bufName}`);
  return true;
}

// function! iced#buffer#open(bufname, ...) abort
//   let nr = iced#buffer#nr(a:bufname)
//   if nr < 0 | return | endif
//   let current_window = winnr()
//   let opt = get(a:, 1, {})
//
//   try
//     let &eventignore = 'WinEnter,WinLeave,BufEnter,BufLeave'
//     if !iced#buffer#is_visible(a:bufname)
//       call s:B.open(nr, {
//             \ 'opener': get(opt, 'opener', 'split'),
//             \ 'mods': get(opt, 'mods', ''),
//             \ })
//
//       if has_key(opt, 'height')
//         silent exec printf(':resize %d', opt['height'])
//       endif
//
//       call s:apply_option(opt)
//       call s:focus_window(current_window)
//     endif
//   finally
//     let &eventignore = ''
//   endtry
// endfunction

export async function appendLine(
  diced: Diced,
  bufName: string,
  oneLine: string,
): Promise<void> {
  const denops = diced.denops;
  if (denops.meta.host === "vim") {
    await denops.call("appendbufline", bufName, "$", oneLine);
  } else {
    const bufNr = await dpsFns.bufnr(denops, bufName);
    await denops.call("nvim_buf_set_lines", bufNr, -1, -1, 0, [
      oneLine,
    ]);
  }
}

// export async function clear(bufName: string): Promise<void> {}
// export async function setContents(
//   bufName: string,
//   contents: string,
// ): Promise<void> {}
// export async function close(bufName: string): Promise<void> {}
