import * as navigator from "../paredit/navigator.ts";

export function extractName(nsForm: string): string {
  let idx: number = navigator.forwardSexp(nsForm, 1);
  if (idx > nsForm.length) {
    throw new Deno.errors.InvalidData("invalid ns form");
  }

  // skip meta data
  if (nsForm[idx] === "^") {
    idx = navigator.forwardSexp(nsForm, idx);
    idx = navigator.forwardSexp(nsForm, idx);
  }

  const endIdx = navigator.forwardSexp(nsForm, idx);
  return nsForm.substring(idx, endIdx).replaceAll(")", "").trim();
}
