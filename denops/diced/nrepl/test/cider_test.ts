import { asserts } from "../../test_deps.ts";
import { nrepl } from "../../deps.ts";
import * as sut from "./cider.ts";

Deno.test("parseResponse summary", async () => {
  const result = await sut.parseResponse(
    nrepl.util.doneResponse([{
      "summary": { "test": 1, "var": 2, "fail": 0, "error": 0 },
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
  const result = await sut.parseResponse(nrepl.util.doneResponse([
    {
      "summary": { "test": 0, "var": 0, "fail": 0, "error": 0 },
      "testing-ns": "foo.core-test",
      "results": {
        "foo.core-test": {
          "err-test": [{
            "context": [],
            "ns": "foo.core-test",
            "message": [],
            "type": "pass",
            "var": "err-test-var",
          }],
        },
      },
    },
  ]));
  asserts.assertEquals(result.errors, []);
  asserts.assertEquals(result.passes, [{ "var": "err-test-var" }]);
});

Deno.test("parseResponse failed without diffs", async () => {
  const result = await sut.parseResponse(nrepl.util.doneResponse([
    {
      "summary": { "test": 0, "var": 0, "fail": 0, "error": 0 },
      "testing-ns": "foo.core-test",
      "results": {
        "foo.core-test": {
          "err-test": [{
            "context": "dummy-context",
            "ns": "foo.core-test",
            "message": [],
            "type": "fail",
            "var": "err-test-var",
            "file": "/path/to/file.clj",
            "line": 123,
            "expected": "expected-result",
            "actual": "actual-result",
          }],
        },
      },
    },
  ]));

  asserts.assertEquals(result.errors, [{
    "type": "E",
    "lnum": 123,
    "filename": "/path/to/file.clj",
    "expected": "expected-result",
    "actual": "actual-result",
    "text": "err-test-var: dummy-context",
    "var": "err-test-var",
  }]);
  asserts.assertEquals(result.passes, []);
});

Deno.test("parseResponse failed with diff", async () => {
  const result = await sut.parseResponse(nrepl.util.doneResponse([
    {
      "summary": { "test": 0, "var": 0, "fail": 0, "error": 0 },
      "testing-ns": "foo.core-test",
      "results": {
        "foo.core-test": {
          "err-test": [{
            "context": [],
            "ns": "foo.core-test",
            "message": "dummy-message",
            "type": "fail",
            "var": "err-test-var",
            "file": "/path/to/file.clj",
            "line": 123,
            "expected": "expected-result",
            "diffs": [["actual-result", ["foo", "bar"]]],
          }],
        },
      },
    },
  ]));

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
  const result = await sut.parseResponse(nrepl.util.doneResponse([
    {
      "summary": { "test": 0, "var": 0, "fail": 0, "error": 0 },
      "testing-ns": "foo.core-test",
      "results": {
        "foo.core-test": {
          "err-test": [{
            "context": [],
            "ns": "foo.core-test",
            "message": [],
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
  ]));

  asserts.assertEquals(result.errors, [{
    "type": "E",
    "lnum": 123,
    "filename": "/path/to/file.clj",
    "expected": "expected-result",
    "actual": "error-message",
    "text": "err-test-var",
    "var": "err-test-var",
  }]);
  asserts.assertEquals(result.passes, []);
});

//
// function! s:suite.collect_errors_and_passes_could_not_find_ns_path_test() abort
//   let dummy_resp = [{
//         \ 'results': {
//         \   'foo.core-test': {
//         \     'err-test': [
//         \       {'context': [], 'ns': 'foo.core-test', 'message': [], 'type': 'fail', 'var': 'err-test-var',
//         \        'file': 'test/foo/core_test.clj', 'line': 123, 'expected': 'expected-result', 'actual': 'actual-result'}]}}}]
//   call s:ch.mock({'status_value': 'open', 'relay': {msg ->
//         \ (msg['op'] ==# 'ns-path') ? {'status': ['done'], 'path': []}
//         \                           : {'status': ['done']}}})
//   call iced#cache#set('user-dir', '/user/dir')
//   call iced#cache#set('file-separator', '/')
//
//   call s:assert.equals(s:funcs.collect_errors_and_passes(dummy_resp), [
//         \ [{'type': 'E',
//         \   'lnum': 123,
//         \   'filename': '/user/dir/test/foo/core_test.clj',
//         \   'expected': 'expected-result',
//         \   'actual': 'actual-result',
//         \   'text': 'err-test-var',
//         \   'var': 'err-test-var'}],
//         \ [],
//         \ ])
// endfunction
//
// function! s:suite.collect_errors_and_passes_without_ns_path_op() abort
//   let dummy_resp = [{
//         \ 'results': {
//         \   'foo.core-test': {
//         \     'err-test': [
//         \       {'context': [], 'ns': 'foo.core-test', 'message': [], 'type': 'fail', 'var': 'err-test-var',
//         \        'file': 'dummy-file', 'line': 234, 'expected': 'expected-result', 'actual': 'actual-result'}]}}}]
//
//   call iced#nrepl#reset()
//   call s:ch.mock({'status_value': 'open', 'relay': {msg ->
//         \ (msg['op'] ==# 'describe') ? {'status': ['done'], 'ops': {}} : {}}})
//
//   call s:assert.equals(s:funcs.collect_errors_and_passes(dummy_resp),
//         \ [[{'lnum': 234, 'actual': 'actual-result', 'expected': 'expected-result',
//         \    'type': 'E', 'text': 'err-test-var', 'var': 'err-test-var', 'filename': 'dummy-file'}],
//         \ []])
// endfunction
//
