import { Diced, Hook, HookParams, HookType } from "../types.ts";

export class ConnectedHook extends Hook {
  readonly type: HookType = "connected";

  async run(_diced: Diced, params: HookParams): Promise<HookParams> {
    console.log("hook connected");
    return params;
  }
}
