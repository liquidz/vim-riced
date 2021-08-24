import { Diced } from "../types.ts";
import { nrepl, unknownutil } from "../deps.ts";
import * as paredit from "../paredit/core.ts";
import * as nreplEval from "./eval.ts";
import * as nreplNs from "./namespace.ts";
import * as opsCider from "./operation/cider.ts";
import * as msg from "../message/core.ts";

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
  console.log(nsVarMap);

  return Object.keys(nsVarMap).reduce((accm, k) => {
    const v = nsVarMap[k];
    if (!nrepl.bencode.isObject(v)) return accm;
    if (v != null && v["test"] != null) {
      accm.push(k);
    }
    return accm;
  }, [] as Array<string>);
}

export async function runTestUnderCursor(diced: Diced): Promise<boolean> {
  const code = await paredit.getCurrentTopForm(diced.denops);
  const res = await nreplEval.evalCode(diced, code, {
    context: { verbose: "false" },
  });

  if (res.length < 1) {
    console.log("kotti?");
    return Promise.reject(new Deno.errors.InvalidData());
  }
  if (res[0] == null) {
    return Promise.reject(new Deno.errors.NotFound());
  }
  const qualifiedVarName = res[0].replace(/^#'/, "");
  console.log(`qualifiedVarName = [${qualifiedVarName}]`);
  const [nsName, varName] = qualifiedVarName.split("/", 2);
  if (nsName == null || varName == null) {
    return Promise.reject(new Deno.errors.NotFound());
  }

  const testVars = await testVarsByNsName(diced, nsName);
  console.log("test vars>>>>");
  console.log(testVars);
  console.log(`varName = [${varName}]`);

  if (testVars.indexOf(varName) !== -1) {
    console.log("kiteru?");
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
  for (const r of resp.responses) {
    console.log(r.response);
  }
}

// function! s:__run_test_vars(ns_name, vars) abort
//   let query = {
//         \ 'ns-query': {'exactly': [a:ns_name]},
//         \ 'exactly': a:vars}
//   let s:last_test = {'type': 'test-var', 'query': query}
//   call s:__echo_testing_message(query)
//   return iced#promise#call('iced#nrepl#op#cider#test_var_query', [query])
//         \.then(funcref('s:__clojure_test_out'))
// endfunction
