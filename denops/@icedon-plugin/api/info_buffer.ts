import { icedon } from "../deps.ts";
import * as t from "../types.ts";

type App = icedon.App;

/**
 * cf ../builtin/info_buffer.ts
 */
export async function append(app: App, lines: string[]) {
  return await app.requestApi(t.AppendToInfoBufferApi, lines);
}
