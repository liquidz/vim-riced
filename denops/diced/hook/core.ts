import { Diced, Hook, HookParams, HookType } from "../types.ts";

export function addHook(diced: Diced, hook: Hook) {
  diced.hooks.push(hook);
}

export async function runHook(
  diced: Diced,
  hookType: HookType,
  params: HookParams,
): Promise<HookParams> {
  return diced.hooks
    .filter((h) => h.type === hookType)
    .reduce(async (acc: HookParams, h: Hook) => {
      return await h.run(diced, acc);
    }, params);
}
