import { Diced, Hook, HookParams, HookType } from "../types.ts";
import * as msg from "../message/core.ts";

export class ConnectedHook extends Hook {
  readonly type: HookType = "connected";

  async run(diced: Diced, params: HookParams): Promise<HookParams> {
    await msg.info(diced, "Connected");
    return params;
  }
}
