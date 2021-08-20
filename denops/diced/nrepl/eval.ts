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

export async function loadFile(diced: Diced): Promise<boolean> {
  const denops = diced.denops;
  const content = (await fns.getline(denops, 1, "$")).join("\n");
  const [fileName, filePath] = await denops.batch(
    ["expand", "%"],
    ["expand", "%:p"],
  );
  unknownutil.ensureString(fileName);
  unknownutil.ensureString(filePath);

  const resp = await ops.loadFileOp(diced, content, {
    fileName: fileName,
    filePath: filePath,
  });

  const errors = resp.getAll("error").concat(resp.getAll("err"));
  // TODO: error handling
  return (errors.length === 0);
}
