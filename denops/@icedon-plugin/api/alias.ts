import { unknownutil } from "../deps.ts";
import { App, Position } from "../types.ts";
import { request } from "../api.ts";

/**
 * cf ../builtin/info_buffer.ts
 */
export function appendLinesToInfoBuffer(app: App, lines: string[]) {
  return request(app, "icedon_append_to_info_buffer", lines);
}

/**
 * cf ../builtin/paredit.ts
 */
export async function getCurrentTopForm(app: App): Promise<[string, Position]> {
  const res = await request(app, "icedon_get_current_top_form", []);
  unknownutil.assertArray(res);
  unknownutil.assertString(res[0]);
  unknownutil.assertNumber(res[1]);
  unknownutil.assertNumber(res[2]);
  return [res[0], [res[1], res[2]]];
}

/**
 * cf ../builtin/paredit.ts
 */
export async function getCurrentForm(app: App): Promise<[string, Position]> {
  const res = await request(app, "icedon_get_current_form", []);
  unknownutil.assertArray(res);
  unknownutil.assertString(res[0]);
  unknownutil.assertNumber(res[1]);
  unknownutil.assertNumber(res[2]);
  return [res[0], [res[1], res[2]]];
}

/**
 * cf ../builtin/paredit.ts
 */
export async function getNsForm(app: App): Promise<[string, Position]> {
  const res = await request(app, "icedon_get_ns_form", []);
  unknownutil.assertArray(res);
  unknownutil.assertString(res[0]);
  unknownutil.assertNumber(res[1]);
  unknownutil.assertNumber(res[2]);
  return [res[0], [res[1], res[2]]];
}

/**
 * cf ../builtin/namespace.ts
 */
export async function getNsName(app: App): Promise<string> {
  const res = await request(app, "icedon_ns_name", []);
  unknownutil.assertString(res);
  return res;
}

/**
 * cf ../builtin/cursor.ts
 */
export async function getCursorPosition(app: App): Promise<Position> {
  const res = await request(app, "icedon_get_cursor_position", []);
  unknownutil.assertArray<number>(res);
  return [res[0], res[1]];
}
