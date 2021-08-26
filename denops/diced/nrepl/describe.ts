import { Diced } from "../types.ts";
import { unknownutil } from "../deps.ts";
import * as ops from "./operation/core.ts";

export async function isSupportedOperation(
  diced: Diced,
  opName: string,
): Promise<boolean> {
  const resp = await ops.describeOp(diced);
  const supportedOps = resp.getFirst("ops");
  if (!unknownutil.isObject(supportedOps)) return false;

  return (supportedOps[opName] != null);
}

// resp.getFirst('versions')
// [denops] {
// [denops]   clojure: { incremental: 3, major: 1, minor: 10, "version-string": "1.10.3" },
// [denops]   java: {
// [denops]     incremental: "0",
// [denops]     major: "1",
// [denops]     minor: "8",
// [denops]     update: "282",
// [denops]     "version-string": "1.8.0_282"
// [denops]   },
// [denops]   nrepl: { incremental: 3, major: 0, minor: 8, "version-string": "0.8.3" }
// [denops] }
