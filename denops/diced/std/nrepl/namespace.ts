// Namespace functions
// Functions related to namespace to be processed through nREPL
import { Diced } from "../../types.ts";
import * as nreplEval from "./eval.ts";

export async function name(diced: Diced): Promise<string> {
  const res = await nreplEval.evalCode(
    diced,
    `(clojure.core/ns-name *ns*)`,
    { context: { verbose: "false" } },
  );
  if (res.length === 0) {
    return Promise.reject(new Deno.errors.InvalidData("invalid response"));
  }
  return res[0];
}

export async function inNs(diced: Diced, nsName?: string): Promise<string> {
  const ns = nsName ?? await name(diced);
  const res = await nreplEval.evalCode(
    diced,
    `(clojure.core/in-ns '${ns})`,
    { context: { verbose: "false" } },
  );
  if (res.length === 0) {
    return Promise.reject(new Deno.errors.InvalidData("invalid response"));
  }
  return res[0];
}

export async function require(diced: Diced, nsName: string): Promise<string> {
  const res = await nreplEval.evalCode(
    diced,
    `(clojure.core/require '${nsName})`,
    { context: { verbose: "false" } },
  );

  if (res.length === 0) {
    return Promise.reject(new Deno.errors.InvalidData("invalid response"));
  }
  return res[0];
}
