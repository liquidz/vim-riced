type CacheItem = {
  value: unknown;
  ttl: number;
};

const DEFAULT_TTL = 60 * 1000; // ms
const cacheRecord: Record<string, CacheItem> = {};

function now(): number {
  return (new Date()).getTime();
}

export function setItem(key: string, value: unknown, ttl?: number) {
  cacheRecord[key] = {
    value: value,
    ttl: now() + (ttl ?? DEFAULT_TTL),
  };
}

export function getItem(key: string): unknown {
  const item = cacheRecord[key];
  if (item == null || item.ttl < now()) {
    // expired
    delete cacheRecord[key];
    return undefined;
  }
  return item.value;
}

export function deleteItem(key: string): boolean {
  if (cacheRecord[key] == null) {
    return false;
  }
  delete cacheRecord[key];
  return true;
}

export function hasItem(key: string): boolean {
  const item = cacheRecord[key];
  if (item == null || item.ttl < now()) {
    // expired
    delete cacheRecord[key];
    return false;
  }
  return true;
}
