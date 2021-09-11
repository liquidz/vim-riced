import { Diced } from "../types.ts";

export function call(
  diced: Diced,
  apiName: string,
  ...args: Array<unknown>
): Promise<unknown> {
  return diced.denops.dispatch("diced", "api", [apiName, ...args]);
}
