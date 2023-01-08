import { AppMock, asserts, withDenops } from "../test_deps.ts";
import {
  cacheClear,
  cacheDelete,
  cacheGet,
  cacheHasItem,
  cacheSet,
} from "../api/alias.ts";

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

    asserts.assertEquals(await cacheGet(app, key), undefined);
    asserts.assertEquals(await cacheHasItem(app, key), false);

    // set
    await cacheSet(app, key, "hello", ttl);
    asserts.assertEquals(await cacheGet(app, key), "hello");
    asserts.assertEquals(await cacheHasItem(app, key), true);

    // overwrite
    await cacheSet(app, key, "world", ttl);
    asserts.assertEquals(await cacheGet(app, key), "world");

    // delete
    asserts.assertEquals(await cacheDelete(app, key), true);
    asserts.assertEquals(await cacheDelete(app, key), false);
    asserts.assertEquals(await cacheGet(app, key), undefined);
    asserts.assertEquals(await cacheHasItem(app, key), false);

    // expire
    await cacheSet(app, key, "hello", ttl);
    asserts.assertEquals(await cacheGet(app, key), "hello");
    await sleep(ttl);
    asserts.assertEquals(await cacheGet(app, key), undefined);
    asserts.assertEquals(await cacheHasItem(app, key), false);

    // clear
    await cacheSet(app, key, "hello", ttl);
    await cacheSet(app, extraKey, "world", ttl);
    asserts.assertEquals(await cacheHasItem(app, key), true);
    asserts.assertEquals(await cacheHasItem(app, extraKey), true);
    await cacheClear(app);
    asserts.assertEquals(await cacheHasItem(app, key), false);
    asserts.assertEquals(await cacheHasItem(app, extraKey), false);
  });
});
