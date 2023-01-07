import { asserts } from "../../test_deps.ts";
import * as sut from "./paredit.ts";

Deno.test("positionToIndex", () => {
  asserts.assertEquals(sut.positionToIndex("foo\nbar\nbaz", [0, 0]), 0);
  asserts.assertEquals(sut.positionToIndex("foo\nbar\nbaz", [0, 1]), 1);
  asserts.assertEquals(sut.positionToIndex("foo\nbar\nbaz", [1, 0]), 4);
  asserts.assertEquals(sut.positionToIndex("foo\nbar\nbaz", [1, 1]), 5);
  asserts.assertEquals(sut.positionToIndex("foo\nbar\nbaz", [2, 0]), 8);
  asserts.assertEquals(sut.positionToIndex("foo\nbar\nbaz", [2, 1]), 9);
});

Deno.test("forwardSexp", () => {
  asserts.assertEquals(sut.forwardSexp("foo bar", 0), 4);
  asserts.assertEquals(sut.forwardSexp(sut.parse("foo bar"), 0), 4);
});

Deno.test("backwardSexp", () => {
  asserts.assertEquals(sut.backwardSexp("foo bar baz", 8), 5);
  asserts.assertEquals(sut.backwardSexp(sut.parse("foo bar baz"), 8), 5);
});

Deno.test("sexpRange", () => {
  asserts.assertEquals(sut.sexpRange("foo bar", 1), [0, 3]);
  asserts.assertEquals(sut.sexpRange(sut.parse("foo bar"), 1), [0, 3]);
});

Deno.test("rangeForDefun", () => {
  asserts.assertEquals(sut.rangeForDefun("(foo (bar))", 2), [0, 11]);
  asserts.assertEquals(sut.rangeForDefun("(foo (bar))", 6), [0, 11]);
  asserts.assertEquals(sut.rangeForDefun(sut.parse("(foo (bar))"), 6), [0, 11]);
});

Deno.test("sexpRangeExpansion", () => {
  asserts.assertEquals(sut.sexpRangeExpansion("(foo (bar))", 5, 10), [1, 10]);
  asserts.assertEquals(
    sut.sexpRangeExpansion(sut.parse("(foo (bar))"), 5, 10),
    [1, 10],
  );
});
