import { BasePlugin, Command } from "../../types.ts";
import { unknownutil } from "../../deps.ts";

import * as bufForm from "../../std/buffer/form.ts";
import * as opsCider from "../../std/nrepl/operation/cider.ts";

import * as cider from "./cider.ts";

const ShowDocument: Command = {
  name: "ShowDocument",
  nargs: "?",
  args: "<q-args>",
  run: async (diced, args) => {
    const symbol = (args.length === 0 || !unknownutil.isString(args[0]) ||
        args[0].trim() === "")
      ? await bufForm.cword(diced)
      : args[0];

    const res = await opsCider.info(diced, symbol);
    const doc = await cider.generateClojureDocument(res);
    // FIXME
    //vimBufInfo.appendLines(diced.denops, doc);
    console.log(doc);
  },
};

export class Plugin extends BasePlugin {
  readonly commands = [ShowDocument];
}
