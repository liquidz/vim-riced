import { Denops, execute, unknownutil, vars } from "./deps.ts";
import {
  BaseInterceptor,
  CompleteCandidate,
  ConnectionManager,
  Diced,
  InterceptorType,
} from "./types.ts";
import * as nreplConnect from "./nrepl/connect/core.ts";
import * as interceptor from "./interceptor/core.ts";
import {
  BufferInitializationInterceptor,
  ConnectedInterceptor,
  PortDetectionInterceptor,
} from "./interceptor/connect.ts";
import { NormalizeCodeInterceptor } from "./interceptor/eval/normalize.ts";
import { NormalizeNsPathInterceptor } from "./interceptor/ns_path.ts";
import * as nreplComplete from "./nrepl/complete.ts";
import * as cmd from "./command/core.ts";

const initialInterceptors: BaseInterceptor[] = [
  new PortDetectionInterceptor(),
  new ConnectedInterceptor(),
  new NormalizeCodeInterceptor(),
  new BufferInitializationInterceptor(),
  new NormalizeNsPathInterceptor(),
];

export class DicedImpl implements Diced {
  readonly denops: Denops;
  readonly interceptors: { [key in InterceptorType]+?: BaseInterceptor[] };
  readonly connectionManager: ConnectionManager;

  constructor(denops: Denops) {
    this.denops = denops;
    this.interceptors = {};
    this.connectionManager = new nreplConnect.ConnectionManagerImpl();

    for (const i of initialInterceptors) {
      interceptor.addInterceptor(this, i);
    }
  }
}

async function initializeGlobalVariable(
  denops: Denops,
  name: string,
  defaultValue: unknown,
) {
  const value = await vars.g.get(denops, name, defaultValue);
  await vars.g.set(denops, name, value);
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
  const diced = new DicedImpl(denops);

  denops.dispatcher = {
    async setup(): Promise<void> {
      await cmd.registerInitialCommands(diced);
      await execute(
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

    async diced(fn: unknown): Promise<void> {
      if (!unknownutil.isFunction(fn)) return Promise.resolve();
      fn(diced);
    },

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
  await vars.g.set(denops, "diced#initialized", true);
  await denops.cmd("doautocmd <nomodeline> User DicedReady");
}
