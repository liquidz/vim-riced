import { AppMock, asserts, withDenops } from "../test_deps.ts";
import * as api from "../api.ts";

const ttl = 100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

Deno.test("cache", async () => {
  await withDenops("vim", async (denops) => {
    const app = await AppMock.build({ denops: denops });
    const key = crypto.randomUUID();
    const extraKey = crypto.randomUUID();

    asserts.assertEquals(await api.cache.get(app, key), undefined);
    asserts.assertEquals(await api.cache.hasItem(app, key), false);

    // set
    await api.cache.set(app, key, "hello", ttl);
    asserts.assertEquals(await api.cache.get(app, key), "hello");
    asserts.assertEquals(await api.cache.hasItem(app, key), true);

    // overwrite
    await api.cache.set(app, key, "world", ttl);
    asserts.assertEquals(await api.cache.get(app, key), "world");

    // delete
    asserts.assertEquals(await api.cache.remove(app, key), true);
    asserts.assertEquals(await api.cache.remove(app, key), false);
    asserts.assertEquals(await api.cache.get(app, key), undefined);
    asserts.assertEquals(await api.cache.hasItem(app, key), false);

    // expire
    await api.cache.set(app, key, "hello", ttl);
    asserts.assertEquals(await api.cache.get(app, key), "hello");
    await sleep(ttl);
    asserts.assertEquals(await api.cache.get(app, key), undefined);
    asserts.assertEquals(await api.cache.hasItem(app, key), false);

    // clear
    await api.cache.set(app, key, "hello", ttl);
    await api.cache.set(app, extraKey, "world", ttl);
    asserts.assertEquals(await api.cache.hasItem(app, key), true);
    asserts.assertEquals(await api.cache.hasItem(app, extraKey), true);
    await api.cache.clear(app);
    asserts.assertEquals(await api.cache.hasItem(app, key), false);
    asserts.assertEquals(await api.cache.hasItem(app, extraKey), false);
  });
});
