import { Denops, dpsHelper, dpsVars, unknownutil } from "./deps.ts";
import * as core from "./core/mod.ts";
import * as mainContext from "./main/context.ts";
import * as builtin from "./builtin/mod.ts";

import * as extSelector from "./std/external/selector.ts";

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

export async function main(denops: Denops) {
  const diced = new core.DicedImpl(denops);
  const ctx = new mainContext.AppContext();

  denops.dispatcher = {
    async setup(): Promise<void> {
      // Register built-ins
      await Promise.all(
        builtin.plugins.map((p) =>
          mainContext.registerRawPlugin(diced, ctx, p)
        ),
      );
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

      console.log(`${denops.name}: Ready`);
    },

    async registerPlugin(filePath: unknown): Promise<void> {
      if (!unknownutil.isString(filePath)) return;
      await mainContext.registerPlugin(diced, ctx, filePath);
      core.sortAllInterceptors(diced);
    },

    async test(): Promise<void> {
      const res = await extSelector.start(diced, ["foo", "bar", "baz"]);
      console.log(res);
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

  console.log(`${denops.name}: Start to initialize`);
  await dpsVars.g.set(denops, "diced#initialized", true);
  await denops.cmd("doautocmd <nomodeline> User DicedReady");
}
