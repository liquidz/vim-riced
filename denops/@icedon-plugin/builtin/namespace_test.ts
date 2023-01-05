import { asserts } from "../test_deps.ts";
import * as sut from "./namespace.ts";

Deno.test("extractNsName", () => {
  asserts.assertEquals(
    sut.extractNsName(`(ns foo.bar\n)`),
    "foo.bar",
  );
  asserts.assertEquals(
    sut.extractNsName(`(ns ^{:foo :bar} foo.bar)`),
    "foo.bar",
  );
  asserts.assertEquals(
    sut.extractNsName(`(ns foo.bar (:require))`),
    "foo.bar",
  );
  asserts.assertEquals(
    sut.extractNsName(`(ns ^{:foo :bar} foo.bar (:require))`),
    "foo.bar",
  );
});
