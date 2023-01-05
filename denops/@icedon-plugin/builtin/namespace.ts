import { ApiPlugin, App } from "../types.ts";
import * as apiAlias from "../api/alias.ts";
import * as paredit from "../util/string/paredit.ts";

// TODO fix not to export
export function extractNsName(nsForm: string): string {
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
  name: "icedon_ns_name",
  run: async (app: App, _args: unknown[]) => {
    const [code] = await apiAlias.getNsForm(app);
    return extractNsName(code);
  },
};

export class Api extends ApiPlugin {
  readonly name = "icedon builtin namespace";
  readonly apis = [getNsName];
}
