import { ApiPlugin, App, NreplMessage, NreplWriteOption } from "../types.ts";
import * as api from "../api.ts";
import * as apiAlias from "../api/alias.ts";
import { unknownutil } from "../deps.ts";

type EvalArg = {
  code: string;
  session?: string;
  file?: string;
  ns?: string;
  line?: number;
  column?: number;
  pprint?: boolean;
  verbose?: boolean;
  wait?: boolean;
};

function _evaluate(app: App, arg: EvalArg) {
  return app.intercept("evaluate", arg, async (ctx) => {
    const code = ctx.params["code"];
    if (!unknownutil.isString(code)) {
      throw Deno.errors.InvalidData;
    }
    const msg: NreplMessage = {
      op: "eval",
      "nrepl.middleware.print/stream?": 1,
      code: code,
    };
    const opt: NreplWriteOption = {};

    if (unknownutil.isString(ctx.params["session"])) {
      msg["session"] = ctx.params["session"];
    }
    if (unknownutil.isString(ctx.params["file"])) {
      msg["file"] = ctx.params["file"];
    }
    if (unknownutil.isString(ctx.params["ns"])) {
      msg["ns"] = ctx.params["ns"];
    }
    if (unknownutil.isNumber(ctx.params["line"])) {
      msg["line"] = ctx.params["line"];
    }
    if (unknownutil.isNumber(ctx.params["column"])) {
      msg["column"] = ctx.params["column"];
    }
    if (unknownutil.isBoolean(ctx.params["pprint"]) && ctx.params["pprint"]) {
      msg["nrepl.middleware.print/print"] = "cider.nrepl.pprint/pprint";
    }
    if (
      unknownutil.isBoolean(ctx.params["verbose"]) && !ctx.params["verbose"]
    ) {
      opt.context = { verbose: "false" };
    }
    if (unknownutil.isBoolean(ctx.params["wait"]) && !ctx.params["wait"]) {
      opt.doesWaitResponse = false;
    }

    ctx.params["response"] = await app.icedon.request(msg, opt);
    return ctx;
  });
}

const evaluate = {
  name: "icedon_eval",
  run: async (app: App, args: unknown[]) => {
    unknownutil.assertArray<string>(args);
    if (app.icedon.current() === undefined) {
      return Deno.errors.NotConnected;
    }

    const code = args[0];
    return await _evaluate(app, { code: code });
  },
};

const evaluateOuterTopForm = {
  name: "icedon_eval_outer_top_form",
  run: async (app: App, _args: unknown[]) => {
    const ns = await apiAlias.getNsName(app);
    const [code, pos] = await apiAlias.getCurrentTopForm(app);
    return await _evaluate(app, { code: code, line: pos[0], ns: ns });
  },
};

const evaluateNsForm = {
  name: "icedon_eval_ns_form",
  run: async (app: App, _args: unknown[]) => {
    const [code, pos] = await apiAlias.getNsForm(app);
    console.log(`ns code = ${code}`);
    return await _evaluate(app, { code: code, line: pos[0] });
  },
};

export class Api extends ApiPlugin {
  readonly name = "icedon builtin evaluation";
  readonly apis = [
    evaluate,
    evaluateOuterTopForm,
    evaluateNsForm,
  ];

  async onInit(app: App) {
    await api.registerApiCommand(app, evaluate, { nargs: "1" });
    await api.registerApiCommand(app, evaluateOuterTopForm);
    await api.registerApiCommand(app, evaluateNsForm);
  }
}
