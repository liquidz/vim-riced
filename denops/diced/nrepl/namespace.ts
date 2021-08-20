import { Diced } from "../types.ts";
import { evalCode } from "./eval.ts";

export async function name(diced: Diced): Promise<string> {
  const res = await evalCode(diced, `(ns-name *ns*)`, {
    context: { verbose: "false" },
  });
  if (res.length === 0) {
    return Promise.reject(new Deno.errors.InvalidData("invalid response"));
  }
  return res[0];
}

export async function inNs(diced: Diced, nsName?: string): Promise<string> {
  const ns = nsName ?? await name(diced);
  const res = await evalCode(diced, `(in-ns '${ns})`, {
    context: { verbose: "false" },
  });
  if (res.length === 0) {
    return Promise.reject(new Deno.errors.InvalidData("invalid response"));
  }
  return res[0];
}
