import { AppMock, asserts, withDenops } from "../test_deps.ts";
import * as sut from "./code_in_comment.ts";
import { buildInterceptorTester } from "../test/helper/interceptor.ts";

const thisPlugin = new sut.Interceptor("test");
const tester = buildInterceptorTester([thisPlugin]);

Deno.test("code in comment", async () => {
  await withDenops("vim", async (denops) => {
    const app = await AppMock.build({ denops: denops });

    // non comment form
    asserts.assertEquals(
      (await tester(app, { code: "(comment-foo)" }))["code"],
      "(comment-foo)",
    );

    // comment + space
    asserts.assertEquals(
      (await tester(app, { code: "(comment foo)" }))["code"],
      "(do foo)",
    );

    // comment + newline
    asserts.assertEquals(
      (await tester(app, { code: "(comment\nfoo)" }))["code"],
      "(do\nfoo)",
    );

    // before (foo)
    asserts.assertEquals(
      (await tester(app, {
        code: "(comment\n (foo)\n (bar))",
        line: 1,
        cursorLine: 1,
        cursorColumn: 8,
      }))["code"],
      "(do\n (foo)\n (bar))",
    );
    asserts.assertEquals(
      (await tester(app, {
        code: "(comment\n (foo)\n (bar))",
        line: 1,
        cursorLine: 2,
        cursorColumn: 1,
      }))["code"],
      "(do\n (foo)\n (bar))",
    );

    // start of (foo)
    asserts.assertEquals(
      (await tester(app, {
        code: "(comment\n (foo)\n (bar))",
        line: 1,
        cursorLine: 2,
        cursorColumn: 2,
      }))["code"],
      "(foo)",
    );

    // inside (foo)
    asserts.assertEquals(
      (await tester(app, {
        code: "(comment\n (foo)\n (bar))",
        line: 1,
        cursorLine: 2,
        cursorColumn: 4,
      }))["code"],
      "(foo)",
    );

    // between (foo) and (bar), before (bar)
    asserts.assertEquals(
      (await tester(app, {
        code: "(comment\n (foo)\n (bar))",
        line: 1,
        cursorLine: 3,
        cursorColumn: 1,
      }))["code"],
      "(do\n (foo)\n (bar))",
    );

    // start of (bar)
    asserts.assertEquals(
      (await tester(app, {
        code: "(comment\n (foo)\n (bar))",
        line: 1,
        cursorLine: 3,
        cursorColumn: 2,
      }))["code"],
      "(bar)",
    );

    // inside (bar)
    asserts.assertEquals(
      (await tester(app, {
        code: "(comment\n (foo)\n (bar))",
        line: 1,
        cursorLine: 3,
        cursorColumn: 4,
      }))["code"],
      "(bar)",
    );
  });
});
