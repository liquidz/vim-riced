import { core, Denops, unknownutil, vars } from "./deps.ts";
import { AppImpl } from "./impl/app.ts";
import { LoaderImpl } from "./impl/loader.ts";

export function main(denops: Denops): Promise<void> {
  const app = new AppImpl({
    denops: denops,
    core: new core.CoreImpl(),
  });
  const loader = new LoaderImpl();

  denops.dispatcher = {
    async initialize() {
      await loader.loadFunctions(app, [
        "connect",
        "request",
        "evaluate",
      ]);

      await loader.loadBaseInterceptors(app, [
        "connected",
        "evaluated",
        "output",
      ]);

      for (const interceptor of loader.loadedBaseInterceptors()) {
        app.interceptorManager.registerInterceptor(interceptor);
      }
    },

    request(name: unknown, argsJson: unknown) {
      if (!unknownutil.is.String(name) || !unknownutil.is.String(argsJson)) {
        throw new Deno.errors.InvalidData("name and argsJson must be string");
      }

      const args = JSON.parse(argsJson);

      const fn = loader.loadedFunctions().find((c) => c.name === name);
      if (fn == null) {
        throw new Deno.errors.NotFound(`command not found: ${name}`);
      }

      return fn.exec(app, args);
    },
  };

  const n = denops.name;
  denops.dispatch(n, "initialize", []);
  vars.g.set<string>(denops, "riced_plugin_name", n);
  console.log("initialized!");

  return Promise.resolve();
}
