import { Diced, NreplEvalOption } from "../../types.ts";
import { dpsFns, unknownutil } from "../../deps.ts";

import * as ops from "./operation/nrepl.ts";
import * as nreplDesc from "./describe.ts";

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
  return res.getAll("value").filter((v) => {
    return (typeof v === "string");
  }) as string[];
}

export async function loadCurrentFile(diced: Diced): Promise<boolean> {
  const denops = diced.denops;
  const [fileName, filePath] = await denops.batch(
    ["expand", "%"],
    ["expand", "%:p"],
  );
  unknownutil.ensureString(fileName);
  unknownutil.ensureString(filePath);

  if (await nreplDesc.isSupportedOperation(diced, "load-file")) {
    const content = (await dpsFns.getline(denops, 1, "$")).join("\n");
    const resp = await ops.loadFileOp(diced, content, {
      fileName: fileName,
      filePath: filePath,
    });

    const errors = resp.getAll("error").concat(resp.getAll("err"));
    // TODO: error handling
    return (errors.length === 0);
  } else {
    const resp = await ops.evalOp(diced, `(load-file "${filePath}")`);
    const errors = resp.getAll("error").concat(resp.getAll("err"));
    // TODO: error handling
    return (errors.length === 0);
  }
}
