import { Diced, NreplEvalOption } from "../types.ts";
import { fns, unknownutil } from "../deps.ts";
import * as ops from "./operation/core.ts";

export async function evalCode(
  diced: Diced,
  code: string,
  option?: NreplEvalOption,
): Promise<Array<string>> {
  const _option = option || {};

  if (_option.filePath == null) {
    const [filePath, currentPos] = await diced.denops.batch(
      ["expand", "%p"],
      ["getcurpos"],
    );
    unknownutil.ensureString(filePath);
    unknownutil.ensureArray<number>(currentPos);

    _option.filePath = filePath;
    _option.line = currentPos[1];
    _option.column = currentPos[2];
  }

  const res = await ops.evalOp(diced, code, _option);
  const values = res.getAll("value");

  const verbose = (res.context["verbose"] ?? "true") === "true";
  if (verbose) {
    for (const v of values) {
      console.log(v);
    }
  }

  return values as string[];
}
