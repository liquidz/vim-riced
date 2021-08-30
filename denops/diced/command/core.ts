import { Command, Diced } from "../types.ts";
import { execute } from "../deps.ts";

import * as setting from "./setting.ts";

const allCommands: Array<Command> = [
  setting.ToggleDebug,
];

export const commandMap = allCommands.reduce((accm, cmd) => {
  accm[cmd.name] = cmd;
  return accm;
}, {} as Record<string, Command>);

export function generateRegisterCommand(diced: Diced, cmd: Command): string {
  const denops = diced.denops;
  const nargs = (cmd.nargs == null) ? "" : `-nargs=${cmd.nargs}`;
  const range = (cmd.range == null || !cmd.range) ? "" : "-range";
  const complete = (cmd.complete == null) ? "" : `-complete=${cmd.complete}`;
  const args = `"${cmd.name}"` + ((cmd.args == null) ? "" : `, ${cmd.args}`);
  const plugMap = (cmd.plug == null)
    ? ""
    : (range === "")
    ? `nnoremap`
    : `vnoremap`;

  const plug = (plugMap === "")
    ? ""
    : `${plugMap} <silent> <Plug>(diced_${cmd.plug}) :<C-u>Diced${cmd.name}<CR>`;

  return `
   command! ${range} ${nargs} ${complete} Diced${cmd.name} call denops#notify("${denops.name}", "command", [${args}])
   ${plug}
   `;
}

export async function registerInitialCommands(diced: Diced): Promise<void> {
  await execute(
    diced.denops,
    allCommands.map((c) => generateRegisterCommand(diced, c)).join("\n"),
  );
}
