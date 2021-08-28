import * as strParedit from "./paredit.ts";

export function extractName(nsForm: string): string {
  let idx: number = strParedit.forwardSexp(nsForm, 1);
  if (idx > nsForm.length) {
    throw new Deno.errors.InvalidData("invalid ns form");
  }

  // skip meta data
  if (nsForm[idx] === "^") {
    idx = strParedit.forwardSexp(nsForm, idx);
    idx = strParedit.forwardSexp(nsForm, idx);
  }

  const endIdx = strParedit.forwardSexp(nsForm, idx);
  return nsForm.substring(idx, endIdx).replaceAll(")", "").trim();
}
