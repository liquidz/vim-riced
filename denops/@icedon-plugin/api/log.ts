import { icedon } from "../deps.ts";
import * as t from "../types.ts";
import { MessageName } from "../builtin/message/names.ts";

type App = icedon.App;

export async function raw(app: App, text: string) {
  return await app.requestApi(t.MessageRaw, [text]);
}

export async function echo(
  app: App,
  name: MessageName,
  ...params: unknown[]
) {
  return await app.requestApi(t.MessageEcho, [name, ...params]);
}

export async function info(
  app: App,
  name: MessageName,
  ...params: unknown[]
) {
  return await app.requestApi(t.MessageInfo, [name, ...params]);
}

export async function warn(
  app: App,
  name: MessageName,
  ...params: unknown[]
) {
  return await app.requestApi(t.MessageWarn, [name, ...params]);
}

export async function error(
  app: App,
  name: MessageName,
  ...params: unknown[]
) {
  return await app.requestApi(t.MessageError, [name, ...params]);
}
