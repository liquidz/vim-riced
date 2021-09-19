import { BasePlugin } from "../../types.ts";
import { PortDetectionInterceptor } from "./port_detection.ts";
import { StartingReplInterceptor } from "./starting_repl.ts";

export class Plugin extends BasePlugin {
  readonly interceptors = [
    new PortDetectionInterceptor(),
    new StartingReplInterceptor(),
  ];
}
