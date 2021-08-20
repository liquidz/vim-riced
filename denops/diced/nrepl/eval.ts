import { Diced, NreplEvalOption } from "../types.ts";
import * as ops from "./operation/core.ts";

export async function evalCode(
  diced: Diced,
  code: string,
  option?: NreplEvalOption,
): Promise<Array<string>> {
  const res = await ops.evalOp(diced, code, option);
  const values = res.getAll("value");

  const verbose = (res.context["verbose"] ?? "true") === "true";
  if (verbose) {
    for (const v of values) {
      console.log(v);
    }
  }

  return values as string[];
}
