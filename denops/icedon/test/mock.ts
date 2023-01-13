import { NreplMessage } from "../types.ts";
import { AppImpl } from "../impl/app.ts";
import { Denops, path } from "../deps.ts";
import { nrepl_mock } from "../test_deps.ts";
import { IcedonMock } from "../../@icedon-core/test/mock.ts";
import { defaultPlugins } from "../main.ts";

// cf. https://qiita.com/SuzuTomo2001/items/8c505b30b69745fe6753
function pathResolver(meta: ImportMeta): (p: string) => string {
  return (p) => path.fromFileUrl(new URL(p, meta.url));
}
const resolve = pathResolver(import.meta);

const defaultRelayFunction: nrepl_mock.RelayFunction = (
  _msg,
  _opt?,
): NreplMessage => {
  return {};
};

export class AppMock extends AppImpl {
  /**
   * DO NOT construct directly. Use `build` instead.
   */
  constructor(denops: Denops, relay?: nrepl_mock.RelayFunction) {
    const relayFn = relay ?? defaultRelayFunction;
    super({ denops: denops, icedon: new IcedonMock(relayFn) });
  }

  static async build(
    { denops, relay }: { denops: Denops; relay?: nrepl_mock.RelayFunction },
  ): Promise<AppMock> {
    const app = new AppMock(denops, relay);

    for (const pluginName of defaultPlugins) {
      const filePath = resolve(`../../@icedon-plugin/${pluginName}.ts`);
      await app.plugin.loadPlugin(app, pluginName, filePath);
    }

    return app;
  }
}
