import { unknownutil, vimFn } from "../../../deps.ts";
import { App } from "../../../types.ts";
import { rangeForDefun } from "../string/paredit.ts";

export async function getCurrentTopForm(app: App): Promise<string> {
  const denops = app.denops;
  const startPos = await vimFn.searchpos(denops, "^\\S", "bcnW");
  unknownutil.assertArray<number>(startPos);

  const lines = await vimFn.getline(denops, startPos[0], "$");
  unknownutil.assertArray<string>(lines);

  const code = lines.join("\n");
  const [_, endIndex] = rangeForDefun(code, 0);

  return code.substring(0, endIndex);
}
