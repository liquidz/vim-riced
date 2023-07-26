import { App, BaseFunction, std } from "./deps.ts";

export class Function extends BaseFunction {
  readonly functions = [
    {
      name: "disconnect",
      exec: (app: App, _args: unknown) => {
        return std.disconnect.disconnect(app);
      },
    },
    {
      name: "disconnectAll",
      exec: (app: App, _args: unknown) => {
        return std.disconnect.disconnectAll(app);
      },
    },
  ];
}
