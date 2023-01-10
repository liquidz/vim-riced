import { icedon } from "../deps.ts";
import {
  CacheClearItemsApi,
  CacheDeleteItemApi,
  CacheDeleteItemArg,
  CacheGetItemApi,
  CacheGetItemArg,
  CacheHasItemApi,
  CacheHasItemArg,
  CacheSetItemApi,
  CacheSetItemArg,
} from "../types.ts";

type App = icedon.App;
type CacheItem = {
  value: unknown;
  ttl: number;
};

const defaultTtl = 60 * 1000; // ms
const cacheRecord: Record<string, CacheItem> = {};

function now(): number {
  return (new Date()).getTime();
}

const setItem = {
  name: CacheSetItemApi,
  run: (_app: App, args: unknown[]) => {
    const parsed = CacheSetItemArg.parse(icedon.arg.parse(args).opts);
    const ttl = parsed.ttl || defaultTtl;

    cacheRecord[parsed.key] = { value: parsed.value, ttl: now() + ttl };
    return Promise.resolve();
  },
};

const getItem = {
  name: CacheGetItemApi,
  run: (_app: App, args: unknown[]) => {
    const key = CacheGetItemArg.parse(icedon.arg.parse(args).opts).key;
    const item = cacheRecord[key];
    if (item === undefined || item.ttl < now()) {
      // expired
      delete cacheRecord[key];
      return Promise.resolve(undefined);
    }
    return Promise.resolve(item.value);
  },
};

const deleteItem = {
  name: CacheDeleteItemApi,
  run: (_app: App, args: unknown[]) => {
    const key = CacheDeleteItemArg.parse(icedon.arg.parse(args).opts).key;
    if (cacheRecord[key] === undefined) {
      return Promise.resolve(false);
    }
    delete cacheRecord[key];
    return Promise.resolve(true);
  },
};

const hasItem = {
  name: CacheHasItemApi,
  run: (_app: App, args: unknown[]) => {
    const key = CacheHasItemArg.parse(icedon.arg.parse(args).opts).key;
    const item = cacheRecord[key];
    if (item === undefined || item.ttl < now()) {
      delete cacheRecord[key];
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  },
};

const clearItems = {
  name: CacheClearItemsApi,
  run: (_app: App, _args: unknown[]) => {
    for (const key of Object.keys(cacheRecord)) {
      delete cacheRecord[key];
    }
    return Promise.resolve(true);
  },
};

export class Api extends icedon.ApiPlugin {
  readonly name = "icedon builtin cache";
  readonly apis = [setItem, getItem, deleteItem, hasItem, clearItems];
}
