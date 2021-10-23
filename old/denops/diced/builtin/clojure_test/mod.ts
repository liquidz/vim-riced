import { BasePlugin } from "../../types.ts";

import * as command from "./command.ts";

export class Plugin extends BasePlugin {
  readonly commands = [
    command.TestUnderCursor,
    command.TestNs,
  ];
}
