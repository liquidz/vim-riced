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

export async function clear(diced: Diced, bufName: string): Promise<void> {
  const denops = diced.denops;
  await dpsFns.deletebufline(denops, bufName, 1, "$");
}
