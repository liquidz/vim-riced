import { Diced, ParsedTestResult } from "../types.ts";
import { nrepl, unknownutil } from "../deps.ts";

import * as bufForm from "../buffer/form.ts";
import * as msg from "../message/core.ts";
import * as nreplEval from "./eval.ts";
import * as nreplNs from "./namespace.ts";
import * as nreplTestCider from "./test/cider.ts";
import * as opsCider from "./operation/cider.ts";
import * as strCommon from "../string/common.ts";
import * as vimBufInfo from "../vim/buffer/info.ts";

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
  const code = await bufForm.getCurrentTopForm(diced.denops);
  const res = await nreplEval.evalCode(diced, code, {
    context: { verbose: "false" },
  });

  if (res.length < 1) {
    return Promise.reject(new Deno.errors.InvalidData());
  }
  if (res[0] == null) {
    return Promise.reject(new Deno.errors.NotFound());
  }
  const qualifiedVarName = res[0].replace(/^#'/, "");
  const [nsName, varName] = qualifiedVarName.split("/", 2);
  if (nsName == null || varName == null) {
    return Promise.reject(new Deno.errors.NotFound());
  }

  const testVars = await testVarsByNsName(diced, nsName);

  if (testVars.indexOf(varName) !== -1) {
    // Form under the cursor is a test
    await runTestVars(diced, nsName, [qualifiedVarName]);
  } else if (nsName.endsWith("-test")) {
    // Form under the cursor is not a test, and current ns is ns for test
  } else {
    // Form under the cursor is not a test, and current ns is NOT ns for test
  }

  return true;
}

// function! s:__under_cursor(var_info, test_vars) abort
//   let qualified_var = a:var_info['qualified_var']
//   let ns = a:var_info['ns']
//   let var_name = a:var_info['name']
//
//   if index(a:test_vars, var_name) != -1
//     " Form under the cursor is a test
//     return s:__run_test_vars(ns, [qualified_var])
//   elseif s:S.ends_with(ns, '-test')
//     " Form under the cursor is not a test, and current ns is ns for test
//     return iced#message#error('not_found')
//   else
//     " Form under the cursor is not a test, and current ns is NOT ns for test
//     let kondo = iced#system#get('clj_kondo')
//
//     " clj-kondo side
//     if kondo.is_analyzed()
//       let references = kondo.references(ns, var_name)
//       let test_refs = filter(references, {_, v -> match(get(v, 'from-var', ''), '-test$') != -1})
//
//       let promises = []
//       let ns_test_dict = iced#util#group_by(test_refs, {v -> v.from})
//
//       " NOTE If not found, fall back to the nREPL side.
//       if ! empty(ns_test_dict)
//         for test_ns in keys(ns_test_dict)
//           let test_vars = map(get(ns_test_dict, test_ns, []),
//                 \ {_, v -> printf('%s/%s', get(v, 'from'), get(v, 'from-var'))})
//
//           let p = iced#promise#call('iced#nrepl#ns#require', [test_ns])
//                 \.then({_ -> s:__run_test_vars(test_ns, test_vars)})
//           let promises += [p]
//         endfor
//         return iced#promise#all(promises)
//       endif
//     endif
//
//     " nREPL side
//     let ns = iced#nrepl#navigate#cycle_ns(ns)
//     return iced#promise#call('iced#nrepl#ns#require', [ns])
//           \.then({_ -> iced#promise#call('iced#nrepl#test#test_vars_by_ns_name', [ns])})
//           \.then({test_vars -> s:__test_cycled_ns(ns, var_name, test_vars)})
//   endif
// endfunction
//

async function runTestVars(diced: Diced, nsName: string, vars: Array<string>) {
  const query = {
    "ns-query": { "exactly": [nsName] },
    "exactly": vars,
  };
  //await msg.info(diced, 'TestingVar')
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
    if (err.diffs != null) {
      errLines.push(`Expected: ${err.expected}`);
      errLines.push(`  Actual: ${err.actual}`);

      const diffs = strCommon.addIndent(10, `   Diffs: ${err.diffs}`);
      for (const d of diffs.split(/\r?\n/)) {
        errLines.push(d);
      }
    } else {
      errLines.push(`Actual: ${err.expected}`);
    }
  }

  if (errLines.length !== 0) {
    await vimBufInfo.appendLines(diced.denops, errLines);
  }

  if (result.summary.isSuccess) {
    await msg.infoStr(diced, result.summary.summary);
  } else {
    await msg.errorStr(diced, result.summary.summary);
  }
}
