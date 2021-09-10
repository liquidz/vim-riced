import { BasePlugin } from "../../types.ts";

import * as command from "./command.ts";
import * as interceptor from "./interceptor.ts";

export class Plugin extends BasePlugin {
  readonly commands = [
    command.Connect,
    command.Disconnect,
  ];

  readonly interceptors = [
    new interceptor.ConnectedInterceptor(),
    new interceptor.PortDetectionInterceptor(),
  ];
}
