import { core, Denops, unknownutil, vars } from "./deps.ts";
import { App, BaseInterceptor, Command } from "./types.ts";
import { AppImpl } from "./impl/app.ts";

import * as std from "../@std/mod.ts";

import { ConnectedInterceptor } from "../@riced-plugins/connect/connected.ts";
import { OutputInterceptor } from "../@riced-plugins/output/output.ts";
import { EvaluatedInterceptor } from "../@riced-plugins/evaluate/evaluated.ts";

//import { searchPluginPaths } from "./impl/plugin.ts";

// const TestCommand: Command = {
//   name: "test",
//   exec: async (app, _arg) => {
//     // const code = await std.sexp.getCurrentTopList(app);
//     // console.log(code);
//   },
// };

export function main(denops: Denops): Promise<void> {
  const app: App = new AppImpl({
    denops: denops,
    core: new core.CoreImpl(),
  });

  const commands: Command[] = [
    std.connect.ConnectCommand,
    std.request.RequestCommand,
    std.evaluate.EvaluateCodeCommand,
    std.evaluate.EvaluateCurrentFormCommand,
    //TestCommand,
  ];

  denops.dispatcher = {
    initialize() {
      //await searchPluginPaths(denops, []);
      //

      app.interceptorManager.registerInterceptor(
        new ConnectedInterceptor("test connect") as BaseInterceptor<unknown>,
      );
      app.interceptorManager.registerInterceptor(
        new OutputInterceptor("test output") as BaseInterceptor<unknown>,
      );
      app.interceptorManager.registerInterceptor(
        new EvaluatedInterceptor("test evaluated") as BaseInterceptor<unknown>,
      );
      // register interceptors
      // register commands
      // register extensions
      // try {
      //   const paths = await searchPluginPaths(denops, defaultPlugins);
      //   for (const pluginName of Object.keys(paths)) {
      //     await app.pluginManager.loadPlugin(
      //       app,
      //       pluginName,
      //       paths[pluginName],
      //     );
      //   }
      //   app.pluginManager.sortInterceptors();
      // } catch (err) {
      //   if (err instanceof Error) {
      //     console.error(err.message);
      //   } else {
      //     console.error(err);
      //   }
      // }
    },

    request(name: unknown, argsJson: unknown) {
      if (!unknownutil.is.String(name) || !unknownutil.is.String(argsJson)) {
        throw new Deno.errors.InvalidData("name and argsJson must be string");
      }

      const args = JSON.parse(argsJson);

      const command = commands.find((c) => c.name === name);
      if (command == null) {
        throw new Deno.errors.NotFound(`command not found: ${name}`);
      }

      return command.exec(app, args);
    },
    // async request(jsonText: unknown) {
    //   if (app.core.current == null) {
    //     throw new Deno.errors.NotConnected();
    //   }
    //   if (!unknownutil.is.String(jsonText)) {
    //     throw new Deno.errors.InvalidData("jsonText must be string");
    //   }
    //
    //   const msg = JSON.parse(jsonText);
    //   if (!core.nrepl.bencode.isObject(msg)) {
    //     throw new Deno.errors.InvalidData("msg must be object");
    //   }
    //
    //   const resp = await app.core.request(msg);
    //   console.log(resp);
    // },
  };

  const n = denops.name;
  denops.dispatch(n, "initialize", []);
  vars.g.set<string>(denops, "riced_plugin_name", n);
  console.log("initialized!");

  return Promise.resolve();
}
