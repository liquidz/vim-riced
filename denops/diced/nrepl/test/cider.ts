import { fs, nrepl, unknownutil } from "../../deps.ts";
import {
  Diced,
  ParsedTestActualValue,
  ParsedTestError,
  ParsedTestPass,
  ParsedTestResult,
  ParsedTestSummary,
} from "../../types.ts";
import * as msg from "../../message/core.ts";
import { isTestResult, isTestSummary, TestResult } from "../../types/cider.ts";
import * as opsCider from "../operation/cider.ts";
import * as nreplDesc from "../describe.ts";
import * as strCommon from "../../string/common.ts";

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
  const actual = testRes.error ?? testRes.actual ?? "";

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
    diffs: strCommon.deleteColorCode(
      `- ${diffBefore.trim()}\n+ ${diffAfter.trim()}`,
    ),
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

async function getFileNameByTestObj(
  diced: Diced,
  nsName: string,
  testRes: TestResult,
): Promise<string> {
  const file = unknownutil.isString(testRes.file) ? testRes.file : "";
  if (
    !await fs.exists(file) && nreplDesc.isSupportedOperation(diced, "ns-path")
  ) {
    const resp = await opsCider.nsPathOp(diced, nsName);
    const path = resp.getFirst("path");
    if (unknownutil.isString(path)) {
      return path;
    }
  }

  return file;
}

async function collectErrorsAndPasses(
  diced: Diced,
  resp: nrepl.NreplDoneResponse,
): Promise<{ errors: Array<ParsedTestError>; passes: Array<ParsedTestPass> }> {
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

            const fileName = await getFileNameByTestObj(diced, nsName, testRes);
            const { actual, diffs } = extractActualValues(testRes);
            errors.push({
              filename: fileName,
              text: extractErrorMessage(testRes),
              expected: strCommon.deleteColorCode(
                (testRes.expected ?? "").trim(),
              ),
              actual: strCommon.deleteColorCode(actual.trim()),
              type: "E",
              var: testRes.var,
              lnum: Array.isArray(testRes.line) ? undefined : testRes.line,
              diffs: diffs,
            });
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
  diced: Diced,
  resp: nrepl.NreplDoneResponse,
): Promise<ParsedTestResult> {
  // if iced#util#has_status(a:resp, 'namespace-not-found')
  //   return iced#message#error('not_found')
  // endif

  const { errors, passes } = await collectErrorsAndPasses(diced, resp);
  return {
    errors: errors,
    passes: passes,
    summary: await extractSummary(resp),
  };
}
