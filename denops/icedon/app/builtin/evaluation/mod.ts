import { ApiPlugin, App } from "../../../types.ts";
import * as api from "../../api.ts";
import { nrepl, unknownutil } from "../../../deps.ts";

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
    const msg: nrepl.NreplMessage = {
      op: "eval",
      "nrepl.middleware.print/stream?": 1,
      code: code,
    };
    const opt: nrepl.NreplWriteOption = {};

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
    // FIXME
    console.log(ctx.params["response"]);
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

export class Api extends ApiPlugin {
  readonly name = "icedon builtin evaluation";
  readonly apis = [evaluate];

  async onInit(app: App) {
    await api.registerApiCommand(app, evaluate, { nargs: "1" });
  }
}
