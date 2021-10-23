import { asserts } from "../../../test_deps.ts";
import { nrepl } from "../../../deps.ts";
import * as sut from "./cider.ts";
import * as helper from "../../../test_helper.ts";

const dummyDiced = helper.dummyDiced((msg, ctx) => {
  if (msg["op"] === "ns-path") {
    return nrepl.util.doneResponse([{
      "path": "/path/to/file.clj",
      "status": ["done"],
    }], ctx);
  }
  return helper.doneResponse(ctx);
});

Deno.test("parseResponse summary", async () => {
  const result = await sut.parseResponse(
    dummyDiced,
    nrepl.util.doneResponse([{
      "summary": {
        "test": 1,
        "var": 2,
        "fail": 0,
        "error": 0,
        "ns": 0,
        "pass": 1,
      },
      "testing-ns": "foo.success",
      "results": {},
    }]),
  );
  asserts.assertEquals(result.summary, {
    isSuccess: true,
    summary:
      "foo.success: Ran 1 assertions, in 2 test functions. 0 failures, 0 errors.",
  });

  // summary 内に test がない場合
  // error, fail がある場合
});

Deno.test("parseResponse success", async () => {
  const result = await sut.parseResponse(
    dummyDiced,
    nrepl.util.doneResponse([
      {
        "summary": {},
        "testing-ns": "foo.core-test",
        "results": {
          "foo.core-test": {
            "err-test": [{
              "context": [],
              "index": 0,
              "message": "",
              "ns": "foo.core-test",
              "type": "pass",
              "var": "err-test-var",
            }],
          },
        },
      },
    ]),
  );
  asserts.assertEquals(result.errors, []);
  asserts.assertEquals(result.passes, [{ "var": "err-test-var" }]);
});

Deno.test("parseResponse failed without diffs", async () => {
  const result = await sut.parseResponse(
    dummyDiced,
    nrepl.util.doneResponse([
      {
        "summary": {},
        "testing-ns": "foo.core-test",
        "results": {
          "foo.core-test": {
            "err-test": [{
              "context": "dummy-context",
              "index": 0,
              "ns": "foo.core-test",
              "message": "",
              "type": "fail",
              "var": "err-test-var",
              "file": "",
              "line": 123,
              "expected": "expected-result",
              "actual": "actual-result",
            }],
          },
        },
      },
    ]),
  );

  asserts.assertEquals(result.errors, [{
    "type": "E",
    "lnum": 123,
    "filename": "/path/to/file.clj",
    "expected": "expected-result",
    "actual": "actual-result",
    "text": "err-test-var: dummy-context",
    "var": "err-test-var",
    "diffs": undefined,
  }]);
  asserts.assertEquals(result.passes, []);
});

Deno.test("parseResponse failed with diff", async () => {
  const result = await sut.parseResponse(
    dummyDiced,
    nrepl.util.doneResponse([
      {
        "summary": {},
        "testing-ns": "foo.core-test",
        "results": {
          "foo.core-test": {
            "err-test": [{
              "context": [],
              "index": 0,
              "ns": "foo.core-test",
              "message": "dummy-message",
              "type": "fail",
              "var": "err-test-var",
              "file": "",
              "line": 123,
              "expected": "expected-result",
              "diffs": [["actual-result", ["foo", "bar"]]],
            }],
          },
        },
      },
    ]),
  );

  asserts.assertEquals(result.errors, [{
    "type": "E",
    "lnum": 123,
    "filename": "/path/to/file.clj",
    "expected": "expected-result",
    "actual": "actual-result",
    "diffs": "- foo\n+ bar",
    "text": "err-test-var: dummy-message",
    "var": "err-test-var",
  }]);
  asserts.assertEquals(result.passes, []);
});

Deno.test("parseResponse error", async () => {
  const result = await sut.parseResponse(
    dummyDiced,
    nrepl.util.doneResponse([
      {
        "summary": {},
        "testing-ns": "foo.core-test",
        "results": {
          "foo.core-test": {
            "err-test": [{
              "context": [],
              "index": 0,
              "ns": "foo.core-test",
              "message": "",
              "type": "error",
              "var": "err-test-var",
              "file": "/path/to/file.clj",
              "line": 123,
              "expected": "expected-result",
              "error": "error-message",
            }],
          },
        },
      },
    ]),
  );

  asserts.assertEquals(result.errors, [{
    "type": "E",
    "lnum": 123,
    "filename": "/path/to/file.clj",
    "expected": "expected-result",
    "actual": "error-message",
    "text": "err-test-var",
    "var": "err-test-var",
    "diffs": undefined,
  }]);
  asserts.assertEquals(result.passes, []);
});
