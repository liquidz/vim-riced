import { icedon } from "../deps.ts";
import { GetNsNameApi } from "../types.ts";
import * as apiAlias from "../api/alias.ts";
import * as paredit from "../util/string/paredit.ts";

type App = icedon.App;

function extractNsName(nsForm: string): string {
  const code = nsForm.trim();
  let idx = 0;

  idx = paredit.forwardSexp(code, 1);
  // skip meta
  if (code[idx] === "^") {
    idx = paredit.forwardSexp(code, idx + 1);
  }
  const end = paredit.forwardSexp(code, idx);
  return code.substring(idx, end).replaceAll(/[()]/g, "").trim();
}

const getNsName = {
  name: GetNsNameApi,
  run: async (app: App, _args: unknown[]) => {
    const [code] = await apiAlias.getNsForm(app);
    return extractNsName(code);
  },
};

export class Api extends icedon.ApiPlugin {
  readonly name = "icedon builtin namespace";
  readonly apis = [getNsName];
}
