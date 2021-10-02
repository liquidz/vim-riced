import { BasePlugin, Command } from "../../types.ts";
import { dpsFns, unknownutil } from "../../deps.ts";

import * as bufForm from "../../std/buffer/form.ts";
import * as dicedApi from "../../std/diced/api.ts";
import * as msg from "../../std/message/core.ts";
import * as opsCider from "../../std/nrepl/operation/cider.ts";
import * as strParedit from "../../std/string/paredit.ts";
import * as vimPopup from "../../std/vim/popup/mod.ts";

// function! s:__extract_source(resp) abort
//   let path = get(a:resp, 'file', '')
//   if empty(path) | return '' | endif
//
//   let code = ''
//   let reg_save = @@
//   try
//     call iced#buffer#temporary#begin()
//     call iced#system#get('ex_cmd').silent_exe(printf(':read %s', path))
//     call cursor(a:resp['line']+1, get(a:resp, 'column', 0))
//     silent normal! vaby
//     let code = @@
//   finally
//     let @@ = reg_save
//     call iced#buffer#temporary#end()
//   endtry
//
//   return code
// endfunction
//
// function! s:__fetch_source(symbol) abort
//   return iced#promise#call('iced#nrepl#var#get', [a:symbol])
//         \.then({resp -> (empty(get(resp, 'file', '')))
//         \               ? iced#promise#reject(iced#message#get('not_found'))
//         \               : s:__extract_source(resp)})
// endfunction

const ShowSource: Command = {
  name: "ShowSource",
  nargs: "?",
  args: "<q-args>",
  run: async (diced, args) => {
    if (!unknownutil.isArray<string>(args)) return;
    const firstArg = args[0] ?? "";
    const symbol = (firstArg === "") ? await bufForm.cword(diced) : firstArg;
    const res = await opsCider.info(diced, symbol);

    const path = res.getFirst("file");
    const line = res.getFirst("line");
    const column = res.getFirst("column");
    if (!unknownutil.isString(path) || !unknownutil.isNumber(line)) {
      await msg.warning(diced, "NotFound");
      return;
    }

    const bufNr = await dpsFns.bufadd(diced.denops, path);
    await dpsFns.bufload(diced.denops, bufNr);
    const [src, idx] = await bufForm.getAroundSrcAndIdx(
      diced,
      { line: line, column: (unknownutil.isNumber(column) ? column : 1) },
      100,
      bufNr,
    );

    const range = strParedit.rangeForDefun(src, idx);
    if (range == null || range === [-1, -1]) {
      await msg.warning(diced, "NotFound");
      return;
    }
    const codes = src.substring(range[0], range[1]).split(/\r?\n/);

    try {
      vimPopup.open(diced, codes, {
        row: "nearCursor",
        col: "nearCursor",
        moved: "row",
        border: true,
        fileType: "clojure",
      });
    } catch {
      await msg.warning(diced, "Fallback", { name: "InfoBuffer" });
      dicedApi.call(diced, "info_buffer_append_lines", codes);
    }
  },
};

export class Plugin extends BasePlugin {
  readonly commands = [ShowSource];
}
