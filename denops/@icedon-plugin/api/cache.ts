import { icedon, unknownutil } from "../deps.ts";
import * as t from "../types.ts";

type App = icedon.App;

/**
 * cf ../builtin/cache.ts
 */

export async function set(
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

export async function get(app: App, key: string): Promise<unknown> {
  return await app.requestApi(
    t.CacheGetItemApi,
    { key: key } as t.CacheGetItemArg,
  );
}

export async function remove(app: App, key: string): Promise<boolean> {
  const res = await app.requestApi(
    t.CacheDeleteItemApi,
    { key: key } as t.CacheDeleteItemArg,
  );
  unknownutil.assertBoolean(res);
  return res;
}

export async function hasItem(app: App, key: string): Promise<boolean> {
  const res = await app.requestApi(
    t.CacheHasItemApi,
    { key: key } as t.CacheHasItemArg,
  );
  unknownutil.assertBoolean(res);
  return res;
}

export async function clear(app: App): Promise<boolean> {
  const res = await app.requestApi("icedon_cache_clear", []);
  unknownutil.assertBoolean(res);
  return res;
}
