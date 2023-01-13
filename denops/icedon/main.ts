import { Denops, option, unknownutil, vars, vimFn } from "./deps.ts";
import * as core from "../@icedon-core/mod.ts";
import { AppImpl } from "./impl/app.ts";
import { App } from "./types.ts";

export const defaultPlugins = [
  // api
  "builtin/cache",
  "builtin/message",
  "builtin/connection",
  "builtin/paredit",
  "builtin/namespace",
  "builtin/cursor",
  "builtin/nrepl_op",
  "builtin/evaluation",
  "builtin/info_buffer",
  // interceptor
  "builtin/nrepl_output",
  "builtin/port_detection",
  "builtin/evaluated_response",
  "builtin/code_in_comment",
];

async function searchPluginPaths(
  denops: Denops,
  pluginNames: string[],
): Promise<string[]> {
  const runtimepath = await option.runtimepath.getGlobal(denops);
  const result: string[] = [];
  for (const pluginName of pluginNames) {
    const path = `denops/@icedon-plugin/${pluginName}.ts`;
    const searched = await vimFn.globpath(denops, runtimepath, path, 1, 1);
    unknownutil.assertArray<string>(searched);

    for (const p of searched) {
      result.push(p);
    }
  }
  return result;
}

export function main(denops: Denops): Promise<void> {
  const app: App = new AppImpl({
    denops: denops,
    icedon: new core.IcedonImpl(new core.ConnectionManagerImpl()),
  });

  denops.dispatcher = {
    async initialize() {
      console.log("Ready");

      try {
        // register built-in plugins
        const paths = await searchPluginPaths(denops, defaultPlugins);
        for (const p of paths) {
          await app.plugin.loadPlugin(app, p);
        }
        app.plugin.checkPlugins();
        app.plugin.sortInterceptors();
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error(err);
        }
      }
    },

    async dispatchApi(apiName, args) {
      try {
        unknownutil.assertString(apiName);
        unknownutil.assertArray(args);
        return await app.requestApi(apiName, args);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error(err);
        }
      }
    },
  };

  const n = denops.name;
  denops.dispatch(n, "initialize", []);
  vars.g.set<string>(denops, "icedon_plugin_name", n);

  return Promise.resolve();
}
