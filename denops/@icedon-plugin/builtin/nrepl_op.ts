import { icedon, z } from "../deps.ts";

type App = icedon.App;

// ===== add-middleware
// ===== completions
// ===== describe

// ===== eval
export const EvalApi = "icedon_nrepl_op_eval";
export const EvalArg = z.object({
  code: z.string(),
  session: z.string().optional(),
  file: z.string().optional(),
  ns: z.string().optional(),
  line: z.coerce.number().optional(),
  column: z.coerce.number().optional(),
  cursorLine: z.coerce.number().optional(),
  cursorColumn: z.coerce.number().optional(),
  pprint: z.coerce.boolean().optional(),
  verbose: z.coerce.boolean().optional(),
  wait: z.coerce.boolean().optional(),
});
export type EvalArg = z.infer<typeof EvalArg>;

const evalOp = {
  name: "icedon_nrepl_op_eval",
  run: (app: App, args: unknown[]) => {
    const parsed = EvalArg.parse(icedon.arg.parse(args).opts);

    if (app.icedon.current() === undefined) {
      throw Deno.errors.NotConnected;
    }

    return app.intercept("evaluate", parsed, async (ctx) => {
      const params = EvalArg.parse(ctx.params);
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
