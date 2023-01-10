import { icedon } from "../deps.ts";
import { NreplEvalApi, NreplEvalArg } from "../types.ts";

type App = icedon.App;

// ===== add-middleware
// ===== completions
// ===== describe

// ===== eval
const evalOp = {
  name: NreplEvalApi,
  run: (app: App, args: unknown[]) => {
    const parsed = NreplEvalArg.parse(icedon.arg.parse(args).opts);

    if (app.icedon.current() === undefined) {
      throw Deno.errors.NotConnected;
    }

    return app.intercept("evaluate", parsed, async (ctx) => {
      const params = NreplEvalArg.parse(ctx.params);
      const msg: icedon.NreplMessage = {
        op: "eval",
        "nrepl.middleware.print/stream?": 1,
        code: params.code,
      };
      const opt: icedon.NreplWriteOption = {};

      if (params.session !== undefined) {
        msg["session"] = params.session;
      }
      if (params.file !== undefined) {
        msg["file"] = params.file;
      }
      if (params.ns !== undefined) {
        msg["ns"] = params.ns;
      }
      if (params.line !== undefined) {
        msg["line"] = params.line;
      }
      if (params.column !== undefined) {
        msg["column"] = params.column;
      }
      if ((params.pprint || false)) {
        msg["nrepl.middleware.print/print"] = "cider.nrepl.pprint/pprint";
      }
      if (params.verbose !== undefined && !params.verbose) {
        opt.context = { verbose: "false" };
      }
      if (params.wait !== undefined && !params.wait) {
        opt.doesWaitResponse = false;
      }

      ctx.params["response"] = await app.icedon.request(msg, opt);
      return ctx;
    });
  },
};

// ===== interrupt
// ===== load-file
// ===== lookup
// ===== ls-middleware
// ===== ls-sessions
// ===== sideloader-provide
// ===== sideloader-start
// ===== stdin
// ===== swap-middleware
//

export class Api extends icedon.ApiPlugin {
  readonly name = "icedon builtin nrepl op";
  readonly apis = [evalOp];
}
