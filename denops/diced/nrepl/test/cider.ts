import { Diced } from "../../types.ts";
import { nrepl, unknownutil } from "../../deps.ts";
import * as msg from "../../message/core.ts";

type Summary = {
  isSuccess: boolean;
  summary: string;
};

type ParsedError = {
  errors: any;
  passes: any;
  summary: Summary;
};

export async function extractSummary(
  resp: nrepl.NreplDoneResponse,
): Promise<Summary> {
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

// function! s:summary(resp) abort
//   for resp in iced#util#ensure_array(a:resp)
//     if has_key(resp, 'summary')
//       let summary = resp['summary']
//
//       if summary['test'] == 0
//         return {
//               \ 'summary': iced#message#get('no_test_summary'),
//               \ 'is_success': 1,
//               \ }
//       else
//         return {
//               \ 'summary': iced#message#get('test_summary',
//               \              get(resp, 'testing-ns', ''),
//               \              summary['test'], summary['var'],
//               \              summary['fail'], summary['error']),
//               \ 'is_success': ((summary['fail'] + summary['error']) == 0),
//               \ }
//       endif
//     endif
//   endfor
//
//   return ''
// endfunction

// export function parseResponse(resp: nrepl.NreplDoneResponse): ParsedError {
//   resp.responses;
//
//   //   if iced#util#has_status(a:resp, 'namespace-not-found')
//   //   return iced#message#error('not_found')
//   // endif
//
//   // let [errors, passes] = s:collect_errors_and_passes(a:resp)
//   // return {
//   //       \ 'errors': errors,
//   //       \ 'passes': passes,
//   //       \ 'summary': s:summary(a:resp),
//   //       \ }
// }

// function! s:collect_errors_and_passes(resp) abort
//   let errors  = []
//   let passes = []
//
//   let is_ns_path_op_supported = iced#nrepl#is_supported_op('ns-path')
//
//   for response in iced#util#ensure_array(a:resp)
//     let results = get(response, 'results', {})
//
//     for ns_name in keys(results)
//       let ns_results = results[ns_name]
//
//       for test_name in keys(ns_results)
//         let test_results = ns_results[test_name]
//
//         for test in test_results
//           if test['type'] !=# 'fail' && test['type'] !=# 'error'
//             call add(passes, {'var': get(test, 'var', '')})
//             continue
//           endif
//
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
//
//           let err = {
//                   \ 'filename': filename,
//                   \ 'text': s:error_message(test),
//                   \ 'expected': trim(get(test, 'expected', '')),
//                   \ 'type': 'E',
//                   \ 'var': get(test, 'var', ''),
//                   \ }
//           if has_key(test, 'line') && type(test['line']) == v:t_number
//             let err['lnum'] = test['line']
//           endif
//
//           if test['type'] ==# 'fail'
//             call add(errors, extend(copy(err), s:extract_actual_values(test)))
//           elseif test['type'] ==# 'error'
//             call add(errors, extend(copy(err), {'actual': get(test, 'error', get(test, 'actual', ''))}))
//           endif
//         endfor
//       endfor
//     endfor
//   endfor
//
//   return [errors, passes]
// endfunction

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

// nrepl.NreplDoneResponse
// k

// {
//   "gen-input": [],
//   id: "e06d8fe2-cc0d-4bd6-8e4b-d1c7e4c2a414",
//   results: { "antq.log-test": { "info-test": [ [Object] ] } },
//   session: "037dd4a4-6c42-46be-893a-cad99c475767",
//   summary: { error: 0, fail: 0, ns: 1, pass: 1, test: 1, var: 1 },
//   "testing-ns": "antq.log-test"
// }
// {
//   id: "e06d8fe2-cc0d-4bd6-8e4b-d1c7e4c2a414",
//   session: "037dd4a4-6c42-46be-893a-cad99c475767",
//   status: [ "done" ]
// }
