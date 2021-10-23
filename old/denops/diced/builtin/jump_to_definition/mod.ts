import { BasePlugin, Command } from "../../types.ts";
import { dpsHelper, unknownutil } from "../../deps.ts";

import * as bufForm from "../../std/buffer/form.ts";
import * as bufNs from "../../std/buffer/namespace.ts";
import * as opsCider from "../../std/nrepl/operation/cider.ts";
import * as vimTagstack from "../../std/vim/tagstack.ts";
import * as strOpt from "../../std/string/option.ts";

const JumpToDefinition: Command = {
  name: "JumpToDefinition",
  nargs: "*",
  args: "<f-args>",
  run: async (diced, unknownArgs) => {
    if (!unknownutil.isArray<string>(unknownArgs)) return;
    const { args, option } = strOpt.parseOptions(unknownArgs);
    const jumpCmd = option["cmd"] ?? "edit";

    const firstArg = (args[0] ?? "").trim();
    const symbol = (firstArg === "") ? await bufForm.cword(diced) : firstArg;

    if (symbol.startsWith("::")) {
      // keyword
      console.log("FIXME keyword");
    } else {
      const qualifiedSymbol = (symbol.includes("/"))
        ? symbol
        : `${await bufNs.extractName(diced)}/${symbol}`;

      const res = await opsCider.info(diced, qualifiedSymbol);

      const file = res.getFirst("file");
      const line = res.getFirst("line");
      const column = res.getFirst("column");
      if (!unknownutil.isString(file) || !unknownutil.isNumber(line)) {
        // TODO log
        return;
      }

      if (jumpCmd === "edit") {
        // Add to tagstack
        await vimTagstack.addHere(diced, qualifiedSymbol);
      }

      // Jump
      await dpsHelper.execute(
        diced.denops,
        `${jumpCmd} ${file}
         call cursor(${line}, ${column})
         normal! zz
         redraw!`,
      );
    }
  },
};

export class Plugin extends BasePlugin {
  readonly commands = [JumpToDefinition];
}
