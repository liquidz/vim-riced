import { icedon, unknownutil } from "../deps.ts";
import * as t from "../types.ts";

type App = icedon.App;

/**
 * cf ../builtin/info_buffer.ts
 */
export function appendLinesToInfoBuffer(app: App, lines: string[]) {
  return app.requestApi("icedon_append_to_info_buffer", lines);
}
