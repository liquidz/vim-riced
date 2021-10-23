import { asserts } from "../../test_deps.ts";
import * as sut from "./form.ts";

Deno.test("paredit.core.cursorToIndex", () => {
  const lines = ["aa", "bbb", "cccc"];

  asserts.assertEquals(sut.cursorToIndex(lines, 0, { line: 0, column: 0 }), 0);
  asserts.assertEquals(sut.cursorToIndex(lines, 0, { line: 0, column: 1 }), 1);
  asserts.assertEquals(sut.cursorToIndex(lines, 0, { line: 1, column: 0 }), 3);
  asserts.assertEquals(sut.cursorToIndex(lines, 0, { line: 1, column: 1 }), 4);
  asserts.assertEquals(sut.cursorToIndex(lines, 0, { line: 2, column: 0 }), 7);
  asserts.assertEquals(sut.cursorToIndex(lines, 0, { line: 2, column: 1 }), 8);

  // Another baseLineNumber
  asserts.assertEquals(sut.cursorToIndex(lines, 1, { line: 1, column: 0 }), 0);
  asserts.assertEquals(sut.cursorToIndex(lines, 1, { line: 2, column: 0 }), 3);
  asserts.assertEquals(sut.cursorToIndex(lines, 1, { line: 3, column: 0 }), 7);
});
