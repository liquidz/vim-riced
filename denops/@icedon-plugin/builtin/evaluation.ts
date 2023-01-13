import * as api from "../api.ts";
import { icedon, z } from "../deps.ts";
import { NreplEvalApi, NreplEvalArg } from "../types.ts";

type App = icedon.App;

const EvaluateArg = z.object({
  args: z.tuple([z.string()]),
});

const evaluate = {
  name: "icedon_eval",
  run: async (app: App, args: unknown[]) => {
    const parsed = EvaluateArg.parse(icedon.arg.parse(args));
    return await app.requestApi(
      NreplEvalApi,
      { code: parsed.args[0] } as NreplEvalArg,
    );
  },
};

const evaluateOuterTopForm = {
  name: "icedon_eval_outer_top_form",
  run: async (app: App, _args: unknown[]) => {
    const ns = await api.namespace.getName(app);
    const curpos = await api.cursor.getPosition(app);
    const [code, pos] = await api.paredit.getCurrentTopForm(app);

    return await app.requestApi(NreplEvalApi, {
      code: code,
      line: pos[0],
      column: pos[1],
      cursorLine: curpos[0],
      cursorColumn: curpos[1],
      ns: ns,
    } as NreplEvalArg);
  },
};

const evaluateOuterForm = {
  name: "icedon_eval_outer_form",
  run: async (app: App, _args: unknown[]) => {
    const ns = await api.namespace.getName(app);
    const curpos = await api.cursor.getPosition(app);
    const [code, pos] = await api.paredit.getCurrentForm(app);

    return await app.requestApi(NreplEvalApi, {
      code: code,
      line: pos[0],
      column: pos[1],
      cursorLine: curpos[0],
      cursorColumn: curpos[1],
      ns: ns,
    } as NreplEvalArg);
  },
};

const evaluateNsForm = {
  name: "icedon_eval_ns_form",
  run: async (app: App, _args: unknown[]) => {
    const [code, _pos] = await api.paredit.getNsForm(app);
    return await app.requestApi(NreplEvalApi, { code: code } as NreplEvalArg);
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
