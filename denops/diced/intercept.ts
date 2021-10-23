import { core, denops } from "./deps.ts";

const dicedKey = "__diced__";
const denopsKey = "__denops__";

export function intercept(
  diced: core.Diced,
  denops: denops.Denops,
  interceptorType: string,
  param: core.AnyParams,
  handler: core.Handler,
): Promise<core.AnyParams> {
  param[dicedKey] = diced;
  param[denopsKey] = denops;
  return core.intercept(diced, interceptorType, param, handler);
}

export function getDiced(param: core.AnyParams): core.Diced {
  return param[dicedKey] as core.Diced;
}

export function getDenops(param: core.AnyParams): denops.Denops {
  return param[denopsKey] as denops.Denops;
}
