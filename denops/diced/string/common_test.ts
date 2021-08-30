import { asserts } from "../test_deps.ts";
import * as sut from "./common.ts";

Deno.test("addIndent", () => {
  asserts.assertEquals(sut.addIndent(0, "foo"), "foo");
  asserts.assertEquals(sut.addIndent(0, "foo\nbar"), "foo\nbar");
  asserts.assertEquals(sut.addIndent(2, "foo\nbar"), "foo\n  bar");
  asserts.assertEquals(sut.addIndent(1, "foo\nbar\nbaz"), "foo\n bar\n baz");
});
