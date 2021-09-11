import { API, BasePlugin, Command, Diced } from "../../types.ts";
import { unknownutil } from "../../deps.ts";

import * as vimBuf from "../../std/vim/buffer.ts";

import * as infoBuf from "./buffer.ts";

const OpenInfoBuffer: Command = {
  name: "OpenInfoBuffer",
  run: async (diced, _) => {
    await infoBuf.open(diced);
  },
};

const appendLine: API = {
  name: "info_buffer_append_lines",
  run: async (diced, args): Promise<void> => {
    if (!unknownutil.isArray<string>(args)) return;

    for (const line of args) {
      await vimBuf.appendLine(diced, infoBuf.bufName, line);
    }
  },
};

export class Plugin extends BasePlugin {
  readonly apis = [appendLine];
  readonly commands = [OpenInfoBuffer];

  async onInit(diced: Diced): Promise<void> {
    await infoBuf.ready(diced);
  }
}
