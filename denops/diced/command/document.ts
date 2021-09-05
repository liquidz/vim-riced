import { Command } from "../types.ts";
import { nrepl, unknownutil } from "../deps.ts";

import * as bufForm from "../buffer/form.ts";
import * as opsCider from "../nrepl/operation/cider.ts";
import * as msg from "../message/core.ts";
import * as vimBufInfo from "../vim/buffer/info.ts";

async function generateClojureDocument(
  resp: nrepl.NreplDoneResponse,
): Promise<Array<string>> {
  const doc: Array<string> = [];
  const name = resp.getFirst("name");
  if (typeof name !== "string") return doc;

  const nsName = resp.getFirst("ns");
  const title = (typeof nsName === "string") ? `${nsName}/${name}` : name;
  doc.push(`;; ${title}`);

  const argsLists = resp.getFirst("arglists-str");
  if (typeof argsLists === "string") {
    argsLists.split(/\r?\n/g).map((s) => `  ${s}`).forEach((s) => {
      doc.push(s);
    });
  }

  const docStr = resp.getFirst("doc");
  const x =
    ((typeof docStr === "string")
      ? docStr
      : await msg.getMessage("NoDocument"));
  const y = x.split(/\r?\n/);

  if (y.length > 0) {
    doc.push(`  ${y[0]}`);
    y.slice(1).forEach((s) => {
      doc.push(s);
    });
  }

  // TODO: spec

  return doc;
}

// function! s:generate_cljdoc(resp) abort " {{{
//   let doc = []
//   if !has_key(a:resp, 'name') | return doc | endif
//
//   let title = (has_key(a:resp, 'ns'))
//         \ ? printf('%s/%s', a:resp['ns'], a:resp['name'])
//         \ : a:resp['name']
//   call add(doc, printf('*%s*', title))
//
//   if has_key(a:resp, 'arglists-str')
//     call add(doc, printf('  %s', join(split(a:resp['arglists-str'], '\r\?\n'), "\n  ")))
//   endif
//   let doc_str = get(a:resp, 'doc', iced#message#get('no_document'))
//   let doc_str = (type(doc_str) == v:t_string) ? doc_str : iced#message#get('no_document')
//   let docs = split(doc_str, '\r\?\n')
//   call add(doc, printf('  %s', docs[0]))
//   for doc_line in docs[1:]
//     call add(doc, doc_line)
//   endfor
//
//   if has_key(a:resp, 'spec')
//     call add(doc, '')
//     call add(doc, g:iced#buffer#document#subsection_sep)
//     call add(doc, printf('*%s*', a:resp['spec'][0]))
//     let specs = s:D.from_list(a:resp['spec'][1:])
//     for k in [':args', ':ret']
//       if !has_key(specs, k) | continue | endif
//
//       let v = specs[k]
//       let formatted = iced#nrepl#spec#format(v)
//       let formatted = iced#util#add_indent(9, formatted)
//       call add(doc, printf('  %-5s  %s', k, formatted))
//     endfor
//   endif
//
//   if has_key(a:resp, 'see-also')
//     call add(doc, '')
//     call add(doc, g:iced#buffer#document#subsection_sep)
//     call add(doc, '*see-also*')
//     for name in a:resp['see-also']
//       call add(doc, printf(' - %s', name))
//     endfor
//   endif
//
//   return doc
// endfunction " }}}

export const ShowDocument: Command = {
  name: "ShowDocument",
  nargs: "?",
  args: "<q-args>",
  run: async (diced, args) => {
    const symbol = (args.length === 0 || !unknownutil.isString(args[0]) ||
        args[0].trim() === "")
      ? await bufForm.cword(diced.denops)
      : args[0];

    const res = await opsCider.info(diced, symbol);
    const doc = await generateClojureDocument(res);
    vimBufInfo.appendLines(diced.denops, doc);
  },
};
