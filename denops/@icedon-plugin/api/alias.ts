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
