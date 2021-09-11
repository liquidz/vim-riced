import { asserts } from "../../test_deps.ts";
import * as sut from "./common.ts";

Deno.test("addIndent", () => {
  asserts.assertEquals(sut.addIndent(0, "foo"), "foo");
  asserts.assertEquals(sut.addIndent(0, "foo\nbar"), "foo\nbar");
  asserts.assertEquals(sut.addIndent(2, "foo\nbar"), "foo\n  bar");
  asserts.assertEquals(sut.addIndent(1, "foo\nbar\nbaz"), "foo\n bar\n baz");
});

Deno.test("deleteColorCode", () => {
  asserts.assertEquals(sut.deleteColorCode("foo"), "foo");
  asserts.assertEquals(sut.deleteColorCode(""), "");
  asserts.assertEquals(sut.deleteColorCode("[31mfoo[m"), "foo");
});
