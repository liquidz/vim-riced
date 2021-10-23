import { Diced } from "../../types.ts";
import { nrepl, unknownutil } from "../../deps.ts";

// std
import * as bufForm from "../../std/buffer/form.ts";
import * as msg from "../../std/message/core.ts";
import * as nreplEval from "../../std/nrepl/eval.ts";
import * as nreplNs from "../../std/nrepl/namespace.ts";
import * as nreplDesc from "../../std/nrepl/describe.ts";
import * as opsCider from "../../std/nrepl/operation/cider.ts";
import * as strCommon from "../../std/string/common.ts";
import * as strNs from "../../std/string/namespace.ts";
import * as dicedApi from "../../std/diced/api.ts";

import { ParsedTestResult } from "./types.ts";
import * as nreplTestCider from "./nrepl/cider.ts";

async function echoTestingMessage(
  diced: Diced,
  query: nrepl.bencode.BencodeObject,
): Promise<void> {
  if (unknownutil.isArray<string>(query["exactly"])) {
    await msg.echo(diced, "TestingVar", {
      varName: query["exactly"].join(", "),
    });
  } else if (
    unknownutil.isObject(query["ns-query"]) &&
    unknownutil.isArray<string>(query["ns-query"]["exactly"])
  ) {
    await msg.echo(diced, "TestingVar", {
      varName: query["ns-query"]["exactly"].join(", "),
    });
  } else {
    await msg.echo(diced, "Testing");
  }
}

/**
 * Fetch test vars by namespace name
 */
async function testVarsByNsName(
  diced: Diced,
  nsName: string,
): Promise<Array<string>> {
  await nreplNs.require(diced, nsName);
  const resp = await opsCider.nsVarsWithMetaOp(diced, nsName);
  const nsVars = resp.getAll("ns-vars-with-meta");
  unknownutil.ensureArray<nrepl.bencode.BencodeObject>(nsVars);

  const nsVarMap = nsVars.reduce((accm, varMap) => {
    return { ...accm, ...varMap };
  }, {});

  return Object.keys(nsVarMap).reduce((accm, k) => {
    const v = nsVarMap[k];
    if (!nrepl.bencode.isObject(v)) return accm;
    if (v != null && v["test"] != null) {
      accm.push(k);
    }
    return accm;
  }, [] as Array<string>);
}

/**
 * FIXME
 */
export async function runTestUnderCursor(diced: Diced): Promise<boolean> {
  const code = await bufForm.getCurrentTopForm(diced);
  const res = await nreplEval.evalCode(diced, code, {
    context: { verbose: "false" },
  });

  if (res.length < 1) {
    throw new Deno.errors.InvalidData();
  }
  if (res[0] == null) {
    throw new Deno.errors.NotFound();
  }
  const qualifiedVarName = res[0].replace(/^#'/, "");
  const [nsName, varName] = qualifiedVarName.split("/", 2);
  if (nsName == null || varName == null) {
    throw new Deno.errors.NotFound();
  }

  const testVars = await testVarsByNsName(diced, nsName);
  if (testVars.indexOf(varName) !== -1) {
    // Form under the cursor is a test
    await runTestVars(diced, nsName, [qualifiedVarName]);
  } else if (nsName.endsWith("-test")) {
    // Form under the cursor is not a test, and current ns is ns for test
    await msg.error(diced, "NotFound");
  } else {
    // Form under the cursor is not a test, and current ns is NOT ns for test
    // TODO
  }

  return true;
}

export async function runTestNs(diced: Diced): Promise<boolean> {
  const nsName = await nreplNs.name(diced);
  // NOTE: Reload ns to match iced#nrepl#test#under_cursor's behavior
  await nreplEval.loadCurrentFile(diced);

  // FIXME
  // Use simple test integration when there is no `test-var-query` op.
  //     return iced#nrepl#test#plain#ns(ns)
  //           \.catch({msg -> iced#message#error_str(msg)})
  if (!await nreplDesc.isSupportedOperation(diced, "test-var-query")) {
    return false;
  }

  const testVars = await testVarsByNsName(diced, nsName);
  const query = {
    "ns-query": {
      "exactly": [
        (testVars.length === 0 && !nsName.endsWith("-test"))
          ? strNs.cycleName(nsName)
          : nsName,
      ],
    },
  };
  echoTestingMessage(diced, query);

  // TODO sign

  const resp = await opsCider.testVarQueryOp(diced, query);
  const parsed = await nreplTestCider.parseResponse(diced, resp);
  await doneTest(diced, parsed);

  return true;
}

async function runTestVars(diced: Diced, nsName: string, vars: Array<string>) {
  const query = {
    "ns-query": { "exactly": [nsName] },
    "exactly": vars,
  };
  echoTestingMessage(diced, query);

  const resp = await opsCider.testVarQueryOp(diced, query);
  const parsed = await nreplTestCider.parseResponse(diced, resp);
  await doneTest(diced, parsed);
}

async function doneTest(diced: Diced, result: ParsedTestResult): Promise<void> {
  // TODO sign

  const errLines: Array<string> = [];
  for (const err of result.errors) {
    const lnum = err.lnum == null ? "" : ` (Line: ${err.lnum})`;

    errLines.push(`;; ${err.text}${lnum}`);
    errLines.push(`Expected: ${err.expected}`);
    errLines.push(`  Actual: ${err.actual}`);
    if (err.diffs != null) {
      const diffs = strCommon.addIndent(10, `   Diffs: ${err.diffs}`);
      for (const d of diffs.split(/\r?\n/)) {
        errLines.push(d);
      }
    }
  }

  if (errLines.length !== 0) {
    await dicedApi.call(diced, "info_buffer_append_lines", errLines);
  }

  if (result.summary.isSuccess) {
    await msg.infoStr(diced, result.summary.summary);
  } else {
    await msg.errorStr(diced, result.summary.summary);
  }
}
