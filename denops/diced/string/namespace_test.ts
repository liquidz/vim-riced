import { asserts } from "../test_deps.ts";
import * as sut from "./namespace.ts";

Deno.test("string.namespace.extractName", () => {
  asserts.assertEquals(
    sut.extractName(`(ns foo)`),
    "foo",
  );
  asserts.assertEquals(
    sut.extractName(`(ns\nfoo)`),
    "foo",
  );
  asserts.assertEquals(
    sut.extractName(`(ns ^:dummy foo)`),
    "foo",
  );
  asserts.assertEquals(
    sut.extractName(`(ns\n^:dummy\nfoo)`),
    "foo",
  );
  asserts.assertEquals(
    sut.extractName(`(ns ^:dummy foo (:require []))`),
    "foo",
  );
  asserts.assertEquals(
    sut.extractName(`(ns\n^:dummy\nfoo\n(:require []))`),
    "foo",
  );

  asserts.assertThrows(() => sut.extractName(""));
});

Deno.test("cycleName", () => {
  asserts.assertEquals(sut.cycleName("foo"), "foo-test");
  asserts.assertEquals(sut.cycleName("foo-test"), "foo");
});
