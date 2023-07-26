import { asserts } from "../test_deps.ts";
import * as sut from "./impl.ts";

Deno.test("parse", () => {
  const code = "(ns foo)";
  const loc = sut.parse(code);

  asserts.assertEquals(loc.code, code);
  asserts.assertEquals(loc.idx, 0);
  asserts.assertEquals(loc.node.type, "toplevel");
  asserts.assertEquals(loc.node.errors, []);
});

Deno.test("parse error", () => {
  asserts.assertThrows(() => sut.parse("(ns foo"));
});

Deno.test("node", () => {
  const loc = sut.parse("(ns foo)");
  asserts.assertEquals(sut.node(loc), "(ns foo)");

  loc.idx = 1;
  asserts.assertEquals(sut.node(loc), "ns");

  loc.idx = 4;
  asserts.assertEquals(sut.node(loc), "foo");

  loc.idx = 10;
  asserts.assertEquals(sut.node(loc), "");
});

Deno.test("down", () => {
  const code = "(ns foo)";
  const loc = sut.down(sut.parse(code));

  asserts.assertEquals(loc.code, code);
  asserts.assertEquals(loc.idx, 1);
  asserts.assertEquals(loc.node.type, "toplevel");
  asserts.assertEquals(loc.node.errors, []);
  asserts.assertEquals(sut.node(loc), "ns");
});

Deno.test("right", () => {
  const code = "(ns foo (:require []))";
  const root = sut.parse(code);

  asserts.assertEquals(sut.right(root).idx, 22);

  const loc = sut.down(root);
  asserts.assertEquals(sut.right(loc).idx, 3);
  asserts.assertEquals(sut.node(sut.right(loc)), " foo");

  asserts.assertEquals(sut.right(sut.right(loc)).idx, 7);
  asserts.assertEquals(sut.node(sut.right(sut.right(loc))), " (:require [])");

  asserts.assertEquals(sut.right(sut.right(sut.right(loc))).idx, 21);
  asserts.assertEquals(sut.node(sut.right(sut.right(sut.right(loc)))), "");
});

Deno.test("skipMeta", () => {
  const withMeta = sut.right(sut.down(sut.parse("(ns ^{:foo :bar} baz)")));
  asserts.assertEquals(sut.node(withMeta).trim(), "^");
  asserts.assertEquals(sut.node(sut.skipMetas(withMeta)).trim(), "baz");

  const withoutMeta = sut.right(sut.down(sut.parse("(ns baz)")));
  asserts.assertEquals(sut.node(withoutMeta).trim(), "baz");
  asserts.assertEquals(sut.node(sut.skipMetas(withoutMeta)).trim(), "baz");
});
