import { Denops, dpsHelper, dpsVars, unknownutil } from "./deps.ts";
import { BaseInterceptor, CompleteCandidate } from "./types.ts";
import * as interceptor from "./interceptor/mod.ts";
import * as nreplComplete from "./nrepl/complete.ts";
import * as cmd from "./command/core.ts";

import * as core from "./@core/mod.ts";

const initialInterceptors: BaseInterceptor[] = [
  new interceptor.ReadInterceptor(),
  new interceptor.PortDetectionInterceptor(),
  new interceptor.ConnectedInterceptor(),
  new interceptor.NormalizeCodeInterceptor(),
  new interceptor.BufferInitializationInterceptor(),
  new interceptor.NormalizeNsPathInterceptor(),
  new interceptor.EvaluatedInterceptor(),
];

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
  //const diced = new DicedImpl(denops);
  const diced = new core.DicedImpl(denops);

  denops.dispatcher = {
    async setup(): Promise<void> {
      await cmd.registerInitialCommands(diced);

      // add interceptors
      for (const i of initialInterceptors) {
        core.addInterceptor(diced, i);
      }

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

    async test(): Promise<void> {
      await Promise.resolve(true);
    },

    // async diced(fn: unknown): Promise<void> {
    //   if (!unknownutil.isFunction(fn)) return Promise.resolve();
    //   fn(diced);
    // },

    async command(commandName: unknown, ...args: unknown[]): Promise<void> {
      if (!unknownutil.isString(commandName)) return;
      const c = cmd.commandMap[commandName];
      if (c == null) return;
      await c.run(diced, args);
    },

    async complete(keyword: unknown): Promise<Array<CompleteCandidate>> {
      unknownutil.ensureString(keyword);
      return await nreplComplete.candidates(diced, keyword);
    },
  };

  console.log(`${denops.name}: Ready`);
  await dpsVars.g.set(denops, "diced#initialized", true);
  await denops.cmd("doautocmd <nomodeline> User DicedReady");
}
