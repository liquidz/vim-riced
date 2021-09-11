import { BasePlugin, Command } from "../../types.ts";
import { unknownutil } from "../../deps.ts";

import * as bufForm from "../../std/buffer/form.ts";
import * as msg from "../../std/message/core.ts";
import * as nreplEval from "../../std/nrepl/eval.ts";

const EvalCode: Command = {
  name: "Eval",
  nargs: "?",
  args: "<q-args>",
  run: async (diced, args) => {
    if (args.length === 0 || !unknownutil.isString(args[0])) return;
    const code = args[0];
    await nreplEval.evalCode(diced, code);
  },
};

const EvalOuterList: Command = {
  name: "EvalOuterList",
  run: async (diced, _) => {
    try {
      const code = await bufForm.getCurrentForm(diced);
      await nreplEval.evalCode(diced, code);
    } catch (_err) {
      await msg.warning(diced, "NotFound");
    }
  },
};

const EvalOuterTopList: Command = {
  name: "EvalOuterTopList",
  run: async (diced, _) => {
    try {
      const code = await bufForm.getCurrentTopForm(diced);
      await nreplEval.evalCode(diced, code);
    } catch (_err) {
      await msg.warning(diced, "NotFound");
    }
  },
};

export class Plugin extends BasePlugin {
  readonly commands = [
    EvalCode,
    EvalOuterList,
    EvalOuterTopList,
  ];
}
