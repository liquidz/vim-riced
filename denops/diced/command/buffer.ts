import { Command } from "../types.ts";

import * as vimBufInfo from "../vim/buffer/info.ts";

export const OpenInfoBuffer: Command = {
  name: "OpenInfoBuffer",
  run: async (diced, _) => {
    await vimBufInfo.open(diced.denops);
  },
};
