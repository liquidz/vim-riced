import { Command } from "../types.ts";
import { unknownutil } from "../deps.ts";

import * as bufForm from "../buffer/form.ts";
import * as msg from "../message/core.ts";
import * as nreplEval from "../nrepl/eval.ts";

export const EvalCode: Command = {
  name: "Eval",
  nargs: "?",
  args: "<q-args>",
  run: async (diced, args) => {
    if (args.length === 0 || !unknownutil.isString(args[0])) return;
    const code = args[0];
    await nreplEval.evalCode(diced, code);
  },
};

export const EvalOuterList: Command = {
  name: "EvalOuterList",
  run: async (diced, _) => {
    try {
      const code = await bufForm.getCurrentForm(diced.denops);
      await nreplEval.evalCode(diced, code);
    } catch (_err) {
      await msg.warning(diced, "NotFound");
    }
  },
};

export const EvalOuterTopList: Command = {
  name: "EvalOuterTopList",
  run: async (diced, _) => {
    try {
      const code = await bufForm.getCurrentTopForm(diced.denops);
      await nreplEval.evalCode(diced, code);
    } catch (_err) {
      await msg.warning(diced, "NotFound");
    }
  },
};
