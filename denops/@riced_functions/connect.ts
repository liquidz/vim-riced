import { App, BaseFunction, std } from "./deps.ts";

export class Function extends BaseFunction {
  readonly functions = [
    {
      name: "connect",
      exec: (app: App, arg: unknown) => {
        const parsed = std.connect.ArgSchema.safeParse(arg);
        if (!parsed.success) {
          return Promise.reject(new Deno.errors.InvalidData());
        }
        return std.connect.connect(app, parsed.data);
      },
    },
  ];
}
