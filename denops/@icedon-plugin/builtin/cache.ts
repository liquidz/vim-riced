import { icedon, z } from "../deps.ts";

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

const SetItemArg = z.object({
  args: z.tuple([
    z.string(), // key
    z.unknown(), // value
  ]),
  opts: z.object({
    ttl: z.coerce.number().optional(),
  }),
});

const setItem = {
  name: "icedon_cache_set",
  run: (_app: App, args: unknown[]) => {
    const parsed = SetItemArg.parse(icedon.arg.parse(args));
    const key = parsed.args[0];
    const val = parsed.args[1];
    const ttl = parsed.opts.ttl || defaultTtl;

    cacheRecord[key] = { value: val, ttl: now() + ttl };
    return Promise.resolve();
  },
};

const GetItemArg = z.object({
  args: z.tuple([z.string()]),
});

const getItem = {
  name: "icedon_cache_get",
  run: (_app: App, args: unknown[]) => {
    const key = GetItemArg.parse(icedon.arg.parse(args)).args[0];
    const item = cacheRecord[key];
    if (item === undefined || item.ttl < now()) {
      // expired
      delete cacheRecord[key];
      return Promise.resolve(undefined);
    }
    return Promise.resolve(item.value);
  },
};

const DeleteItemArg = z.object({
  args: z.tuple([z.string()]),
});

const deleteItem = {
  name: "icedon_cache_delete",
  run: (_app: App, args: unknown[]) => {
    const key = DeleteItemArg.parse(icedon.arg.parse(args)).args[0];
    if (cacheRecord[key] === undefined) {
      return Promise.resolve(false);
    }
    delete cacheRecord[key];
    return Promise.resolve(true);
  },
};

const HasItemArg = z.object({
  args: z.tuple([z.string()]),
});

const hasItem = {
  name: "icedon_cache_has_item",
  run: (_app: App, args: unknown[]) => {
    const key = HasItemArg.parse(icedon.arg.parse(args)).args[0];
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

export class Api extends icedon.ApiPlugin {
  readonly name = "icedon builtin cache";
  readonly apis = [setItem, getItem, deleteItem, hasItem, clearItems];
}
