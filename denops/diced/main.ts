import { Denops, dpsHelper, dpsVars, path, unknownutil } from "./deps.ts";
import { Diced } from "./types.ts";
import * as core from "./core/mod.ts";
import * as mainContext from "./main/context.ts";

async function initializeGlobalVariable(
  denops: Denops,
  name: string,
  defaultValue: unknown,
) {
  const value = await dpsVars.g.get(denops, name, defaultValue);
  await dpsVars.g.set(denops, name, value);
}

async function initializeGlobalVariables(
  denops: Denops,
  m: Record<string, unknown>,
) {
  for (const name in m) {
    await initializeGlobalVariable(denops, name, m[name]);
  }
}

async function registerBuiltInPlugins(
  diced: Diced,
  ctx: mainContext.AppContext,
  builtInNames: Array<string>,
): Promise<void> {
  const home = await dpsVars.g.get(diced.denops, "vim_diced_home");
  if (!unknownutil.isString(home)) return;

  builtInNames.forEach((name) => {
    const filePath = path.join(
      home,
      "denops",
      "diced",
      "builtin",
      name,
      "mod.ts",
    );
    mainContext.registerPlugin(diced, ctx, filePath);
  });
}

export async function main(denops: Denops) {
  const diced = new core.DicedImpl(denops);
  const ctx = new mainContext.AppContext();

  denops.dispatcher = {
    async setup(): Promise<void> {
      // Register built-ins
      registerBuiltInPlugins(diced, ctx, [
        "connected",
        "auto_port_detection",
        "form_evaluation",
        "complete",
        "clojure_test",
        "diced_debug",
        "document_reference",
        "info_buffer",
        "normalize_ns_path",
        "standard_output",
        "code_evaluated",
        "normalize_code",
      ]);
      core.sortAllInterceptors(diced);

      await dpsHelper.execute(
        denops,
        `
        command! -range   DicedTest call denops#notify("${denops.name}", "test", [])
        `,
      );

      await initializeGlobalVariables(
        denops,
        { diced_does_eval_inside_comment: true },
      );
    },

    async registerPlugin(filePath: unknown): Promise<void> {
      if (!unknownutil.isString(filePath)) return;
      await mainContext.registerPlugin(diced, ctx, filePath);
      core.sortAllInterceptors(diced);
    },

    async test(): Promise<void> {
      await Promise.resolve(true);
    },

    async command(commandName: unknown, ...args: unknown[]): Promise<void> {
      if (!unknownutil.isString(commandName)) return;
      const c = ctx.commandMap[commandName];
      if (c == null) return;
      return await c.run(diced, args);
    },

    api(apiName: unknown, ...args: unknown[]): Promise<unknown> {
      if (!unknownutil.isString(apiName)) return Promise.resolve();
      const api = ctx.apiMap[apiName];
      if (api == null) return Promise.resolve();
      return api.run(diced, args);
    },
  };

  console.log(`${denops.name}: Ready`);
  await dpsVars.g.set(denops, "diced#initialized", true);
  await denops.cmd("doautocmd <nomodeline> User DicedReady");
}
