import { autocmd, core, Denops, unknownutil, vars } from "./deps.ts";
import { AppImpl } from "./impl/app.ts";
import { LoaderImpl } from "./impl/loader.ts";
import { EVENTS } from "./autocmd/types.ts";

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
        "disconnect",
        "request",
        "evaluate",
      ]);

      await loader.loadBaseInterceptors(app, [
        "autocmd_buf_enter",
        "autocmd_buf_read",
        "autocmd_vim_leave",
        "connected",
        "disconnected",
        "evaluated",
        "output",
      ]);

      for (const interceptor of loader.loadedBaseInterceptors()) {
        app.interceptorManager.registerInterceptor(interceptor);
      }

      await autocmd.group(denops, "riced-autocmd", (helper) => {
        const pattern = "*.clj,*.cljs,*.cljc";
        for (const event of EVENTS) {
          helper.define(
            event,
            pattern,
            `call riced#autocmd_intercept('autocmd_${event}')`,
          );
        }
      });
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

    intercept(group: unknown, argJson: unknown) {
      if (typeof group !== "string" || typeof argJson !== "string") {
        return;
      }
      app.intercept(group, JSON.parse(argJson), (ctx) => Promise.resolve(ctx));
    },
  };

  const n = denops.name;
  denops.dispatch(n, "initialize", []);
  vars.g.set<string>(denops, "riced_plugin_name", n);
  console.log("initialized!");

  return Promise.resolve();
}
