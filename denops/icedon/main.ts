import { Denops, option, unknownutil, vimFn } from "./deps.ts";
import * as core from "../@icedon-core/mod.ts";
import { AppImpl } from "./impl/app.ts";
import { App } from "./types.ts";

export const defaultPlugins = [
  // api
  "builtin/cache",
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
      console.log("kiteruyo");

      // register built-in plugins
      const paths = await searchPluginPaths(denops, defaultPlugins);
      for (const p of paths) {
        await app.plugin.loadPlugin(app, p);
      }
      app.plugin.sortInterceptors();
    },

    async dispatchApi(apiName, args) {
      unknownutil.assertString(apiName);
      unknownutil.assertArray(args);

      try {
        return await app.requestApi(apiName, args);
      } catch (err) {
        console.log(err);
      }
    },
  };

  const n = denops.name;
  denops.dispatch(n, "initialize", []);

  return Promise.resolve();
}
