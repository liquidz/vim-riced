import { Diced } from "../types.ts";
import { evalCode } from "./eval.ts";

export async function name(diced: Diced): Promise<string> {
  const res = await evalCode(diced, `(ns-name *ns*)`, {
    context: { verbose: "false" },
  });
  if (res.length === 0) {
    return Promise.reject("FIXME");
  }
  return res[0];
}
