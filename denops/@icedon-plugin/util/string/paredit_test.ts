import { asserts } from "../../test_deps.ts";
import * as sut from "./paredit.ts";

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
