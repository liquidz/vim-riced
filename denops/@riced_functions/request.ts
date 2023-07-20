import { App, BaseFunction, std } from "./deps.ts";

export class Function extends BaseFunction {
  readonly functions = [
    {
      name: "request",
      exec: (app: App, arg: unknown) => {
        const parsed = std.request.ArgSchema.safeParse(arg);
        if (!parsed.success) {
          return Promise.reject(new Deno.errors.InvalidData());
        }
        return std.request.request(app, parsed.data);
      },
    },
  ];
}
