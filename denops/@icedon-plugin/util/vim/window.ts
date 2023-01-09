import { icedon, unknownutil, vimFn } from "../../deps.ts";

type App = icedon.App;

export async function focusByWinNr(app: App, winNr: unknown) {
  await app.denops.cmd(`execute printf('%dwincmd w', ${winNr})`);
}

export async function focusByName(app: App, bufName: string) {
  await app.denops.cmd(`execute printf('%dwincmd w', bufwinnr('${bufName}'))`);
}

export async function isVisible(app: App, bufName: string): Promise<boolean> {
  return (await vimFn.bufwinnr(app.denops, bufName) !== -1);
}

export type WindowOption = {
  mods: string;
  opener: string;
};
export async function open(
  app: App,
  bufName: string,
  option?: WindowOption,
): Promise<boolean> {
  const denops = app.denops;
  if (await isVisible(app, bufName)) {
    return false;
  }

  const opt = option ?? { mods: "", opener: "split" };
  await denops.cmd(`${opt.mods} ${opt.opener} ${bufName}`);
  return true;
}

export async function appendLine(
  app: App,
  bufName: string,
  oneLine: string,
): Promise<void> {
  const denops = app.denops;
  if (denops.meta.host === "vim") {
    //console.log("FIXME start appendbufline");
    await denops.call("appendbufline", bufName, "$", oneLine);
  } else {
    const bufNr = await vimFn.bufnr(denops, bufName);
    await denops.call("nvim_buf_set_lines", bufNr, -1, -1, 0, [
      oneLine,
    ]);
  }
}

export async function clear(app: App, bufName: string): Promise<void> {
  const denops = app.denops;
  await vimFn.deletebufline(denops, bufName, 1, "$");
}

export async function close(app: App, bufName: string): Promise<boolean> {
  const denops = app.denops;
  if (!await isVisible(app, bufName)) {
    return false;
  }

  const currentWin = await vimFn.winnr(denops);
  const targetWin = await vimFn.bufwinnr(denops, bufName);
  unknownutil.assertNumber(currentWin);
  unknownutil.assertNumber(targetWin);

  await focusByName(app, bufName);
  await app.denops.cmd("q");

  if (targetWin >= currentWin) {
    await focusByWinNr(app, currentWin);
  }
  return true;
}
