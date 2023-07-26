import { App, BaseFunction, std } from "./deps.ts";

export class Function extends BaseFunction {
  readonly functions = [
    {
      name: "evaluate",
      exec: (app: App, arg: unknown) => {
        const parsed = std.op.nrepl.EvalArgSchema.safeParse(arg);
        if (!parsed.success) {
          return Promise.reject(new Deno.errors.InvalidData());
        }
        return std.op.nrepl.evaluate(app, parsed.data);
      },
    },
    {
      name: "evaluateCurrentForm",
      exec: (app: App, _arg: unknown) => {
        return std.evaluate.evaluateCurrentForm(app);
      },
    },
  ];
}
