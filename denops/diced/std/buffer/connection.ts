import { Diced } from "../../types.ts";
import { unknownutil } from "../../deps.ts";
import * as core from "../../core/mod.ts";

export async function isValid(diced: Diced): Promise<boolean> {
  if (!core.isConnected(diced)) return false;

  const ext = await diced.denops.call("expand", "%:e");
  if (!unknownutil.isString(ext)) return false;

  if (ext !== "cljc" && ext !== diced.connection.current!.type) {
    return false;
  }

  return true;
}
