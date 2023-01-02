import { App } from "../../types.ts";
import { request } from "../api.ts";

/**
 * cf ../builtin/info_buffer/mod.ts
 */
export function appendLinesToInfoBuffer(app: App, lines: string[]) {
  return request(app, "icedon_append_to_info_buffer", lines);
}
