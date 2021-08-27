import { nrepl, unknownutil } from "../../deps.ts";
import {
  ParsedTestActualValue,
  ParsedTestError,
  ParsedTestPass,
  ParsedTestResult,
  ParsedTestSummary,
} from "../../types.ts";
import * as msg from "../../message/core.ts";
import { isTestResult, isTestSummary, TestResult } from "../../types/cider.ts";

// type ParsedTestSummary = {
//   isSuccess: boolean;
//   summary: string;
// };
//
// type ParsedTestError = { [key: string]: nrepl.bencode.Bencode };
// type ParsedTestPass = { [key: string]: nrepl.bencode.Bencode };
//
// type ParsedTestActualValue = {
//   actual: string;
//   diffs?: string;
// };
//
// type ParsedTestResult = {
//   errors: Array<ParsedTestError>;
//   passes: Array<ParsedTestPass>;
//   summary: ParsedTestSummary;
// };

function extractErrorMessage(testRes: TestResult): string {
  if (typeof testRes.context === "string") {
    return `${testRes.var}: ${testRes.context}`;
  }
  if (testRes.message !== "") {
    return `${testRes.var}: ${testRes.message}`;
  }
  return testRes.var;
}

function extractActualValues(testRes: TestResult): ParsedTestActualValue {
  const actual = testRes.actual ?? "";

  if (testRes.diffs == null) return { actual: actual };
  const firstDiff = testRes.diffs[0];
  if (!unknownutil.isArray(firstDiff)) return { actual: actual };

  const diffActual = firstDiff[0];
  if (!unknownutil.isString(diffActual)) return { actual: actual };

  const diffContent = firstDiff[1];
  if (!unknownutil.isArray<string>(diffContent)) return { actual: actual };

  const diffBefore = diffContent[0];
  const diffAfter = diffContent[1];
  if (diffBefore == null || diffAfter == null) return { actual: actual };

  return {
    actual: diffActual,
    diffs: `- ${diffBefore.trim()}\n+ ${diffAfter.trim()}`,
  };
}

async function extractSummary(
  resp: nrepl.NreplDoneResponse,
): Promise<ParsedTestSummary> {
  const summary = resp.getFirst("summary");
  const nsName = resp.getFirst("testing-ns") ?? "";
  if (
    !isTestSummary(summary) ||
    !unknownutil.isString(nsName)
  ) {
    return {
      isSuccess: true,
      summary: await msg.getMessage("NoTestSummary"),
    };
  }

  return {
    isSuccess: (summary.fail + summary.error) === 0,
    summary: await msg.getMessage("TestSummary", {
      nsName: nsName,
      testCount: summary.test,
      varCount: summary.var,
      failCount: summary.fail,
      errorCount: summary.error,
    }),
  };
}

function getFileNameByTestObj(testRes: TestResult): string {
  //           if is_ns_path_op_supported
  //             let ns_path_resp = iced#nrepl#op#cider#sync#ns_path(ns_name)
  //
  //             if type(ns_path_resp) != v:t_dict || !has_key(ns_path_resp, 'path')
  //               continue
  //             endif
  //
  //             if empty(ns_path_resp['path'])
  //               if !has_key(test, 'file') || type(test['file']) != v:t_string
  //                 continue
  //               endif
  //               let filename = printf('%s%s%s',
  //                     \ iced#nrepl#system#user_dir(),
  //                     \ iced#nrepl#system#separator(),
  //                     \ test['file'])
  //             else
  //               let filename = ns_path_resp['path']
  //             endif
  //           else
  //             let filename = get(test, 'file')
  //           endif
  return testRes.file ?? "";
}

export function collectErrorsAndPasses(
  resp: nrepl.NreplDoneResponse,
): { errors: Array<ParsedTestError>; passes: Array<ParsedTestPass> } {
  const errors: Array<ParsedTestError> = [];
  const passes: Array<ParsedTestPass> = [];

  for (const response of resp.responses) {
    for (const result of response.getAll("results")) {
      if (!nrepl.bencode.isObject(result)) continue;

      for (const nsName of Object.keys(result)) {
        const nsResults = result[nsName];
        if (!nrepl.bencode.isObject(nsResults)) continue;

        for (const testName of Object.keys(nsResults)) {
          const testResults = nsResults[testName];
          if (!unknownutil.isArray<nrepl.bencode.BencodeObject>(testResults)) {
            continue;
          }

          for (const testRes of testResults) {
            if (!isTestResult(testRes)) continue;

            if (testRes.type !== "fail" && testRes.type !== "error") {
              passes.push({ var: testRes.var });
              continue;
            }

            const fileName = getFileNameByTestObj(testRes);
            const error: nrepl.bencode.BencodeObject = {
              filename: fileName,
              text: extractErrorMessage(testRes),
              expected: testRes.expected ?? "",
              type: "E",
              var: testRes.var,
            };
            if (testRes.line != null) {
              error["lnum"] = testRes.line;
            }

            if (testRes.type === "fail") {
              const actual = extractActualValues(testRes);
              error["actual"] = actual.actual;
              if (actual.diffs != null) {
                error["diffs"] = actual.diffs;
              }
            } else {
              error["actual"] = testRes.error ?? testRes.actual ?? "";
            }
            errors.push(error);
          }
        }
      }
    }
  }

  return {
    errors: errors,
    passes: passes,
  };
}

// ::errors [::error]
//
// ::error
// - req
//   :text
//   :type (E)
// - opt
//   :lnum
//   :filename
//   :expected
//   :actual
//   :diffs
//
// :: summary
// - req
//   :summary String
//   :is_success Bool
export async function parseResponse(
  resp: nrepl.NreplDoneResponse,
): Promise<ParsedTestResult> {
  // if iced#util#has_status(a:resp, 'namespace-not-found')
  //   return iced#message#error('not_found')
  // endif

  const { errors, passes } = collectErrorsAndPasses(resp);
  return {
    errors: errors,
    passes: passes,
    summary: await extractSummary(resp),
  };
}
