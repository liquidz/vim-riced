import { Denops, dpsHelper, dpsVars, path, unknownutil } from "./deps.ts";
import { API, BaseInterceptor, BasePlugin, Command, Diced } from "./types.ts";
import * as interceptor from "./interceptor/mod.ts";
import * as cmd from "./command/core.ts";

import * as core from "./core/mod.ts";

const initialInterceptors: BaseInterceptor[] = [
  new interceptor.ReadInterceptor(),
  //new interceptor.PortDetectionInterceptor(),
  //new interceptor.ConnectedInterceptor(),
  new interceptor.NormalizeCodeInterceptor(),
  new interceptor.BufferInitializationInterceptor(),
  new interceptor.NormalizeNsPathInterceptor(),
  new interceptor.EvaluatedInterceptor(),
];

const apiMap: Record<string, API> = {};
const commandMap: Record<string, Command> = {};
const registeredPluginPaths: Record<string, boolean> = {};

async function initializeGlobalVariable(
  denops: Denops,
  name: string,
  defaultValue: unknown,
) {
  const value = await dpsVars.g.get(denops, name, defaultValue);
  await dpsVars.g.set(denops, name, value);
}

async function initializeGlobalVariables(
  denops: Denops,
  m: Record<string, unknown>,
) {
  for (const name in m) {
    await initializeGlobalVariable(denops, name, m[name]);
  }
}

async function registerPlugin(diced: Diced, filePath: string): Promise<void> {
  // Avoid multiple loading
  if (filePath in registeredPluginPaths) return;
  registeredPluginPaths[filePath] = true;

  const mod = await import(path.toFileUrl(filePath).href);
  const plugin: BasePlugin = new mod.Plugin();

  // Register interceptors
  for (const interceptor of plugin.interceptors) {
    core.addInterceptor(diced, interceptor);
  }

  // Register commands
  for (const command of plugin.commands) {
    if (commandMap[command.name] != null) continue;
    commandMap[command.name] = command;
  }
  await dpsHelper.execute(
    diced.denops,
    plugin.commands.map((c) => cmd.generateRegisterCommand(diced, c)).join(
      "\n",
    ),
  );

  // Register APIs
  for (const api of plugin.apis) {
    if (apiMap[api.name] != null) continue;
    apiMap[api.name] = api;
  }

  // Initialize
  await plugin.onInit(diced);
}

async function registerBuiltInPlugins(
  diced: Diced,
  builtInNames: Array<string>,
): Promise<void> {
  const home = await dpsVars.g.get(diced.denops, "vim_diced_home");
  if (!unknownutil.isString(home)) return;

  builtInNames.forEach((name) => {
    const filePath = path.join(
      home,
      "denops",
      "diced",
      "builtin",
      name,
      "mod.ts",
    );
    registerPlugin(diced, filePath);
  });
}

export async function main(denops: Denops) {
  //const diced = new DicedImpl(denops);
  const diced = new core.DicedImpl(denops);

  denops.dispatcher = {
    async setup(): Promise<void> {
      // Register built-ins
      registerBuiltInPlugins(diced, [
        "connected",
        "auto_port_detection",
        "form_evaluation",
        "complete",
      ]);

      await cmd.registerInitialCommands(diced);

      // add interceptors
      for (const i of initialInterceptors) {
        core.addInterceptor(diced, i);
      }

      await dpsHelper.execute(
        denops,
        `
        command! -range   DicedTest call denops#notify("${denops.name}", "test", [])
        `,
      );

      await initializeGlobalVariables(
        denops,
        { diced_does_eval_inside_comment: true },
      );
    },

    async registerPlugin(filePath: unknown): Promise<void> {
      if (!unknownutil.isString(filePath)) return;
      await registerPlugin(diced, filePath);
    },

    async test(): Promise<void> {
      await Promise.resolve(true);
    },

    async command(commandName: unknown, ...args: unknown[]): Promise<void> {
      if (!unknownutil.isString(commandName)) return;
      const c = commandMap[commandName];
      if (c != null) return await c.run(diced, args);

      // FIXME
      const oldC = cmd.commandMap[commandName];
      if (oldC != null) return await oldC.run(diced, args);
    },

    async api(apiName: unknown, ...args: unknown[]): Promise<unknown> {
      if (!unknownutil.isString(apiName)) return;
      const api = apiMap[apiName];
      if (api == null) return;
      return await api.run(diced, args);
    },
  };

  console.log(`${denops.name}: Ready`);
  await dpsVars.g.set(denops, "diced#initialized", true);
  await denops.cmd("doautocmd <nomodeline> User DicedReady");
}
