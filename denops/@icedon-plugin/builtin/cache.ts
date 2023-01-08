import { ApiPlugin, App } from "../types.ts";
import { unknownutil } from "../deps.ts";
import { parseArguments } from "../util/array/argument.ts";

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
  name: "icedon_cache_set",
  run: (_app: App, args: unknown[]) => {
    const parsed = parseArguments(args);
    const key = parsed.args[0];
    const val = parsed.args[1];
    const ttl = parsed.options["ttl"] || defaultTtl;

    if (
      !unknownutil.isString(key) || val === undefined ||
      !unknownutil.isNumber(ttl)
    ) {
      return Promise.resolve();
    }

    cacheRecord[key] = { value: val, ttl: now() + ttl };
    return Promise.resolve();
  },
};

const getItem = {
  name: "icedon_cache_get",
  run: (_app: App, args: unknown[]) => {
    const key = args[0];
    if (!unknownutil.isString(key)) {
      return Promise.resolve(undefined);
    }

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
  name: "icedon_cache_delete",
  run: (_app: App, args: unknown[]) => {
    const key = args[0];
    if (!unknownutil.isString(key)) {
      return Promise.resolve(false);
    }

    if (cacheRecord[key] === undefined) {
      return Promise.resolve(false);
    }
    delete cacheRecord[key];
    return Promise.resolve(true);
  },
};

const hasItem = {
  name: "icedon_cache_has_item",
  run: (_app: App, args: unknown[]) => {
    const key = args[0];
    if (!unknownutil.isString(key)) {
      return Promise.resolve(false);
    }
    const item = cacheRecord[key];
    if (item === undefined || item.ttl < now()) {
      delete cacheRecord[key];
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  },
};

const clearItems = {
  name: "icedon_cache_clear",
  run: (_app: App, _args: unknown[]) => {
    for (const key of Object.keys(cacheRecord)) {
      delete cacheRecord[key];
    }
    return Promise.resolve(true);
  },
};

export class Api extends ApiPlugin {
  readonly name = "icedon builtin cache";
  readonly apis = [setItem, getItem, deleteItem, hasItem, clearItems];
}
