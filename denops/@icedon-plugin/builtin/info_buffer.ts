import { helper, icedon, unknownutil, vimFn } from "../deps.ts";
import {
  AppendToInfoBufferApi,
  ClearInfoBufferApi,
  CloseInfoBufferApi,
  OpenInfoBufferApi,
} from "../types.ts";
import * as api from "../api.ts";
import * as vimWin from "../util/vim/window.ts";

type App = icedon.App;
const bufferName = "icedon_info";

async function ready(app: App): Promise<void> {
  const denops = app.denops;
  if (await vimFn.bufnr(denops, bufferName) !== -1) {
    return;
  }

  helper.execute(
    denops,
    `
    silent execute ':split ${bufferName}'
    silent execute ':q'

    call setbufvar('${bufferName}', 'lsp_diagnostics_enabled', 0)
    call setbufvar('${bufferName}', '&bufhidden', 'hide')
    call setbufvar('${bufferName}', '&buflisted', 0)
    call setbufvar('${bufferName}', '&buftype', 'nofile')
    call setbufvar('${bufferName}', '&filetype', 'clojure')
    call setbufvar('${bufferName}', '&swapfile', 0)
    call setbufvar('${bufferName}', '&wrap', 0)
    `,
  );

  return;
}

const open = {
  name: OpenInfoBufferApi,
  run: async (app: App, _: unknown[]) => {
    const denops = app.denops;
    const currentWin = await vimFn.winnr(denops);
    if (await vimWin.isVisible(app, bufferName)) {
      await vimWin.focusByName(app, bufferName);
      return false;
    }
    if (!await vimWin.open(app, bufferName)) {
      return false;
    }
    await vimWin.focusByWinNr(app, currentWin);
    return true;
  },
};

const clear = {
  name: ClearInfoBufferApi,
  run: async (app: App, _: unknown[]) => {
    await vimWin.clear(app, bufferName);
  },
};

const close = {
  name: CloseInfoBufferApi,
  run: async (app: App, _: unknown[]) => {
    await vimWin.close(app, bufferName);
  },
};

const append = {
  name: AppendToInfoBufferApi,
  run: (app: App, args: unknown[]) => {
    return app.intercept("info_buffer_append", { lines: args }, async (ctx) => {
      if (unknownutil.isArray<string>(ctx.params["lines"])) {
        // TODO: use batch
        for (const line of ctx.params["lines"]) {
          await vimWin.appendLine(ctx.app, bufferName, line);
        }
        await app.denops.redraw();
      }
      return ctx;
    });
  },
};

export class Api extends icedon.ApiPlugin {
  readonly apis = [open, close, clear, append];

  async onInit(app: App) {
    await ready(app);
    await api.registerApiCommand(app, open);
    await api.registerApiCommand(app, close);
    await api.registerApiCommand(app, clear);
  }
}
