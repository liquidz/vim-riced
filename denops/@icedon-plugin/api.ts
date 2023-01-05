import { Api, App, Command } from "./types.ts";
import { helper, kase } from "./deps.ts";

function generateRegisterCommand(
  app: App,
  api: Api,
  cmd: Command,
): string {
  const denops = app.denops;
  const name = (cmd.name !== undefined) ? cmd.name : kase.pascalCase(api.name);
  const nargs = (cmd.nargs == null) ? "" : `-nargs=${cmd.nargs}`;
  const range = (cmd.range == null || !cmd.range) ? "" : "-range";
  const complete = (cmd.complete == null) ? "" : `-complete=${cmd.complete}`;

  let args = "";
  if (cmd.args !== undefined) {
    args = cmd.args;
  } else {
    switch (cmd.nargs) {
      case "*":
      case "+":
        args = "[<f-args>]";
        break;

      case "1":
      case "?":
        args = "<q-args>";
    }
  }

  const plugMap = (range === "") ? `nnoremap` : `vnoremap`;
  const plugName = (cmd.plug == null) ? kase.snakeCase(name) : cmd.plug;
  const plug = `${plugMap} <silent> <Plug>(${plugName}) :<C-u>${name}<CR>`;

  // FIXME TODO command に -buffer オプションをつけないとグローバルにコマンドを定義してしまうとのこと
  return `
   command! ${range} ${nargs} ${complete} ${name} call denops#notify("${denops.name}", "dispatchApi", ["${api.name}", [${args}]])
   ${plug}
   `;
}

export async function registerApiCommand(
  app: App,
  api: Api,
  cmd?: Command,
): Promise<void> {
  await helper.execute(
    app.denops,
    generateRegisterCommand(app, api, cmd || {}),
  );
}

export function request(app: App, apiName: string, args: unknown[]) {
  return app.requestApi(apiName, args);
}
