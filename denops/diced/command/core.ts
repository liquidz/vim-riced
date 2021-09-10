import { Command, Diced } from "../types.ts";
import { dpsHelper, snakeCase } from "../deps.ts";

import * as _buffer from "./buffer.ts";
import * as _document from "./document.ts";
import * as _eval from "./eval.ts";
import * as _setting from "./setting.ts";
import * as _test from "./test.ts";

const allCommands: Array<Command> = [
  _buffer.OpenInfoBuffer,
  _document.ShowDocument,
  _eval.EvalCode,
  _eval.EvalOuterList,
  _eval.EvalOuterTopList,
  _setting.ToggleDebug,
  _test.TestNs,
  _test.TestUnderCursor,
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
  const plugMap = (range === "") ? `nnoremap` : `vnoremap`;
  const plugName = (cmd.plug == null) ? snakeCase.default(cmd.name) : cmd.plug;
  const plug =
    `${plugMap} <silent> <Plug>(diced_${plugName}) :<C-u>Diced${cmd.name}<CR>`;

  return `
   command! ${range} ${nargs} ${complete} Diced${cmd.name} call denops#notify("${denops.name}", "command", [${args}])
   ${plug}
   `;
}

export async function registerInitialCommands(diced: Diced): Promise<void> {
  await dpsHelper.execute(
    diced.denops,
    allCommands.map((c) => generateRegisterCommand(diced, c)).join("\n"),
  );
}
