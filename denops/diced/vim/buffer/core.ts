import { Denops, fns } from "../../deps.ts";

export async function focusByWinNr(
  denops: Denops,
  winNr: unknown,
): Promise<void> {
  await denops.cmd(
    `execute printf('%dwincmd w', ${winNr})`,
  );
}

export async function focusByName(
  denops: Denops,
  bufName: string,
): Promise<void> {
  await denops.cmd(
    `execute printf('%dwincmd w', bufwinnr('${bufName}'))`,
  );
}

export async function isVisible(
  denops: Denops,
  bufName: string,
): Promise<boolean> {
  return (await fns.bufwinnr(denops, bufName) !== -1);
}

export async function open(
  denops: Denops,
  bufName: string,
  option?: { mods: string; opener: string },
): Promise<boolean> {
  if (await isVisible(denops, bufName)) return false;

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
  denops: Denops,
  bufName: string,
  oneLine: string,
): Promise<void> {
  if (denops.meta.host === "vim") {
    await denops.call("appendbufline", bufName, "$", oneLine);
  } else {
    const bufNr = await fns.bufnr(denops, bufName);
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
