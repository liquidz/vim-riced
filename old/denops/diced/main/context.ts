import { dpsHelper, path, snakeCase } from "../deps.ts";
import { API, BasePlugin, Command, Diced } from "../types.ts";

import * as core from "../core/mod.ts";

export class AppContext {
  apiMap: Record<string, API> = {};
  commandMap: Record<string, Command> = {};
  registeredPluginPaths: Record<string, boolean> = {};
}

function generateRegisterCommand(diced: Diced, cmd: Command): string {
  const denops = diced.denops;
  const nargs = (cmd.nargs == null) ? "" : `-nargs=${cmd.nargs}`;
  const range = (cmd.range == null || !cmd.range) ? "" : "-range";
  const complete = (cmd.complete == null) ? "" : `-complete=${cmd.complete}`;
  const args = `"${cmd.name}"` + ((cmd.args == null) ? "" : `, ${cmd.args}`);
  const plugMap = (range === "") ? `nnoremap` : `vnoremap`;
  const plugName = (cmd.plug == null) ? snakeCase.default(cmd.name) : cmd.plug;
  const plug =
    `${plugMap} <silent> <Plug>(diced_${plugName}) :<C-u>Diced${cmd.name}<CR>`;

  // FIXME TODO command に -buffer オプションをつけないとグローバルにコマンドを定義してしまうとのこと
  return `
   command! ${range} ${nargs} ${complete} Diced${cmd.name} call denops#notify("${denops.name}", "command", [${args}])
   ${plug}
   `;
}

export async function registerRawPlugin(
  diced: Diced,
  context: AppContext,
  plugin: BasePlugin,
): Promise<void> {
  // Register interceptors
  for (const interceptor of plugin.interceptors) {
    core.addInterceptor(diced, interceptor);
  }

  // Register commands
  for (const command of plugin.commands) {
    if (context.commandMap[command.name] != null) continue;
    context.commandMap[command.name] = command;
  }
  await dpsHelper.execute(
    diced.denops,
    plugin.commands.map((c) => generateRegisterCommand(diced, c)).join(
      "\n",
    ),
  );

  // Register APIs
  for (const api of plugin.apis) {
    if (context.apiMap[api.name] != null) continue;
    context.apiMap[api.name] = api;
  }

  // Initialize
  await plugin.onInit(diced);
}

export async function registerPlugin(
  diced: Diced,
  context: AppContext,
  filePath: string,
): Promise<void> {
  // Avoid multiple loading
  if (filePath in context.registeredPluginPaths) return;
  context.registeredPluginPaths[filePath] = true;

  const mod = await import(path.toFileUrl(filePath).href);
  const plugin: BasePlugin = new mod.Plugin();

  await registerRawPlugin(diced, context, plugin);
}
