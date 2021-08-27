import { Denops, fns } from "../../deps.ts";

export async function open(
  denops: Denops,
  bufName: string,
  option?: { mods: string; opener: string },
): Promise<void> {
  const opt = option ?? { mods: "", opener: "split" };
  await denops.cmd(`${opt.mods} ${opt.opener} ${bufName}`);
}

export async function focus(
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
