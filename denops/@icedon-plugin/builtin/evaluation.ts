import * as api from "../api.ts";
import * as apiAlias from "../api/alias.ts";
import { icedon, z } from "../deps.ts";
import { EvalApi, EvalArg } from "./nrepl_op.ts";

type App = icedon.App;

const EvaluateArg = z.object({
  args: z.tuple([z.string()]),
});

const evaluate = {
  name: "icedon_eval",
  run: async (app: App, args: unknown[]) => {
    const parsed = EvaluateArg.parse(icedon.arg.parse(args));
    return await app.requestApi(EvalApi, { code: parsed.args[0] } as EvalArg);
  },
};

const evaluateOuterTopForm = {
  name: "icedon_eval_outer_top_form",
  run: async (app: App, _args: unknown[]) => {
    const ns = await apiAlias.getNsName(app);
    const curpos = await apiAlias.getCursorPosition(app);
    const [code, pos] = await apiAlias.getCurrentTopForm(app);

    return await app.requestApi(EvalApi, {
      code: code,
      line: pos[0],
      column: pos[1],
      cursorLine: curpos[0],
      cursorColumn: curpos[1],
      ns: ns,
    } as EvalArg);
  },
};

const evaluateOuterForm = {
  name: "icedon_eval_outer_form",
  run: async (app: App, _args: unknown[]) => {
    const ns = await apiAlias.getNsName(app);
    const curpos = await apiAlias.getCursorPosition(app);
    const [code, pos] = await apiAlias.getCurrentForm(app);

    return await app.requestApi(EvalApi, {
      code: code,
      line: pos[0],
      column: pos[1],
      cursorLine: curpos[0],
      cursorColumn: curpos[1],
      ns: ns,
    } as EvalArg);
  },
};

const evaluateNsForm = {
  name: "icedon_eval_ns_form",
  run: async (app: App, _args: unknown[]) => {
    const [code, _pos] = await apiAlias.getNsForm(app);
    return await app.requestApi(EvalApi, { code: code } as EvalArg);
  },
};

export class Api extends icedon.ApiPlugin {
  readonly name = "icedon builtin evaluation";
  readonly apis = [
    evaluate,
    evaluateOuterTopForm,
    evaluateOuterForm,
    evaluateNsForm,
  ];

  async onInit(app: App) {
    await api.registerApiCommand(app, evaluate, { nargs: "1" });
    await api.registerApiCommand(app, evaluateOuterTopForm);
    await api.registerApiCommand(app, evaluateOuterForm);
    await api.registerApiCommand(app, evaluateNsForm);
  }
}
