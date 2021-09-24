import { BasePlugin, Command, Diced } from "../../types.ts";
import { unknownutil } from "../../deps.ts";

import * as bufForm from "../../std/buffer/form.ts";
import * as msg from "../../std/message/core.ts";
import * as nreplEval from "../../std/nrepl/eval.ts";

async function handleError(diced: Diced, err: unknown): Promise<void> {
  if (err instanceof Deno.errors.NotFound) {
    await msg.warning(diced, "NotFound");
  } else if (err instanceof Error) {
    await msg.errorStr(diced, err.message);
  }
}

const EvalCode: Command = {
  name: "Eval",
  nargs: "?",
  args: "<q-args>",
  run: async (diced, args) => {
    if (args.length === 0 || !unknownutil.isString(args[0])) return;
    const code = args[0];
    try {
      await nreplEval.evalCode(diced, code);
    } catch (err) {
      await handleError(diced, err);
    }
  },
};

const EvalOuterList: Command = {
  name: "EvalOuterList",
  run: async (diced, _) => {
    try {
      const code = await bufForm.getCurrentForm(diced);
      await nreplEval.evalCode(diced, code);
    } catch (err) {
      await handleError(diced, err);
    }
  },
};

const EvalOuterTopList: Command = {
  name: "EvalOuterTopList",
  run: async (diced, _) => {
    try {
      const code = await bufForm.getCurrentTopForm(diced);
      await nreplEval.evalCode(diced, code);
    } catch (err) {
      await handleError(diced, err);
    }
  },
};

const EvalBuffer: Command = {
  name: "EvalBuffer",
  run: async (diced, _) => {
    if (await nreplEval.loadCurrentFile(diced)) {
      await msg.info(diced, "Required");
    }
  },
};

export class Plugin extends BasePlugin {
  readonly commands = [
    EvalCode,
    EvalOuterList,
    EvalOuterTopList,
    EvalBuffer,
  ];
}
