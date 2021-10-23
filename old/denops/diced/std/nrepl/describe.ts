import { Diced } from "../../types.ts";
import { unknownutil } from "../../deps.ts";
import * as ops from "./operation/nrepl.ts";

export async function isSupportedOperation(
  diced: Diced,
  opName: string,
): Promise<boolean> {
  const resp = await ops.describeOp(diced);
  const supportedOps = resp.getFirst("ops");
  if (!unknownutil.isObject(supportedOps)) return false;

  return (supportedOps[opName] != null);
}
