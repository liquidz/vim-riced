import { fns, unknownutil } from "../deps.ts";
import { Diced } from "../types.ts";
import * as utilVim from "../util/vim.ts";
import * as paredit from "../paredit/core.ts";
import * as strNs from "../string/namespace.ts";

async function searchNsForm(diced: Diced): Promise<boolean> {
  const denops = diced.denops;

  await fns.cursor(denops, 1, 1);
  const [nsPos, inNsPos] = await denops.batch(
    ["searchpos", "(ns[ \r\n]", "n"],
    ["searchpos", "(in-ns[ \r\n]", "n"],
  );

  unknownutil.ensureArray<number>(nsPos);
  unknownutil.ensureArray<number>(inNsPos);

  const [l1, c1] = nsPos;
  const [l2, c2] = inNsPos;

  if (l1 === 0 && l2 === 0) {
    return false;
  } else if (l1 !== 0 && l2 === 0) {
    await fns.cursor(denops, l1, c1);
  } else if (l1 === 0 && l2 !== 0) {
    await fns.cursor(denops, l2, c2);
  } else if (l1 < l2) {
    await fns.cursor(denops, l1, c1);
  } else {
    await fns.cursor(denops, l2, c2);
  }
  return true;
}

export async function extractName(diced: Diced): Promise<string> {
  const view = await utilVim.saveView(diced);
  try {
    const doesExists = await searchNsForm(diced);
    if (!doesExists) {
      return Promise.reject(new Deno.errors.NotFound("ns form is not found"));
    }

    const form = await paredit.getCurrentTopForm(diced.denops);
    return strNs.extractName(form);
  } catch (err) {
    return Promise.reject(err);
  } finally {
    await utilVim.restView(diced, view);
  }
}
