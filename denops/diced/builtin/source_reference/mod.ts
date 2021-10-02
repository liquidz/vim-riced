import { BasePlugin, Command } from "../../types.ts";
import { dpsFns, unknownutil } from "../../deps.ts";

import * as bufForm from "../../std/buffer/form.ts";
import * as dicedApi from "../../std/diced/api.ts";
import * as msg from "../../std/message/core.ts";
import * as opsCider from "../../std/nrepl/operation/cider.ts";
import * as strParedit from "../../std/string/paredit.ts";
import * as vimPopup from "../../std/vim/popup/mod.ts";

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

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
      // TODO: Make it variable
      100,
      bufNr,
    );

    const winline = await dpsFns.winline(diced.denops);
    const range = strParedit.rangeForDefun(src, idx);
    if (range == null || range === [-1, -1]) {
      await msg.warning(diced, "NotFound");
      return;
    }
    const codes = src.substring(range[0], range[1]).split(/\r?\n/);

    // TODO: Sometimes the value of the winline changes before and after rangeForDefun.
    while (winline !== await dpsFns.winline(diced.denops)) {
      await sleep(10);
    }

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
