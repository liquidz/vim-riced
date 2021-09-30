import { BasePlugin, Command, Diced } from "../../types.ts";
import { dpsFns, unknownutil } from "../../deps.ts";

import * as bufForm from "../../std/buffer/form.ts";
import * as msg from "../../std/message/core.ts";
import * as nreplEval from "../../std/nrepl/eval.ts";
import * as nreplNs from "../../std/nrepl/namespace.ts";
import * as strParedit from "../../std/string/paredit.ts";
import * as strNs from "../../std/string/namespace.ts";

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

const EvalAtMark: Command = {
  name: "EvalAtMark",
  args: "nr2char(getchar())",
  run: async (diced, args) => {
    const denops = diced.denops;

    if (args.length !== 1) return;
    const mark = args[0];
    if (!unknownutil.isString(mark)) return;

    const pos = await dpsFns.getpos(denops, `'${mark}`);
    if (pos == [0, 0, 0, 0]) return;

    await dpsFns.bufload(denops, pos[0]);
    const [src, idx] = await bufForm.getAroundSrcAndIdx(
      diced,
      { line: pos[1], column: pos[2] },
      1,
      pos[0],
    );

    const range = strParedit.parentFormRange(src, idx);
    if (range == null || range === [-1, -1]) {
      await msg.warning(diced, "NotFound");
      return;
    }
    const code = src.substring(range[0], range[1]);

    const [srcHead] = await bufForm.getAroundSrcAndIdx(
      diced,
      { line: 1, column: 1 },
      50,
      pos[0],
    );

    const nsIdx = srcHead.search(/\((ns|in-ns)[ \r\n]/);
    const nsRange = strParedit.rangeForDefun(srcHead, nsIdx);
    const nsForm = srcHead.substring(nsRange[0], nsRange[1]);
    const nsName = strNs.extractName(nsForm);

    try {
      await nreplNs.require(diced, nsName);
      await nreplEval.evalCode(diced, code, { namespace: nsName });
    } catch (err) {
      await handleError(diced, err);
    }
    return;
  },
};

export class Plugin extends BasePlugin {
  readonly commands = [
    EvalCode,
    EvalOuterList,
    EvalOuterTopList,
    EvalBuffer,
    EvalAtMark,
  ];
}
