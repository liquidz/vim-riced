import { icedon, unknownutil } from "../deps.ts";
import * as t from "../types.ts";

type App = icedon.App;
type Position = icedon.Position;

/**
 * cf ../builtin/info_buffer.ts
 */
export function appendLinesToInfoBuffer(app: App, lines: string[]) {
  return app.requestApi("icedon_append_to_info_buffer", lines);
}

/**
 * cf ../builtin/paredit.ts
 */
export async function getCurrentTopForm(app: App): Promise<[string, Position]> {
  const res = await app.requestApi(t.GetCurrentTopFormApi, []);
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
  const res = await app.requestApi(t.GetCurrentFormApi, []);
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
  const res = await app.requestApi(t.GetNsFormApi, []);
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
  const res = await app.requestApi(t.GetNsNameApi, []);
  unknownutil.assertString(res);
  return res;
}

/**
 * cf ../builtin/cursor.ts
 */
export async function getCursorPosition(app: App): Promise<Position> {
  const res = await app.requestApi(t.GetCursorPositionApi, []);
  unknownutil.assertArray<number>(res);
  return [res[0], res[1]];
}

/**
 * cf ../builtin/cache.ts
 */
export async function cacheSet(
  app: App,
  key: string,
  val: unknown,
  ttl?: number,
): Promise<void> {
  await app.requestApi(
    t.CacheSetItemApi,
    { key: key, value: val, ttl: ttl } as t.CacheSetItemArg,
  );
  return;
}

/**
 * cf ../builtin/cache.ts
 */
export async function cacheGet(app: App, key: string): Promise<unknown> {
  return await app.requestApi(
    t.CacheGetItemApi,
    { key: key } as t.CacheGetItemArg,
  );
}

/**
 * cf ../builtin/cache.ts
 */
export async function cacheDelete(app: App, key: string): Promise<boolean> {
  const res = await app.requestApi(
    t.CacheDeleteItemApi,
    { key: key } as t.CacheDeleteItemArg,
  );
  unknownutil.assertBoolean(res);
  return res;
}

/**
 * cf ../builtin/cache.ts
 */
export async function cacheHasItem(app: App, key: string): Promise<boolean> {
  const res = await app.requestApi(
    t.CacheHasItemApi,
    { key: key } as t.CacheHasItemArg,
  );
  unknownutil.assertBoolean(res);
  return res;
}

/**
 * cf ../builtin/cache.ts
 */
export async function cacheClear(app: App): Promise<boolean> {
  const res = await app.requestApi("icedon_cache_clear", []);
  unknownutil.assertBoolean(res);
  return res;
}

/**
 * cf ../builtin/nrepl_op.ts
 */
export async function isSupportedOp(
  app: App,
  op: string,
  force?: boolean,
): Promise<boolean> {
  const res = await app.requestApi(
    t.NreplDescribeApi,
    { force: force } as t.NreplDescribeArg,
  ) as icedon.NreplResponse;

  const ops = res.getOne("ops");
  if (!unknownutil.isObject(ops)) {
    return false;
  }
  return (ops[op] !== undefined);
}
