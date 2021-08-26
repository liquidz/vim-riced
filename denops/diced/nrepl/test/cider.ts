import { nrepl, unknownutil } from "../../deps.ts";
import * as msg from "../../message/core.ts";

type TestSummary = {
  isSuccess: boolean;
  summary: string;
};

type TestError = { [key: string]: nrepl.bencode.Bencode };
type TestPass = { [key: string]: nrepl.bencode.Bencode };

type TestActualValue = {
  actual: string;
  diffs?: string;
};

type TestParsedError = {
  errors: Array<TestError>;
  passes: Array<TestPass>;
  summary: TestSummary;
};

function extractErrorMessage(
  testObj: nrepl.bencode.BencodeObject,
): string {
  const varName = testObj["var"];
  if (!unknownutil.isString(varName)) return "";

  const context = testObj["context"];
  if (unknownutil.isString(context)) {
    return `${varName}: ${context}`;
  }
  const message = testObj["message"];
  if (unknownutil.isString(message)) {
    return `${varName}: ${message}`;
  }
  return varName;
}

function extractActualValues(
  testObj: nrepl.bencode.BencodeObject,
): TestActualValue {
  const diffs = testObj["diffs"];
  //const actual = testObj['actual']
  const actual = unknownutil.isString(testObj["actual"])
    ? testObj["actual"].trim()
    : "";
  if (!unknownutil.isArray(diffs)) return { actual: actual };

  const firstDiff = diffs[0];
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
): Promise<TestSummary> {
  const summary = resp.getFirst("summary");
  if (!nrepl.bencode.isObject(summary)) {
    return {
      isSuccess: true,
      summary: await msg.getMessage("NoTestSummary"),
    };
  }

  if (summary["test"] == null) {
    return {
      isSuccess: true,
      summary: await msg.getMessage("NoTestSummary"),
    };
  }

  const nsName = resp.getFirst("testing-ns") ?? "";
  unknownutil.ensureString(nsName);
  const testCount = summary["test"];
  unknownutil.ensureNumber(testCount);
  const varCount = summary["var"];
  unknownutil.ensureNumber(varCount);
  const failCount = summary["fail"];
  unknownutil.ensureNumber(failCount);
  const errorCount = summary["error"];
  unknownutil.ensureNumber(errorCount);

  return {
    isSuccess: (failCount + errorCount) === 0,
    summary: await msg.getMessage("TestSummary", {
      nsName: nsName,
      testCount: testCount,
      varCount: varCount,
      failCount: failCount,
      errorCount: errorCount,
    }),
  };
}

function getFileNameByTestObj(testObj: nrepl.bencode.BencodeObject): string {
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
  const file = testObj["file"];
  return unknownutil.isString(file) ? file : "";
}

export function collectErrorsAndPasses(
  resp: nrepl.NreplDoneResponse,
): { errors: Array<TestError>; passes: Array<TestPass> } {
  const errors: Array<TestError> = [];
  const passes: Array<TestPass> = [];

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

          for (const testObj of testResults) {
            const testType = testObj["type"] ?? "unkown";
            if (testType !== "fail" && testType !== "error") {
              passes.push({ var: testObj["var"] ?? "" });
              continue;
            }

            const fileName = getFileNameByTestObj(testObj);
            const expected = unknownutil.isString(testObj["expected"])
              ? testObj["expected"]
              : "";

            const error: nrepl.bencode.BencodeObject = {
              filename: fileName,
              text: extractErrorMessage(testObj),
              expected: expected,
              type: "E",
              var: testObj["var"] ?? "",
            };
            const lnum = testObj["line"];
            if (unknownutil.isNumber(lnum)) {
              error["lnum"] = lnum;
            }

            if (testType === "fail") {
              const actual = extractActualValues(testObj);
              error["actual"] = actual.actual;
              if (actual.diffs != null) {
                error["diffs"] = actual.diffs;
              }
            } else {
              error["actual"] = testObj["error"] ?? testObj["actual"] ?? "";
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
): Promise<TestParsedError> {
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
